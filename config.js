// ====== OYUN AYARLARI ======
// Bu dosyayı GitHub'da düzenleyerek ülkeleri, hediyeleri ve müzikleri değiştirebilirsin.
//
// hediye   : O ülkeye puan veren TikTok hediyesinin İngilizce adı (Rose, TikTok, GG, Ice Cream Cone, Heart Me ...)
// kelimeler: Yorumda bunlardan biri yazılırsa ülkeye "yorumPuani" kadar puan eklenir
// hayvan   : Koşan hayvan (emoji). Tam vücut olanlar iyi durur: 🐎 🐆 🐅 🐂 🐫 🐕 🐈 🦬 🐘 🦏 🐊
// bayrak   : Bayrak emojisi. Emojisi olmayan bayraklar için boş bırak, renklerden küçük bayrak çizilir (gunes: true ortaya sarı güneş ekler)
// renkler  : Bayrak renkleri (hayvanın üstüne çizilen şeritler)
// muzik    : Öne geçince çalacak şarkı. Projeye yüklediğin dosyanın adı, ör. "turkiye.mp3".
//            Boş bırakırsan oyun her ülke için kendi küçük melodisini çalar.

window.OYUN = {
  baslik: "Türkiye mi, Kürdistan mı? Hediye at, öne geçir!",
  yorumPuani: 1,           // her ülke adı yorumu kaç puan (0 = kapalı)
  hediyeCoinIleCarp: true, // true: pahalı hediye daha çok puan verir (coin x adet)

  ulkeler: [
    { ad: "Türkiye",    bayrak: "🇹🇷", hayvan: "🐎", renkler: ["#e30a17", "#ffffff", "#e30a17"],
      hediye: "Rose",           kelimeler: ["türkiye", "turkiye", "tr", "🇹🇷"], muzik: "" },
    { ad: "Kürdistan",  bayrak: "", gunes: true, hayvan: "🦬", renkler: ["#ed2024", "#ffffff", "#278e43"],
      hediye: "Heart Me",       kelimeler: ["kürdistan", "kurdistan", "kürt", "kurd", "kurdish", "کوردستان", "kurdistane"], muzik: "" },
  ],
};
