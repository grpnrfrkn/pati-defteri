# Teknik Tasarım (ilk sürüm, arka uçsuz)

[GEREKSINIMLER.md](GEREKSINIMLER.md) §23 gereği karmaşık alanların tasarımı kodlamadan önce burada netleştirilir. Kapsam dışı bırakılanlar: [SONRAYA-BIRAKILANLAR.md](SONRAYA-BIRAKILANLAR.md).

## Araçlar

* Vite + React + TypeScript, PWA için `vite-plugin-pwa`.
* Veri: cihazda IndexedDB (Dexie ile).
* Sürükle-bırak: `dnd-kit` (dokunmatik ve fare).
* Testler: Vitest. Tekrar ve ödül kuralları arayüzden bağımsız saf fonksiyonlar olarak yazılır ve test edilir.
* Yayın: GitHub Actions ile GitHub Pages. Hepsi ücretsiz.

## Veri yapısı

Her kayıtta `id` (rastgele, kalıcı), `updatedAt` ve `deletedAt` bulunur (sonradan eşitleme için).

| Tablo | İçerik |
| --- | --- |
| `tasks` | ad, not, kategori?, planlanan tarih? (boş = tarihsiz), son teslim tarihi?, tekrar kuralı?, öncelik, tahmini süre?, zorluk? (boş = belirtilmemiş), hatırlatma |
| `subtasks` | görev, ad, sıra, tamamlanma zamanı? |
| `occurrences` | bir görevin belirli bir güne ait **gerçekleşmesi**: asıl gün, şu an planlandığı gün, durum (bekliyor / tamamlandı / atlandı), tamamlanma zamanı |
| `events` | görev geçmişi: oluşturma, tamamlama, geri alma, tarih değişikliği, erteleme, atlama |
| `ledger` | XP ve pati hareketleri (kazanç, harcama, geri alma) |
| `categories`, `cat`, `inventory`, `room`, `settings`, `dayReviews` | kategoriler, kedi, satın alınanlar, oda yerleşimi, ayarlar, Günü Toparla durumu |

## Tekrarlanan görevler

* Tekrar kuralı görevde durur; günler kuraldan **hesaplanır**, önceden üretilmez.
* Bir gerçekleşmenin kimliği `görev + asıl gün`dür. Kayıt yalnızca o güne dokunulduğunda (tamamlama, atlama, taşıma) yazılır.
* Bu yüzden: geç tamamlamak sonraki günü kaydırmaz, bir tekrarı atlamak veya ertelemek diğerlerini etkilemez, her gerçekleşmenin geçmişi ayrıdır.
* Tek seferlik görevler de aynı yapıyı kullanır (tek gerçekleşme).

## Ödüllerin iki kez verilmemesi

* Her ödülün kimliği, neye verildiğinden türetilir: `gorev:<gerçekleşme>`, `altgorev:<alt görev>`, `bitirme:<gerçekleşme>`. Aynı kimlikle ikinci kayıt yazılamaz.
* Bakiye ve XP ayrı bir sayı olarak tutulmaz; `ledger` toplamından hesaplanır. Her değişiklikten sonra gerçekleşmenin ödül kayıtları durumuyla eşitlenir: hak edilen ama olmayan kayıt eklenir, artık hak edilmeyen kayıt silinir. Böylece tamamlamayı geri almak da, geri almayı geri almak da toplamı kendiliğinden düzeltir.
* Satın alma, bakiyeyi kontrol eden ve envantere ekleyen tek bir işlemdir; çift dokunuş ikinci satın almayı oluşturmaz.
* Ödül miktarları tek bir yapılandırma dosyasındadır.

## Oda düzenleme

* Eşya konumları piksel değil, odanın genişlik ve yüksekliğine **oran** olarak saklanır; oda sabit en-boy oranıyla çizilir. Böylece yerleşim her ekranda aynı görünür.
* Sürükleme sırasında konum oda sınırlarına kırpılır; zemin eşyaları zemine, duvar eşyaları duvara yerleşir.

## Sevgi notları

* Uygulamada parola veya giriş ekranı yoktur (kullanıcı istemedi).
* Notların düz metin dosyası `.gitignore` içindedir. Bir komut notları karıştırıp yayınlanan dosyayı üretir; uygulama açılışta çözer. Bu gizleme şifreleme değildir, yalnızca repoda okunaklı durmasını engeller.

## Cihazda saklamanın gerekleri

* Uygulama ana ekrana eklenerek kullanılır; iPhone ana ekrandaki uygulamaların verisini kendiliğinden silmez. Ek olarak kalıcı saklama izni istenir.
* Kaydedilemeyen bir işlem kaydedilmiş gibi gösterilmez (§18).

## Verilen ürün kararları

Gereksinimde açık olmayan, davranışı etkileyen kararlar:

1. **Bugün ekranında bölümleme** (onaylandı): yüksek öncelikli görevler (tekrarlansa bile) “Öncelikli işler”de; kalan tekrarlı görevler “Rutinler”de; diğer her şey “Diğer işler”de.
2. **Alt görevler bitince** (onaylandı): ana görev kendiliğinden tamamlanmaz; “Hepsi bitti, görevi tamamlayalım mı?” diye sorulur.
3. **Yedekleme** (onaylandı): Diğer > Yedekleme altında elle “yedek al / yedekten yükle”.
4. **Geçmişten kalanlarda tekrarlı görevler** (onaylandı): yalnızca en son kaçan tekrar gösterilir ve sıradaki tekrarın günü gelince listeden düşer. Günlük rutinler bu yüzden hiç birikmez; kaçan haftalık bir iş ise bir sonraki haftaya kadar görünür. Amaç §2'deki “birikme ana ekranı bunaltmamalı” ilkesi.
5. **Bugün tamamlanan başka günün işi** (onaylandı): geçmişten kalan ya da tarihsiz bir iş bugün tamamlanırsa Bugün ekranında tamamlanmış olarak görünür ve günün sayacına girer.

## Aşama 2 notları

* **Süre ve zorluk filtresi:** süresi ya da zorluğu belirtilmemiş görevler ölçüte "uyuyor" sayılmaz, sessizce de elenmez. Varsayılan olarak gizlenir, kaç tanesinin bu yüzden gizli olduğu yazılır ve tek dokunuşla gösterilebilir. Enerji filtresi yalnızca görünümü daraltır; hiçbir görevi değiştirmez.
* **Hatırlatmalar:** uygulama açıkken, saati gelen ve o gün bekleyen işler için ekranda gösterilir. Saati bir saatten fazla geçmiş hatırlatma gösterilmez. Kapalıyken bildirim ertelenenler arasındadır.
* **Günü Toparla:** gün sonu saati (varsayılan 21:00) Diğer > Ayarlar'dan değişir. Saat geldiğinde uygulama açıksa kendiliğinden açılır; "Daha sonra" denirse bir saat boyunca kendiliğinden gelmez. Bir gün kapatılmadan geçtiyse ve bekleyen iş kaldıysa ertesi açılışta o gün için sunulur. Özetteki XP ve pati parası Aşama 3'te eklenecek.
* **Takvim:** günler `itemsForDate` ile hesaplanır; tarihsiz görevler takvimde görünmez.

## Aşama 3 notları

* **Ödül miktarları:** `src/domain/rewards.ts` içindeki `REWARDS`. Süre girilmemiş görev 10 XP; 5 dk 6, 10 dk 8, 15 dk 10, 30 dk 15, 60 dk 22, daha uzunu 30 XP. Orta zorluk ×1,3, zor ×1,6. Pati, XP'nin yarısı (en az 3). Alt görev başına 3 XP ve 1 pati. Görev ayrıntısında ve Kedim sayfasında kullanıcıya gösterilir.
* **Seviyeler:** seviye N için toplam `20·N·(N−1)` XP (40, 120, 240, 400 …). Yavru 1–4, genç 5–9, yetişkin 10+. Büyüme yalnızca XP'ye bağlıdır.
* **Kedi:** ad, tüy rengi, göz rengi ve desen `meta` içinde tek kayıttır; çizim bu değerlerden ve aşamadan üretilen bir SVG'dir, bu yüzden görünüm aşamalar arasında korunur. Kedi oluşturulmadan kazanılan XP birikir ve sahiplenince onun olur.
* **Etkileşimler:** sev, besle, oyna, uyut baştan açık; "gerin" gençken, "yuvarlan" yetişkinken açılır. Hiçbiri ödül vermez. Açlık, mutsuzluk, ihmal gibi bir durum hiç tutulmaz.
* **Kutlamalar:** küçük görevde bildirim satırı ve işaret animasyonu; büyük görevde (alt görevli, uzun vadeli ya da 60 dk ve üzeri) ve seviye atlamada 3 saniyelik, dokunmayı engellemeyen kutlama.
* **Sesler:** tarayıcıda üretilir; Kedim sayfasından kapatılabilir.

## Aşama 4 notları

* **Katalog:** `src/domain/shop.ts` içindeki `CATALOG` (33 eşya: aksesuar, mobilya, duvar kâğıdı, halı, oyuncak, dekorasyon). Fiyatlar ve seviye kilitleri oradan değişir. Denge: bir görev yaklaşık 5 pati; küçük eşyalar 15–35, büyükler 60–90, seviye kilitli özel eşyalar 100–150 pati.
* **Satın alma ve envanter:** sahiplik ayrı bir tabloda tutulmaz; `satin:<eşya>` kimlikli ödeme kaydının kendisidir. Bu yüzden ödenmeden sahip olunamaz, ödenen eşya kaybolamaz, aynı eşya iki kez alınamaz. Bakiye ve seviye kontrolü ödemeyle aynı işlemde yapılır. Satın alma bildiriminden geri alınabilir (para iade edilir, eşya odadan kalkar).
* **Seviye kilidi:** kilitli eşya mağazada fiyatıyla görünür; seviyeye ulaşınca satın alınabilir olur, ücretsiz verilmez.
* **Oda:** `meta` içinde tek kayıt (duvar kâğıdı, halı, takılı aksesuarlar, yerleştirilen eşyalar). Oda 4:3 oranında çizilir; eşya konumları ve boyutları odaya orandır. Yüklenirken sahip olunmayan ya da bilinmeyen eşyalar atılır ve konumlar yeniden sınırlanır.
* **Yerleştirme:** eşya alt-orta noktasından konumlanır; zemin eşyaları zemin bandında, duvar eşyaları duvar bandında kalır (`clampPosition`). Derinlik sırası dikey konumdan gelir: aşağıdaki eşya öndedir. Halı ve duvar kâğıdı serbest yerleştirilmez, seçilir.
* **Çizim:** mobilya, oyuncak ve dekorasyonlar çıkartma görünümünde emoji olarak çizilir (cihazın emoji yazı tipiyle). Aksesuarlar kedinin SVG'sine eklenir. Özel çizimler Aşama 5'te ele alınabilir.
* Eşyalar sürükleyerek ya da odaklanıp ok tuşlarıyla taşınır.

## Aşama 5 notları

* **Görsel dil:** `src/styles.css` sonundaki "Aşama 5" bölümü. Başlıklarda washi bant ve çiçek çıkartması, not kâğıtlarında bant, hafif kâğıt dokusu, el yazısı başlık yazı tipi (cihazda yüklü olanlardan: iPhone'da Noteworthy). Dış yazı tipi ya da görsel dosyası yüklenmez; süslemeler CSS ve gömülü SVG'dir.
* **Okunabilirlik önce gelir:** görev satırları ve formlar düz sistem yazı tipinde kalır; öncelik ve durum renge ek olarak metin ve simgeyle gösterilir; dokunma alanları en az 44 pikseldir; hareket azaltma tercihi açıksa animasyonlar kapanır.
* **iPhone kurulumu:** ana ekrana eklenen uygulamanın verisi Safari sekmesindekinden ayrıdır. Bu yüzden Safari sekmesinde açıldığında ilk açılış ekranında ve Bugün'de "önce ana ekranına ekle" uyarısı gösterilir.
* **Pati hareketleri:** Diğer menüsünde XP ve pati kayıtlarının listesi.
