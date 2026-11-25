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
    room.durum = 'bagli';
    send(room, 'durum', { durum: 'bagli' });
    console.log(`[${user}] bağlandı`);
  }).catch(err => {
    room.durum = 'hata';
    const msg = String(err?.message || err);
    send(room, 'durum', { durum: 'hata', mesaj: msg });
    console.log(`[${user}] bağlanamadı: ${msg}`);
    scheduleRetry(user, room);
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
        kullanici: d.user?.nickname || d.user?.uniqueId || '',
      });
    }
  });

  conn.on(WebcastEvent.CHAT, d => {
    send(room, 'yorum', { yorum: d.comment || '', kullanici: d.user?.nickname || d.user?.uniqueId || '' });
  });

  conn.on(WebcastEvent.STREAM_END, () => {
    send(room, 'durum', { durum: 'bitti' });
    scheduleRetry(user, room);
  });
  conn.on(ControlEvent.DISCONNECTED, () => {
    if (room.durum === 'bagli') { room.durum = 'koptu'; send(room, 'durum', { durum: 'koptu' }); scheduleRetry(user, room); }
  });
  conn.on(ControlEvent.ERROR, () => {});
}

function scheduleRetry(user, room) {
  clearTimeout(room.retry);
  room.retry = setTimeout(() => {
    if (room.clients.size === 0) { try { room.conn?.disconnect(); } catch {} rooms.delete(user); return; }
    try { room.conn?.disconnect(); } catch {}
    connect(user, room);
  }, 15000);
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
    if (room.durum === 'hata' || room.durum === 'bitti' || room.durum === 'koptu') scheduleRetry(user, room);
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
