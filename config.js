// ====== OYUN AYARLARI ======
// Bu dosyayı GitHub'da düzenleyerek ülkeleri, hediyeleri ve müzikleri değiştirebilirsin.
//
// hediye   : O ülkeye puan veren TikTok hediyesinin İngilizce adı (Rose, TikTok, GG, Ice Cream Cone, Heart Me ...)
// hediyeAdi: Ekranda yazacak hediye adı (Türkçe)
// hediyeIkon: Hediyenin simgesi: resim dosyası (ör. "gul.png") ya da emoji
// kelimeler: Yorumda bunlardan biri yazılırsa ("." gibi işaretler: yorum sadece o işaretten oluşmalı)
//            Yorumda bunlardan biri yazılırsa ülkeye "yorumPuani" kadar puan eklenir
// hayvan   : "kurt" veya "aslan"
// bayrak   : Bayrak emojisi. Emojisi olmayanlar için boş bırak, renklerden küçük bayrak çizilir
// amblem   : Hayvanın üstüne çizilen işaret: "ay" (ay yıldız), "gunes" (sarı güneş) veya ""
// renkler  : Bayrak renkleri (hayvanın üstüne çizilen şeritler)
// muzik    : Şarkıyı en kolay oyunun açılış ekranındaki "Müzik seç" butonundan telefonundan seçersin.
//            İstersen buraya projeye yüklediğin dosyanın adını da yazabilirsin, ör. "dombra.mp3".

window.OYUN = {
  baslik: "Türkiye mi, Kürdistan mı? Hediye at, öne geçir!",
  yorumPuani: 1,           // her ülke adı yorumu kaç puan (0 = kapalı)
  hediyeCoinIleCarp: true, // true: pahalı hediye daha çok puan verir (coin x adet)
  begeniTakimi: "Türkiye",  // ekrana basılan beğeniler bu takıma gider ("" = kapalı)
  begeniBasinaPuan: 50,      // kaç beğeni = 1 puan

  ulkeler: [
    { ad: "Türkiye",   bayrak: "🇹🇷", hayvan: "kurt",  renkler: ["#e30a17"], amblem: "ay",
      hediye: "Rose",     hediyeAdi: "Gül",      hediyeIkon: "gul.png", kelimeler: ["türkiye", "turkiye", "tr", "türk", "turk", "🇹🇷"], muzik: "" },
    { ad: "Kürdistan", bayrak: "",    hayvan: "aslan", renkler: ["#ed2024", "#ffffff", "#278e43"], amblem: "gunes",
      hediye: "TikTok",   hediyeAdi: "TikTok",   hediyeIkon: "tiktok.png", kelimeler: ["kürdistan", "kurdistan", "kürt", "kurd", "kurdish", "کوردستان", "kurdistane", "."], muzik: "" },
  ],
};
