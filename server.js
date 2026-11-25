// TikTok canlı yayın yarış oyunu - sunucu
// Görevi: TikTok yayınına bağlanıp hediye ve yorumları oyun sayfasına anlık iletmek.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TikTokLiveConnection, WebcastEvent, ControlEvent } from 'tiktok-live-connector';

const dir = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const SIGN_KEY = process.env.EULER_API_KEY || undefined; // isteğe bağlı

// kullanıcı adı -> { conn, clients:Set, streaks:Map, durum }
const rooms = new Map();

function send(room, type, data) {
  const line = `data: ${JSON.stringify({ type, ...data })}\n\n`;
  for (const res of room.clients) res.write(line);
}

function getRoom(user) {
  if (rooms.has(user)) return rooms.get(user);
  const room = { clients: new Set(), streaks: new Map(), durum: 'baglaniyor', conn: null, retry: null };
  rooms.set(user, room);
  connect(user, room);
  return room;
}

function connect(user, room) {
  clearTimeout(room.retry);
  const conn = new TikTokLiveConnection(user, { signApiKey: SIGN_KEY, processInitialData: false });
  room.conn = conn;
  room.durum = 'baglaniyor';
  send(room, 'durum', { durum: 'baglaniyor' });

  conn.connect().then(() => {
    room.durum = 'bagli'; room.fails = 0;
    send(room, 'durum', { durum: 'bagli' });
    console.log(`[${user}] bağlandı`);
    conn.fetchAvailableGifts().then(r => {
      const list = Array.isArray(r) ? r : (r?.gifts || r?.data?.gifts || []);
      room.gifts = {};
      for (const x of list) {
        const img = x?.image?.url_list?.[0] || x?.icon?.url_list?.[0] || x?.image?.url?.[0];
        if (x?.name && img) room.gifts[String(x.name).toLowerCase()] = img;
      }
      send(room, 'hediyeler', { liste: room.gifts });
    }).catch(() => {});
  }).catch(err => {
    const msg = String(err?.message || err);
    room.fails = (room.fails || 0) + 1;
    let wait = Math.min(15000 * 2 ** (room.fails - 1), 5 * 60000);     // 15 sn, 30 sn, 1 dk, 2 dk ... en fazla 5 dk
    let durum = 'hata';
    if (/rate.?limit/i.test(msg)) { durum = 'limit'; wait = 10 * 60000; } // limit dolduysa 10 dk bekle
    else if (/online/i.test(msg)) { durum = 'hata'; wait = Math.max(wait, 30000); }
    room.durum = durum;
    room.nextTry = Date.now() + wait;
    send(room, 'durum', { durum, mesaj: msg, bekle: Math.round(wait / 1000) });
    console.log(`[${user}] bağlanamadı (${Math.round(wait / 1000)} sn sonra tekrar): ${msg.split('\n')[0]}`);
    scheduleRetry(user, room, wait);
  });

  conn.on(WebcastEvent.GIFT, d => {
    const g = d.giftDetails || {};
    const giftName = g.giftName || d.extendedGiftInfo?.name || String(d.giftId);
    const coin = g.diamondCount || d.extendedGiftInfo?.diamond_count || 1;
    const count = d.repeatCount || 1;
    // Seri (combo) hediyelerde sadece yeni gelen kısmı say, böylece hayvan anında ilerler
    const key = `${d.user?.userId}-${d.giftId}-${d.groupId}`;
    const before = room.streaks.get(key) || 0;
    const delta = Math.max(0, count - before);
    if (g.giftType === 1 && !d.repeatEnd) room.streaks.set(key, count);
    else room.streaks.delete(key);
    if (delta > 0) {
      send(room, 'hediye', {
        hediye: giftName, giftId: d.giftId, adet: delta, coin,
        resim: g.giftImage?.url?.[0] || g.icon?.url?.[0] || d.extendedGiftInfo?.image?.url_list?.[0] || '',
        kullanici: d.user?.nickname || d.user?.uniqueId || '',
      });
    }
  });

  conn.on(WebcastEvent.CHAT, d => {
    send(room, 'yorum', { yorum: d.comment || '', kullanici: d.user?.nickname || d.user?.uniqueId || '' });
  });

  conn.on(WebcastEvent.STREAM_END, () => {
    room.durum = 'bitti';
    send(room, 'durum', { durum: 'bitti' });
    scheduleRetry(user, room, 60000);
  });
  conn.on(ControlEvent.DISCONNECTED, () => {
    if (room.durum === 'bagli') { room.durum = 'koptu'; send(room, 'durum', { durum: 'koptu' }); scheduleRetry(user, room, 10000); }
  });
  conn.on(ControlEvent.ERROR, () => {});
}

function scheduleRetry(user, room, wait = 15000) {
  if (room.retry && room.retryAt && room.retryAt > Date.now()) return; // zaten bekleyen bir deneme var
  clearTimeout(room.retry);
  room.retryAt = Date.now() + wait;
  room.retry = setTimeout(() => {
    room.retry = null; room.retryAt = 0;
    if (room.clients.size === 0) { try { room.conn?.disconnect(); } catch {} rooms.delete(user); return; }
    try { room.conn?.disconnect(); } catch {}
    connect(user, room);
  }, wait);
}

const files = { '/': 'index.html', '/index.html': 'index.html', '/config.js': 'config.js' };
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4' };

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');

  if (url.pathname === '/events') {
    const user = (url.searchParams.get('user') || '').replace(/^@/, '').trim().toLowerCase();
    if (!user) { res.writeHead(400); return res.end('kullanici gerekli'); }
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    const room = getRoom(user);
    room.clients.add(res);
    res.write(`data: ${JSON.stringify({ type: 'durum', durum: room.durum })}\n\n`);
    if (room.gifts) res.write(`data: ${JSON.stringify({ type: 'hediyeler', liste: room.gifts })}\n\n`);
    if (['hata', 'bitti', 'koptu', 'limit'].includes(room.durum)) scheduleRetry(user, room, Math.max(0, (room.nextTry || 0) - Date.now()) || 15000);
    const ping = setInterval(() => res.write(': ping\n\n'), 20000);
    req.on('close', () => { clearInterval(ping); room.clients.delete(res); });
    return;
  }

  // Müzik dosyaları: projeye eklenen .mp3 / .m4a dosyalarını sunar
  let file = files[url.pathname];
  if (!file && /^\/[\w\-. ]+\.(mp3|m4a)$/i.test(decodeURIComponent(url.pathname))) file = decodeURIComponent(url.pathname).slice(1);
  if (!file) { res.writeHead(404); return res.end('yok'); }
  const full = path.join(dir, file);
  fs.readFile(full, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('yok'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT, () => console.log(`Oyun hazır: http://localhost:${PORT}`));
