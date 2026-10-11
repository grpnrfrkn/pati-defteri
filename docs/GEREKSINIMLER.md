# Kişisel Görev Yönetimi ve Sanal Kedi Uygulaması — Gereksinimler

> Bu belge ürünün **ana gereksinim kaynağıdır**. Metin, uygulamayı kullanacak kişinin yazdığı talimatların birebir kaydıdır; içerik değiştirilmemiştir, yalnızca başlıklar Markdown biçimine çevrilmiştir.
> Sonradan eklenen sevgi notları ve çiçek özelliği için bkz. [SEVGI-NOTLARI.md](SEVGI-NOTLARI.md).

## 1. Projenin amacı

Kişisel görevleri, günlük rutinleri, ev işlerini, iş sorumluluklarını ve uzun vadeli planları tek bir yerden yönetebileceğim; aynı zamanda görev tamamladıkça sanal bir kediyi büyütüp yaşam alanını dekore edebileceğim, mobil ve masaüstünde kullanılabilen bir web uygulaması geliştirilmesini istiyorum.

Uygulama, özellikle dikkat dağınıklığı, işe başlama güçlüğü, zaman yönetimi ve değişken enerji düzeyleri yaşayan birinin günlük hayatını kolaylaştıracak şekilde tasarlanmalı.

Temel yaklaşım şu olmalı: Uygulama beni zorlayan, cezalandıran veya suçlu hissettiren bir sistem değil; işleri daha küçük, görünür ve yönetilebilir hâle getiren, ilerlememi fark etmemi sağlayan destekleyici bir yardımcı olmalı.

Görsel kimlik journal ve sticker estetiğinde, lila, açık pembe ve kırık beyaz ağırlıklı, sıcak ve sevimli ama aşırı çocukça olmayan bir tarzda olmalı.

## 2. Temel tasarım ilkeleri

* Görev eklemek ve tamamlamak mümkün olduğunca az işlem gerektirmeli.
* Hiçbir görev için gereksiz alanların doldurulması zorunlu olmamalı.
* Uygulama benim yerime sessizce görevlerin tarihini veya önceliğini değiştirmemeli.
* Tamamlanmayan görevler başarısızlık olarak sunulmamalı.
* Erteleme ve atlama işlemleri cezalandırılmamalı.
* Günlük görevlerin birikmesi ana ekranı bunaltıcı hâle getirmemeli.
* Kullanıcı kararları, otomatik önerilerden öncelikli olmalı.
* Sanal kediyle ilgilenmek zorunluluk değil, keyifli bir etkileşim olmalı.
* Veriler cihazlar arasında eşitlenmeli.
* Mobil ve masaüstü kullanım ayrı ayrı düşünülmeli.

## 3. Uygulamanın ana bölümleri

Uygulamada şu temel bölümler bulunmalı:

1. Bugün
2. Görevler
3. Takvim
4. Kedim
5. Mağaza
6. Envanter ve oda düzenleme
7. Görev geçmişi
8. Günü Toparla
9. Ayarlar ve hesap

Mobilde alt sabit gezinme menüsü kullanılmalı. Ana sekmeler Bugün, Görevler, Kedim, Mağaza ve Diğer olabilir. Takvim, geçmiş ve ayarlar gibi bölümlere uygun menülerden erişilebilmeli.

Masaüstünde sol tarafta bir gezinme menüsü bulunmalı. Aynı özellikler her iki ekran boyutunda da erişilebilir olmalı.

## 4. Görev sistemi

### 4.1. Görev türleri

Görevler şu zaman yapılarında oluşturulabilmeli:

* Günlük görevler
* Haftalık görevler
* Aylık görevler
* Uzun vadeli görevler
* Belirli tarihe planlanmış tek seferlik görevler
* Tarihsiz görevler

Görevlerin ayrı listelerde görüntülenmesi mümkün olmalı. Bunun yanında o güne ait görevleri birleştiren merkezi bir Bugün ekranı bulunmalı.

Tarihsiz görevler kullanıcı planlayana kadar kendi listesinde kalmalı; otomatik olarak Bugün ekranına eklenmemeli.

### 4.2. Görev kategorileri

Başlangıçta şu kategoriler sunulabilir:

* Ev
* Kişisel bakım
* İş
* Kediler
* Hobiler

Kategoriler sonradan eklenebilmeli, yeniden adlandırılabilmeli ve düzenlenebilmeli. Her görev bir kategoriye bağlanabilmeli; kategori seçimi zorunlu olmamalı.

Kategori silindiğinde içindeki görevler silinmemeli. Gerekirse kategorisiz hâle getirilmeli veya başka kategoriye aktarılabilmeli.

### 4.3. Hızlı görev ekleme

Ana ekranın kolay erişilebilir bir yerinde sürekli görülebilen bir + düğmesi bulunmalı.

Hızlı eklemede yalnızca görev adı ve zaman seçimi yeterli olmalı.

Örnek:

Görev: Çamaşırları makineye at
Zaman: Bugün

Hızlı zaman seçenekleri:

* Bugün
* Yarın
* Tarihsiz

Görev birkaç saniyede kaydedilebilmeli. Hızlı eklenen görevler varsayılan olarak tek seferlik ve normal öncelikli olabilir. Diğer ayrıntılar sonradan düzenlenebilmeli.

Görev Bugün için eklenmişse anında Bugün ekranında görünmeli.

### 4.4. Ayrıntılı görev ekleme

Ayrıntılı görev oluşturma ekranında şu alanlar bulunmalı:

* Görev adı
* Açıklama veya not
* Kategori
* Planlanan tarih
* Gerekliyse son teslim tarihi
* Tekrar kuralı
* Öncelik
* Tahmini süre
* Zorluk seviyesi
* Alt görevler
* Bildirim açık/kapalı
* Bildirim saati

Görev adı dışındaki alanlar genel olarak isteğe bağlı olmalı.

Planlanan tarih ile kesin son teslim tarihi ayrı kavramlar olarak tutulmalı. Bir görevi başka güne planlamak, varsa gerçek son teslim tarihini kendiliğinden değiştirmemeli.

### 4.5. Görev öncelikleri

Üç öncelik seviyesi kullanılmalı:

* Düşük
* Normal
* Yüksek

Önceliği kullanıcı manuel olarak seçmeli.

Uygulama yaklaşan son teslim tarihleri veya geciken önemli işler için öncelik yükseltme önerisi sunabilmeli. Ancak kullanıcının onayı olmadan öncelik değiştirmemeli.

Örnek öneri:

“Bu görevin son teslim tarihi yarın. Önceliğini yükseltmek ister misin?”

Seçenekler:

* Yüksek yap
* Böyle kalsın

Öneriler sık tekrarlanmamalı ve kolayca kapatılabilmeli.

### 4.6. Görevlerin tahmini süresi

Tahmini süre alanı isteğe bağlı olmalı.

Önerilen hızlı seçimler:

* 5 dakika
* 10 dakika
* 15 dakika
* 30 dakika
* 60 dakika

Özel süre girme seçeneği de bulunmalı.

Süre belirtilmeyen görevler normal şekilde kullanılabilmeli ve ödül kazanabilmeli.

Tahmini süre, gerçek çalışma süresiyle karıştırılmamalı. Kullanıcı görevi tamamlamak için zamanlayıcı kullanmaya zorlanmamalı.

### 4.7. Zorluk seviyesi

Görevler kolay, orta veya zor olarak işaretlenebilmeli.

Zorluk, öncelikten bağımsız olmalı.

Örneğin:

* Elektrik faturasını ödemek: Kolay ama yüksek öncelikli
* Gardırobu düzenlemek: Zor ama düşük öncelikli

Zorluk belirtilmeyen görevler otomatik olarak kolay kabul edilmemeli; belirtilmemiş olarak saklanmalı.

### 4.8. Alt görevler

Büyük görevler küçük parçalara ayrılabilmeli.

Örnek ana görev: Gardırobu düzenle

Alt görevler:

* Askılıktaki kıyafetleri düzenle
* Kazakları ayır
* Çekmeceleri yerleştir
* Kullanılmayan kıyafetleri ayır

Her alt görev bağımsız işaretlenebilmeli.

Ana görevin ilerlemesi bir ilerleme çubuğunda gösterilmeli.

Örnek: 2/4 alt görev tamamlandı — %50

Yarım kalan ilerleme korunmalı. Kullanıcı ertesi gün devam ettiğinde daha önce tamamladığı parçaları yeniden yapmak zorunda kalmamalı.

Alt görevlerin tamamlanması ana görevi otomatik olarak tamamlandı sayabilir; ancak bu davranış açık ve tutarlı olmalı. Gerekirse kullanıcıya ana görevi tamamlama onayı gösterilebilir.

### 4.9. Tekrarlanan görevler

Tekrarlanan görevler sabit takvim günlerine göre planlanmalı.

Örnek:

Nevresimleri değiştir
Kategori: Ev
Tekrar: Her pazar
Tahmini süre: 15 dakika
Öncelik: Normal

Görev bir hafta pazartesi tamamlanmış olsa bile sonraki tekrar yine pazar günü görünmeli.

Desteklenmesi gereken tekrar türleri:

* Her gün
* Belirli hafta günleri
* Her hafta
* Her ay belirli tarih
* İhtiyaç duyulursa özel tekrar kuralı

Bir tekrarın atlanması veya ertelenmesi gelecek tekrarları silmemeli ya da bütün serinin tarihini kaydırmamalı.

Her planlı tekrar ayrı bir gerçekleşme kaydı olarak izlenmeli.

Tekrarlanan görevler her planlı tamamlanışta normal XP ve pati ödülünü kazandırmalı.

## 5. Bugün ekranı

Bugün ekranı uygulamanın en önemli kullanım alanı olmalı.

Üç ana bölüm bulunmalı:

1. Öncelikli işler
2. Rutinler
3. Diğer işler

Bu bölümler ayrı başlıklar altında gösterilmeli ve açılıp kapatılabilmeli.

Öncelikli işler bölümünde kullanıcının öncelikli olarak işaretlediği görevler, rutinlerde tekrar eden alışkanlık ve rutin görevleri, diğer işlerde o güne ait kalan görevler gösterilmeli.

Bir görev aynı anda iki bölümde iki ayrı tamamlanabilir kayıt olarak görünmemeli. Bölümleme kuralları açık ve tutarlı olmalı.

Görevler elle sürüklenerek sıralanabilmeli. Seçilen sıralama kaydedilmeli ve uygulama yeniden açıldığında korunmalı.

Otomatik öncelik önerileri kullanıcının manuel sıralamasını değiştirmemeli.

Bugün ekranında:

* Görev tamamlanabilmeli.
* Görev ayrıntıları açılabilmeli.
* Hızlı görev eklenebilmeli.
* Tamamlanan görev sayısı görülebilmeli.
* Gerektiğinde görevler filtrelenebilmeli.
* Geçmişten kalan görevler ayrı bir alandan açılabilmeli.

### 5.1. Geçmişten kalan görevler

Bugün ekranında başlangıçta kapalı duran küçük bir alan bulunmalı.

Örnek başlık:

“Geçmişten kalan 3 görev”

Bu alana dokunulduğunda geçmişte planlanmış ancak henüz tamamlanmamış veya hakkında karar verilmemiş görevler açılmalı.

Her görev için eski planlanan tarih gösterilmeli.

Örnek:

“Kitaplığı temizle — 8 Ekim’den kaldı”

Geçmiş görevler otomatik olarak bugünün görevleri arasına taşınmamalı.

Kullanıcı şu işlemleri yapabilmeli:

* Yarına taşı
* Başka tarihe planla
* Bu seferlik atla
* Tarihsiz / daha sonra planlanacak listeye al
* Olduğu gibi bırak

Bu işlemler görev geçmişine kaydedilmeli.

Görevler çoğaldığında tarih, kategori ve öncelik filtreleri kullanılabilmeli.

## 6. Takvim

Aylık ve haftalık takvim görünümleri bulunmalı.

Takvimde:

* Planlanmış görevler
* Tekrarlanan görevler
* Tamamlanan görevlerin durumu
* İlgili günün görev sayısı

görülebilmeli.

Bir güne dokunulduğunda o günün görev listesi açılmalı.

Kullanıcı takvim üzerinden görev ekleyebilmeli veya görev tarihini değiştirebilmeli.

Tarih değişiklikleri görev geçmişinde izlenmeli.

Tarihsiz görevler takvimde rastgele bir güne yerleştirilmemeli.

## 7. Arama ve filtreler

Görev adıyla arama yapılabilmeli.

Ayrıca şu filtreler bulunmalı:

* Kategori
* Tarih veya tarih aralığı
* Tamamlanma durumu
* Öncelik
* Tahmini süre
* Zorluk
* Tekrarlanan / tek seferlik görevler

Birden fazla filtre birlikte kullanılabilmeli.

Örnek:

Ev kategorisi + tamamlanmamış + 15 dakika veya daha kısa + kolay

Filtre sonuçları boşsa uygulama suçlayıcı olmayan sade bir mesaj göstermeli.

## 8. Enerji ve süreye göre görev seçme

Kullanıcı istediğinde düşük enerjili günler için görev filtreleme özelliğini açabilmeli.

İki ayrı ölçüt kullanılmalı:

* Tahmini süre
* Zorluk seviyesi

Örnek süre seçenekleri:

* 5 dakika veya daha az
* 15 dakika veya daha az
* 30 dakika veya daha az
* Süre fark etmez

Zorluk seçenekleri:

* Kolay
* Orta
* Zor
* Hepsi

Bu özellik günlük zorunlu bir ruh hâli anketine dönüşmemeli.

Süresi veya zorluğu belirtilmemiş görevlerin nasıl ele alındığı kullanıcıya açık olmalı. Filtre dışında kalan görevler silinmemeli ve her zaman yeniden görüntülenebilmeli.

## 9. Bildirimler

Bildirimlerin dili tatlı, samimi, sıcak ve destekleyici olmalı.

Örnek:

“Minik bir hatırlatma 🌷 Çamaşırları makineye atma zamanı!”

Her görev için:

* Bildirim açma / kapatma
* Bildirim saati belirleme

özellikleri bulunmalı.

Bildirim izni kullanıcıdan uygun zamanda istenmeli.

Bildirimler yargılayıcı, tehditkâr veya baskılayıcı olmamalı.

Örnek olarak “Yine yapmadın”, “Bugünkü başarısızlığın” gibi ifadeler kesinlikle kullanılmamalı.

## 10. Günü Toparla

Her akşam otomatik olarak Günü Toparla akışı sunulmalı.

Gün sonu saati ayarlanabilir olmalı.

Uygulama açıksa belirlenen saatte Günü Toparla ekranı gösterilmeli. Uygulama kapalıysa uygun bildirim gönderilebilmeli; kullanıcı yeniden giriş yaptığında bekleyen değerlendirme sunulabilmeli.

Ekranın açılması, kullanıcıyı işlemi bitirmeye zorlamamalı. Kapatma ve daha sonra devam etme seçenekleri bulunmalı.

### 10.1. Gün sonu özeti

Şu bilgiler gösterilmeli:

* Tamamlanan görev sayısı
* Tamamlanmayan görevler
* O gün kazanılan XP
* O gün kazanılan pati parası

Kedi küçük bir kutlama veya sıcak bir animasyonla ekrana eşlik edebilmeli.

### 10.2. Tamamlanmamış görevleri yönetme

Her bekleyen görev için şu seçenekler sunulmalı:

* Yarına taşı
* Başka tarihe planla
* Bu seferlik atla
* Daha sonra planla / tarihsiz listeye al
* Şimdilik karar verme

Örnek:

Çamaşırları katla → Yarına taşı
Kitap oku → Bu seferlik atla
Dolabı düzenle → Daha sonra planla

Toplu işlem yapılabilmeli. Örneğin birkaç görev birlikte yarına taşınabilmeli.

Yanlışlıkla yapılan değişiklikler geri alınabilmeli.

Tekrarlanan bir görevin tek bir gerçekleşmesini atlamak, gelecek tekrarları etkilememeli.

Atlanan veya ertelenen görevlerden tamamlanma ödülü verilmemeli; ancak puan silme, ceza veya kedinin olumsuz etkilenmesi gibi sonuçlar da olmamalı.

## 11. Görev geçmişi

Görevler için ayrıntılı geçmiş tutulmalı.

Geçmişte şunlar görülebilmeli:

* Görevin oluşturulması
* Tamamlanma tarihi
* Son tamamlanma tarihi
* Bir sonraki planlanan tarih
* Erteleme işlemleri
* Tarih değişiklikleri
* Atlanan tekrarlar
* Geri alınan işlemler

Kullanıcı daha önce tamamladığı bir görevi sonradan kaydedebilmeli ve gerçek tamamlanma tarihini seçebilmeli.

Geçmiş kayıtları, özellikle tekrarlanan görevlerde her gerçekleşmeyi birbirinden ayırmalı.

Tamamlama geri alındığında görev durumu ve ödül kayıtları tutarlı şekilde güncellenmeli.

## 12. Sanal kedi sistemi

Uygulamanın oyunlaştırma unsuru, kullanıcıya ait bir sanal kedi olmalı.

Kedi bir görev cezası mekanizması değil, ilerlemeyi keyifli hâle getiren sanal bir arkadaş olmalı.

### 12.1. Kediyi sahiplenme

İlk açılışta görev sistemi öncelikli olacak. Kedi sahiplenme zorunlu ilk adım olmayacak.

Kullanıcı hazır olduğunda kedisini oluşturabilecek.

Özelleştirme seçenekleri:

* Tüy rengi
* Göz rengi
* Tüy deseni
* Kediye isim verme

Bu tercihler kaydedilmeli.

### 12.2. Büyüme sistemi

Kedi XP kazandıkça gelişmeli.

Büyüme aşamaları:

* Yavru
* Genç
* Yetişkin

Büyüme yalnızca görsel boyut değişikliği olmamalı. Yeni hareketler, animasyonlar ve davranışlar da açılmalı.

Kedinin büyümesi geçen gün sayısına değil, görevlerden kazanılan XP’ye bağlı olmalı.

Başlangıçta seçilen tüy rengi, göz rengi ve desen büyüme aşamalarında korunmalı.

### 12.3. Kediyle etkileşim

Kullanıcı şu etkileşimleri gerçekleştirebilmeli:

* Kediyi sevme ve okşama
* Besleme
* Oyuncaklarla oynama
* Uyutma
* Farklı davranışlarını izleme

Kedi etkileşimlere uygun animasyon, mimik ve seslerle tepki vermeli.

Örneğin okşandığında mırlayabilir, oyuncakla oynarken zıplayabilir, uyutulduğunda kıvrılıp yatabilir.

Etkileşimler pati parası kazandırmamalı. Pati parası yalnızca görevlerden elde edilmeli.

Kediyi beslemek, sevmek veya uyutmak zorunlu olmamalı. Uzun süre uygulama açılmadığında kedi aç kalmamalı, hastalanmamalı, üzülmemeli veya kullanıcıya karşı olumsuz davranmamalı.

## 13. XP ve pati parası

İki ayrı ödül birimi kullanılmalı.

### 13.1. XP

Deneyim puanı, kedinin seviye atlamasını ve büyümesini sağlamalı.

XP harcanan bir para birimi olmamalı; birikimli ilerleme göstergesi olmalı.

### 13.2. Pati parası

Pati parası görev tamamlandığında kazanılmalı.

Mağazadan ürün satın almak için kullanılmalı.

Pati parası bakiyesi ve işlem geçmişi saklanmalı.

### 13.3. Puan hesaplama

Ödüller görevin tahmini süresi ve zorluk seviyesine göre hesaplanmalı.

Kısa ve kolay görevler de mutlaka ödül kazandırmalı.

Süre girilmemiş görevler ödülsüz kalmamalı.

Ödül hesabı tutarlı ve kullanıcı açısından anlaşılır olmalı.

Kesin XP ve pati miktarları geliştirme sırasında dengelenebilir. Başlangıç değerleri sabit kurallar veya yapılandırma üzerinden kolayca değiştirilebilir olmalı.

### 13.4. Alt görev ödülleri

Her tamamlanan alt görev küçük miktarda XP ve pati kazandırmalı.

Ana görev tamamen bittiğinde ayrıca bitirme ödülü verilmeli.

Aynı alt görev için iki kez ödül verilmemeli. Ana görev tamamlandığında alt görev ödülleri ikinci kez hesaplanmamalı.

### 13.5. Tekrarlanan görev ödülleri

Tekrarlanan görevlerin her planlı gerçekleşmesi tamamlandığında normal ödül kazandırmalı.

Sırf görev tekrar ediyor diye ödülü azaltılmamalı.

Aynı gerçekleşmenin iki kez tamamlanması iki ayrı ödül oluşturmamalı.

### 13.6. Kutlamalar

Küçük görevler tamamlandığında sade ve kısa animasyonlar kullanılmalı.

Büyük görevlerde, uzun projelerin bitiminde ve seviye atlamalarında daha özel kutlamalar gösterilmeli.

Kutlamalar uygulamanın kullanımını kesintiye uğratacak kadar uzun olmamalı.

## 14. Mağaza

Mağazada pati parasıyla satın alınabilen şu ürünler bulunmalı:

* Kedi aksesuarları
* Mobilyalar
* Duvar kâğıtları
* Halılar
* Oyuncaklar
* Çeşitli dekorasyonlar

Ürünlerin bir kısmı başlangıçtan itibaren açık olmalı.

Bazı özel ürünler belirli seviyelere ulaşıldığında açılmalı.

Seviyenin açılması ürünün ücretsiz verildiği anlamına gelmemeli; açılan ürün pati parasıyla satın alınabilmeli.

### 14.1. Mağaza dengesi

Ekonomi dengeli olmalı.

Küçük aksesuarlar birkaç görev tamamlanarak alınabilecek kadar erişilebilir olmalı.

Büyük veya özel eşyalar bir miktar birikim gerektirmeli.

Ancak sistem aşırı uzun süre görev tamamlama zorunluluğu yaratmamalı.

### 14.2. Satın alma ve envanter

Satın alınan ürünler kullanıcının envanterine eklenmeli.

Bir kez satın alınan kalıcı eşya tekrar para ödenmeden kullanılabilmeli.

Ürün takılabilmeli, çıkarılabilmeli veya oda içinde başka yere taşınabilmeli.

Satın alma işlemleri kaydedilmeli; bağlantı hataları veya çift tıklamalar nedeniyle aynı işlem yanlışlıkla iki kez yapılmamalı.

## 15. Kedi odası ve dekorasyon

Kedinin kendine ait bir odası bulunmalı.

Oda başlangıçta sade ve kullanılabilir olmalı. Kullanıcı yeni ürünler satın aldıkça odayı geliştirebilmeli.

Oda düzenleme sistemi serbest yerleştirmeyi desteklemeli.

Kullanıcı:

* Mobilyaları sürükleyip yerleştirebilmeli.
* Eşyaların konumunu değiştirebilmeli.
* Eşyaları kaldırabilmeli.
* Halı ve duvar kâğıdını değiştirebilmeli.
* Satın aldığı dekorasyonları tekrar kullanabilmeli.

Yerleşim kaydedilmeli ve cihazlar arasında eşitlenmeli.

Mobilde dokunarak ve sürükleyerek; masaüstünde fareyle rahat kullanılabilmeli.

Yerleştirme sırasında eşyaların oda dışına taşmasını veya kullanılamaz yerlere gitmesini önleyen anlaşılır sınırlar bulunmalı.

## 16. Görsel tasarım

Ana estetik journal ve sticker olmalı.

Renkler:

* Lila
* Açık pembe
* Kırık beyaz

Yardımcı tonlar ana palete uyumlu seçilmeli.

Tasarım öğeleri:

* Defter sayfasını andıran yüzeyler
* Yuvarlatılmış kartlar
* Minik çiçek stickerları
* Washi tape detayları
* Hafif kâğıt dokuları
* Sevimli ama okunaklı ikonlar
* Yumuşak geçiş animasyonları

Görünüm süslü olsa da işlevsellikten ödün verilmemeli.

Özellikle uzun görev listelerinde okunabilirlik, kontrast, dokunma alanları ve sade düzen öncelikli olmalı.

Görevlerin öncelik ve durumları yalnızca renkle anlatılmamalı; metin veya ikonla da anlaşılmalı.

## 17. İlk açılış deneyimi

İlk kullanım sırası şöyle olmalı:

1. Hesap oluşturma veya giriş yapma
2. Görev sistemini tanıma
3. Düzenlenebilir örnek görevleri görme
4. İstenilen örnek görevleri seçme, değiştirme veya kaldırma
5. Bugün ekranını kullanmaya başlama
6. İstenildiğinde kediyi oluşturma

Kedi oluşturma görevlere başlamanın ön koşulu olmamalı.

### 17.1. Örnek görevler

Başlangıçta ev, kişisel bakım, kediler ve hobiler gibi kategorilerde düzenlenebilir örnekler sunulmalı.

Örnekler kullanıcının onayı olmadan zorunlu görev olarak yüklenmemeli.

Örnek görevler düzenlenebilir, silinebilir ve istenirse tamamen atlanabilir olmalı.

## 18. Hesap ve bulut eşitleme

Uygulamada kullanıcı hesabı bulunmalı.

Telefon ve bilgisayarda aynı hesapla giriş yapılabilmeli.

Şu bilgiler bulutta saklanmalı:

* Görevler
* Kategoriler
* Tekrar kuralları
* Alt görevler
* Öncelikler ve sıralamalar
* Tamamlama ve değişiklik geçmişi
* Bildirim tercihleri
* Kedi özelleştirmesi
* XP ve seviyeler
* Pati parası bakiyesi
* Satın alınan ürünler
* Envanter
* Oda yerleşimi

Bir cihazdaki değişiklik diğer cihazda görünmeli.

Çevrimdışı kullanım zorunlu değil. İnternet bağlantısı gerekli olabilir.

Bağlantı olmadığında kullanıcı anlaşılır biçimde bilgilendirilmeli. Kaydedilemeyen bir işlem başarıyla kaydedilmiş gibi gösterilmemeli.

Hesap verileri başka kullanıcıların erişimine kapalı tutulmalı.

## 19. Önemli veri ve işlem kuralları

Geliştirme sırasında şu durumlar özellikle doğru ele alınmalı:

* Tekrarlanan görevlerin her gerçekleşmesi ayrı takip edilmeli.
* Bir tekrarın atlanması diğer tekrarları silmemeli.
* Görev ertelemesi geçmiş kaydını kaybettirmemeli.
* Geçmişten kalan görevler otomatik olarak bugüne taşınmamalı.
* Alt görev ilerlemesi korunmalı.
* Aynı tamamlama işlemine iki kez ödül verilmemeli.
* Ödül geri alma işlemleri kayıtlarla tutarlı olmalı.
* Satın alınan eşyalar envanterden kaybolmamalı.
* Kedinin görünümü büyüme aşamalarında korunmalı.
* Oda yerleşimi farklı cihazlarda aynı görünmeli.
* Uygulama kapalıyken gün sonu saati geçmişse kullanıcı tekrar açtığında değerlendirme sunulabilmeli.
* Bir görev atlandığında veya ertelendiğinde kullanıcı cezalandırılmamalı.
* Bildirimlerin kapatılması görevlerin planlanmasını etkilememeli.

## 20. Uygulamanın duygusal tonu

Bu uygulamanın en önemli özelliklerinden biri, kullanıcının kendisini nasıl hissettirdiği olmalı.

Kullanıcı bütün görevlerini tamamlayamadığında uygulama:

* Kızmamalı.
* Suçlayıcı ifadeler kullanmamalı.
* Kediyi mutsuz göstermemeli.
* Puan cezası uygulamamalı.
* Tamamlanmamış görevleri devasa bir kırmızı uyarı alanına dönüştürmemeli.

Bunun yerine, tamamlanan işleri görünür kılmalı ve kalan işler için kolay karar seçenekleri sunmalı.

Örnek ifadeler:

“Bugün yaptıklarına bir bakalım 🌷”

“Bunları başka bir güne planlamak ister misin?”

“Minik bir adım da ilerlemedir 🐾”

“Bugünlük burada bırakabiliriz.”

Kaçırılan günler veya bozulan seriler üzerinden suçluluk yaratan bir oyunlaştırma sistemi kullanılmamalı.

## 21. Geliştirme yaklaşımı

Uygulama aşamalı olarak geliştirilebilir ancak temel mimari daha sonra eklenecek özellikleri desteklemeli.

Önerilen sıra:

### Aşama 1 — Görev yönetiminin temeli

Hesap, kategoriler, hızlı ve ayrıntılı görev ekleme, Bugün ekranı, tekrarlar, öncelikler, alt görevler ve temel geçmiş.

### Aşama 2 — Planlama ve değerlendirme

Takvim, arama, filtreler, enerji filtresi, bildirimler, geçmiş görev yönetimi ve Günü Toparla.

### Aşama 3 — Sanal kedi ve ödüller

Kedi oluşturma, XP, seviyeler, büyüme, pati parası, etkileşimler ve kutlamalar.

### Aşama 4 — Mağaza ve oda

Ürünler, envanter, satın alma, seviye kilitleri, serbest oda düzenleme.

### Aşama 5 — Son düzenlemeler

Journal/sticker görsel dili, animasyonlar, mobil uyumluluk, veri eşitleme testleri, performans ve kullanılabilirlik iyileştirmeleri.

Bu sıralama bir geliştirme önerisidir; özelliklerin kapsamını değiştirmez.

## 22. Kabul ölçütleri

Uygulama tamamlandı sayılmadan önce en az şu senaryolar sorunsuz çalışmalı:

1. “Çamaşırları makineye at” görevi yalnızca ad ve Bugün seçilerek eklenebilmeli.
2. Görev Bugün ekranının doğru bölümünde görünmeli.
3. Kullanıcı görevleri sürükleyerek sıralayabilmeli.
4. Haftalık bir görev geç tamamlandığında sonraki planlı günü kaymamalı.
5. Atlanan bir tekrar gelecek tekrarları etkilememeli.
6. Geçmiş görevler ayrı açılır alanda görünmeli.
7. Günü Toparla üzerinden görev yarına taşınabilmeli veya atlanabilmeli.
8. Tamamlanmış alt görevler korunmalı ve ilerleme doğru hesaplanmalı.
9. Süre ve zorluk filtresi birlikte çalışmalı.
10. Görev tamamlandığında doğru XP ve pati kazanılmalı.
11. Aynı görev tamamlanması iki kez ödül oluşturmamalı.
12. Kullanıcı kedisinin tüy, göz ve desen özelliklerini seçebilmeli.
13. Kedi seviye atladığında görünümü ve özelleştirmesi korunmalı.
14. Kediyle oynama veya besleme pati parası kazandırmamalı.
15. Ürün satın alındığında envantere eklenmeli.
16. Oda dekorasyonu serbestçe düzenlenip kaydedilebilmeli.
17. Telefon ve bilgisayarda aynı hesap verileri görüntülenebilmeli.
18. Akşam Günü Toparla akışı sunulmalı ve ertelenebilmeli.
19. Uygulama kullanılmadığında kedi olumsuz etkilenmemeli.
20. Hiçbir görev atlama veya erteleme işlemi cezalandırıcı sonuç doğurmamalı.

## 23. Claude ile geliştirme için son yönerge

Bu belgeyi ürünün ana gereksinim kaynağı olarak kullan.

Önce uygulamanın ekranlarını, bileşenlerini, veri yapısını ve kullanıcı akışlarını planla. Ardından uygulanabilir geliştirme aşamalarına ayır.

Özellikle tekrar eden görevlerin geçmişi, ödül işlemlerinin iki kez uygulanmaması, hesaplar arası veri güvenliği, bulut eşitleme ve serbest oda dekorasyonu gibi karmaşık alanların teknik tasarımını kodlamadan önce netleştir.

Belgede kesinleştirilmiş kullanıcı tercihlerini kendi başına değiştirme.

Belirtilmeyen teknik ayrıntılar için uygulanabilir öneriler sunabilirsin; ancak ürün davranışını etkileyen önemli kararları kullanıcıya sor.

Amaç yalnızca güzel görünen bir görev listesi değil; günlük hayatta gerçekten kullanılabilecek, güvenilir, sıcak, kişiselleştirilebilir ve keyifli bir uygulama geliştirmek.
