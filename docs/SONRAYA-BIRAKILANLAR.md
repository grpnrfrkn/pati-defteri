# Sonraya Bırakılanlar

İlk sürüm arka uç servisi olmadan, yalnızca GitHub Pages üzerinde çalışacak. Bu yüzden [GEREKSINIMLER.md](GEREKSINIMLER.md) içindeki aşağıdaki istekler **iptal edilmedi, ertelendi**. Karar tarihi: 11 Ekim 2026.

## Ertelenen istekler

| İstek | Gereksinimdeki yeri | İlk sürümde ne olacak |
| --- | --- | --- |
| Telefon ve bilgisayarda aynı verilerin görünmesi | §2, §18, §19 (oda yerleşimi), kabul ölçütü 17 | Her cihaz kendi verisini tutar. Tek cihazda (iPhone) kullanılacağı varsayılır. |
| Uygulama kapalıyken bildirim (görev hatırlatması, akşam Günü Toparla bildirimi) | §9, §10 | Hatırlatmalar yalnızca uygulama açıkken ekranda gösterilir. Gün sonu saati uygulama kapalıyken geçtiyse Günü Toparla bir sonraki açılışta sunulur. |
| Verilerin bulutta saklanması | §18 | Veriler cihazın tarayıcı hafızasında durur. |
| Kullanıcı hesabı (hesap oluşturma / giriş) | §3 (Ayarlar ve hesap), §17 adım 1, §18 | Hesap ve giriş ekranı yok; parola da yok (kullanıcı istemedi). Uygulama doğrudan açılır. |

## Bilinen risk

Veriler yalnızca telefonda durduğu için uygulama silinirse, tarayıcı verileri temizlenirse veya telefon değişirse görevler, kedi, pati parası ve oda kaybolur. Bunu azaltmak için Ayarlar'a elle **yedek al / yedekten yükle** (tek dosya) eklenmesi önerilir.

## Geri dönüldüğünde

* Bunların hepsi tek bir arka uç servisiyle çözülür. Daha önce önerilen: Supabase ücretsiz planı (kart istemez).
* Veri yapısı baştan buna uygun tutulur: her kaydın kalıcı bir kimliği ve son değişiklik zamanı vardır, silmeler işaretlenerek yapılır. Böylece sonradan eşitleme eklemek için veriyi baştan kurmak gerekmez.
* iPhone'da kapalı uygulamaya bildirim, yalnızca uygulama ana ekrana eklenmişse ve bir sunucu gönderiyorsa çalışır.
