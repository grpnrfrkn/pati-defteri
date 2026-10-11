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
* Bakiye ve XP ayrı bir sayı olarak tutulmaz; `ledger` toplamından hesaplanır. Tamamlama geri alınınca ilgili kayıt ters kayıtla kapatılır, toplam kendiliğinden düzelir.
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
4. **Geçmişten kalanlarda tekrarlı görevler** (öneri, onay bekliyor): yalnızca en son kaçan tekrar gösterilir ve sıradaki tekrarın günü gelince listeden düşer. Günlük rutinler bu yüzden hiç birikmez; kaçan haftalık bir iş ise bir sonraki haftaya kadar görünür. Amaç §2'deki “birikme ana ekranı bunaltmamalı” ilkesi.
5. **Bugün tamamlanan başka günün işi** (öneri, onay bekliyor): geçmişten kalan ya da tarihsiz bir iş bugün tamamlanırsa Bugün ekranında tamamlanmış olarak görünür ve günün sayacına girer.
