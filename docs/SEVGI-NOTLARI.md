# Sevgi Notları ve Çiçekler

> Bu özellik [GEREKSINIMLER.md](GEREKSINIMLER.md) belgesinde yoktur; uygulamayı yapan kişinin (sevgilisi) eklediği bir sürprizdir. Ana gereksinimlerle çelişirse ana gereksinimler geçerlidir.

## Amaç

Uygulamanın çeşitli yerlerinde, onu sevdiğimi hatırlatan küçük ibareler görünsün. Abartılı ya da araya giren bir şey değil; fark edince gülümseten ufak dokunuşlar.

## Nerelerde görünür

* **İlk açılışta / günün ilk açılışında:** kısa bir karşılama notu.
* **Görev tamamlandıktan sonra:** her seferinde değil, ara sıra, tamamlama animasyonunun yanında kısa bir not.
* **Günü Toparla ekranında:** günün özetiyle birlikte bir not.
* **Büyük kutlamalarda:** uzun bir görev bittiğinde veya kedi seviye atladığında daha özel bir not.
* **Sakin yerlerde:** boş liste ekranı, yükleme anı, Kedim sayfası gibi yerlerde arada bir.

## Sevgi sözcükleri kütüphanesi

Notlar tek bir kütüphanede tutulur ve bağlama göre **rastgele** seçilir.

* Her notun bir **bağlamı** vardır: `acilis`, `gorev-tamamlandi`, `buyuk-kutlama`, `gun-sonu`, `genel`.
* Aynı not art arda gelmemeli; yakın zamanda gösterilenler bir süre tekrar seçilmemeli.
* Kütüphaneye yeni not eklemek kolay olmalı (tek bir yerden).
* Notların son hâlini ben yazacağım / onaylayacağım. Aşağıdakiler yalnızca ton örneğidir.

### Ton örnekleri (taslak)

| Bağlam | Örnek |
| --- | --- |
| acilis | “Günaydın güzelim, bugün de yanındayım 🌷” |
| acilis | “Hoş geldin. Seni düşünen biri var 💜” |
| gorev-tamamlandi | “Aferin sana, seninle gurur duyuyorum 🐾” |
| gorev-tamamlandi | “Bir tane daha! Canımsın.” |
| buyuk-kutlama | “Bunu başardın ya… Seni çok seviyorum 💐” |
| gun-sonu | “Bugün ne yaptıysan yeter. İyi ki varsın.” |
| genel | “Bu arada: seni seviyorum.” |

## Çiçek verme

Uygulama benim adıma ona çiçek verir. Çiçekleri ben anlık göndermem; uygulamayı kullanırken **rastgele zamanlarda** karşısına çıkar. Benim için ayrı bir hesap veya gönderme ekranı yoktur.

* Çiçek, uygulamada küçük bir sürpriz olarak karşısına çıkar (ör. “Sana bir çiçek var 🌷”), isteğe bağlı kısa bir notla birlikte.
* Gelen çiçekler bir yerde birikebilir (ör. bir vazo / çiçek defteri) veya kedinin odasına konabilir.

## Uyulması gereken kurallar

* Notlar hiçbir zaman baskı kurmamalı, görev yapmaya zorlamamalı veya yapılmayan işlere gönderme yapmamalı. Sevgi, performansa bağlı görünmemeli: görev tamamlanmayan günlerde de not çıkar.
* Notlar akışı kesmemeli; kapatmak için ekstra dokunuş gerektirmemeli.
* Sıklık ayarlı olmalı; her dokunuşta not çıkarsa etkisi kaybolur.
* Çiçekler ve notlar XP veya pati parası kazandırmaz (pati parası yalnızca görevlerden gelir).

## Gizlilik

Uygulamada parola yok (kullanıcı istemedi), bu yüzden notlar gerçek anlamda şifrelenemez. Yapılan şey göz önünden kaldırmaktır:

* Notların düz metni yalnızca benim bilgisayarımda durur ve repoya gönderilmez.
* Repoya ve siteye, notların karıştırılmış (okunaksız kodlanmış) hâli konur. Repoya göz atan biri notları okuyamaz; uygulama açılınca çözer.
* Bu bir şifre değildir: uğraşan biri uygulamanın kodundan çözme yöntemini bulup notları okuyabilir. Kabul edilmiş bir risktir.
* Not eklemek veya değiştirmek için: düz metin dosyasını düzenle, yeniden kodla, yayınla.

## Açık kararlar

* **Hitap:** notlarda ona nasıl seslenileceği (isim, lakap).

## Nasıl çalışıyor (uygulanan hâli)

* Notların düz metni `notlar/sevgi-notlari.json` dosyasındadır; bu klasör `.gitignore` içindedir.
* Not ekledikten ya da değiştirdikten sonra `npm run notlar` çalıştırılır; bu, repoya giren `src/data/notlar.ts` dosyasını yeniden üretir. Sonra commit ve push.
* Düz metin dosyası kaybolursa `npm run notlar:coz` onu kodlanmış dosyadan geri üretir.
* Sıklıklar `src/ui/love.ts` ve `src/ui/complete.ts` içindedir:
  * Açılış notu günde bir kez seçilir ve o gün Bugün ekranının üstünde durur; dokununca kapanır.
  * Görev tamamlanınca dörtte bir ihtimalle bildirimin altında bir not çıkar.
  * Büyük kutlamada ve Günü Toparla'da her seferinde bir not vardır.
  * Kedim sayfasında yaklaşık üç girişten birinde bir not görünür.
  * Bir bağlamda son gösterilen üç not tekrar seçilmez.
* Çiçekler: uygulama açıldığında ya da bir görev tamamlandığında dörtte bir ihtimalle, ama en az iki gün arayla gelir. Gelen çiçekler notlarıyla birlikte Kedim sayfasında "Çiçeklerim" altında birikir.
* Aynı anda tek sürpriz gösterilir: büyük kutlama, not ya da çiçek.

**Durum (11 Ekim 2026):** kütüphanede iki kaynak var: benim yazdığım 50 not ve mesajlarımızdan yola çıkarak Gemini'ye yazdırıp gözden geçirdiğim bağlama özel notlar. Zamanla artırılacak.

Bağlamlar: `acilis`, `gorev-tamamlandi`, `buyuk-kutlama`, `seviye` (kedi seviye atlayınca), `gun-sonu`, `cicek`, `genel`.

* Bağlama özel notlar az olabildiği için uygulama her seferinde yarı yarıya bağlamın kendi notlarından, yarı yarıya `genel` notlardan seçer.
* Kedinin seviye atladığını söyleyen notlar yalnızca `seviye` bağlamındadır; büyük bir iş bittiğinde seviye atlanmamış olabilir.
* `gun-sonu` notları gece içindir ("iyi uykular" gibi). Geçmiş bir günün toparlaması ertesi gün yapılırsa `genel` not gösterilir.
* Not taşıyan bildirim 9, not taşıyan kutlama 8 saniye ekranda kalır.
