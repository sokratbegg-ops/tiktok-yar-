// ====== OYUN AYARLARI ======
// Bu dosyayı düzenleyerek takımları, hediyeleri ve kuralları değiştirebilirsin.
//
// hediye    : O takıma puan veren TikTok hediyesinin İngilizce adı (Rose, TikTok, GG, Heart Me ...)
// hediyeAdi : Ekranda yazacak hediye adı (Türkçe)
// hediyeIkon: Hediyenin simgesi: resim dosyası (ör. "gul.png") ya da emoji
// kelimeler : Yorumda bunlardan biri yazılırsa takıma "yorumPuani" kadar puan eklenir.
//             Yorum yazan izleyicinin beğenileri de bundan sonra o takıma sayılır.
// hayvan    : "aslan", "kurt", "kanarya" veya "kartal"
// bayrak    : Takımın yanında görünen simge (emoji)
// renkler   : Takım renkleri (hayvanın üstüne çizilen şeritler)
// muzik     : Şarkıyı oyunun açılış ekranındaki "Müzik seç" butonundan telefonundan seçersin.

window.OYUN = {
  baslik: "Hangi takım kazanır? Hediye at, takımını öne geçir!",
  yorumPuani: 1,             // takım adı yorumu kaç puan (0 = kapalı)
  hediyeCoinIleCarp: true,   // true: pahalı hediye daha çok puan verir (coin x adet)
  begeniBasinaPuan: 50,      // kaç beğeni = 1 puan (beğeniler, izleyicinin yorumda seçtiği takıma gider)

  ulkeler: [
    { ad: "Galatasaray", bayrak: "💛❤️", hayvan: "aslan",   renkler: ["#fdb912", "#a90432"],
      hediye: "Rose",     hediyeAdi: "Gül",      hediyeIkon: "gul.png",
      kelimeler: ["galatasaray", "gs", "cimbom", "cimbombom", "aslan"], muzik: "" },
    { ad: "Fenerbahçe",  bayrak: "💛💙", hayvan: "kanarya", renkler: ["#ffed00", "#13235b", "#ffed00", "#13235b"],
      hediye: "TikTok",   hediyeAdi: "TikTok",   hediyeIkon: "tiktok.png",
      kelimeler: ["fenerbahçe", "fenerbahce", "fb", "fener", "kanarya"], muzik: "" },
    { ad: "Beşiktaş",    bayrak: "🖤🤍", hayvan: "kartal",  renkler: ["#111111", "#ffffff", "#111111", "#ffffff"],
      hediye: "GG",       hediyeAdi: "GG",       hediyeIkon: "gg.png",
      kelimeler: ["beşiktaş", "besiktas", "bjk", "kartal", "karakartal"], muzik: "" },
    { ad: "Trabzonspor", bayrak: "❤️💙", hayvan: "kurt",    renkler: ["#7a1a3a", "#6cb4e4"],
      hediye: "Heart Me", hediyeAdi: "Beni Sev", hediyeIkon: "benisev.png",
      kelimeler: ["trabzonspor", "ts", "trabzon", "bordomavi"], muzik: "" },
  ],
};
