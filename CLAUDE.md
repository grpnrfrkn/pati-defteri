# Proje: Görev yönetimi + sanal kedi PWA

Tek bir kişi (geliştiricinin kız arkadaşı) için yapılan, GitHub Pages üzerinden yayınlanan bir PWA.

## Gereksinim kaynakları

* [docs/GEREKSINIMLER.md](docs/GEREKSINIMLER.md) — ürünün ana gereksinim kaynağı. Kullanıcının kendi yazdığı metindir; **içeriğini değiştirme**.
* [docs/SEVGI-NOTLARI.md](docs/SEVGI-NOTLARI.md) — geliştiricinin eklediği sevgi notları ve çiçek özelliği. Ana gereksinimlerle çelişirse ana gereksinimler geçerlidir.

Bir özelliğe başlamadan önce ilgili bölümü oku. Kabul ölçütleri GEREKSINIMLER.md §22'dedir.

## Çalışma kuralları

* Belgede kesinleşmiş kullanıcı tercihlerini kendi başına değiştirme. Ürün davranışını etkileyen kararları sor; salt teknik ayrıntılarda öneriyle ilerle.
* Karmaşık alanların (tekrarlanan görevlerin gerçekleşme kayıtları, ödüllerin iki kez verilmemesi, hesaplar arası veri güvenliği, bulut eşitleme, serbest oda düzenleme) teknik tasarımını kodlamadan önce netleştir.
* Arayüz dili Türkçe. Ton sıcak ve destekleyici; suçlayıcı, cezalandırıcı veya baskılayıcı hiçbir ifade, renk ya da mekanik kullanılmaz (§2, §20).
* Uygulama görevlerin tarihini veya önceliğini kullanıcı onayı olmadan değiştirmez.
* Repo herkese açık: koda gizli anahtar, kişisel veri veya özel not yazma.

## Barındırma

* Kullanıcının telefonu iPhone: uygulama ana ekrana eklenerek kullanılacak; bildirimler iOS'ta yalnızca bu şekilde çalışır.

* Site: GitHub Pages (statik). İlk sürümde **arka uç yok**: veriler cihazda saklanır; hesap, giriş ekranı ve parola yoktur (kullanıcı istemedi). Eşitleme, bulut ve kapalıyken bildirim ertelendi; bkz. [docs/SONRAYA-BIRAKILANLAR.md](docs/SONRAYA-BIRAKILANLAR.md). Kullanıcı istemeden bunları ekleme, ama veri yapısını sonradan eklenebilecek şekilde tut.
* Sevgi notlarının düz metni repoya girmez; yalnızca karıştırılmış hâli girer. Teknik kararlar: [docs/TEKNIK-TASARIM.md](docs/TEKNIK-TASARIM.md).
* Hedef: sürpriz ücret çıkmaması. Kredi kartı gerektiren veya kullanım aşımında otomatik ücretlendiren bir plan/servis eklemeden önce kullanıcıya sor.
