# Serdengeçtiler — Saha Raporlama Demosu

Genç İHH saha faaliyeti raporlama akışını gösteren HTML, CSS ve Vanilla JavaScript prototipi. Rol görünümü, manuel faaliyet girişi, tarayıcıda taslak/kayıt saklama, düzenleme/silme ve kayıt verisine dayalı grafikler içerir.

**Bu sürüm yerel demodur.** Gerçek kimlik doğrulama, sunucu tarafı yetkilendirme, ortak veritabanı veya kurumlar arası senkronizasyon içermez. Gerçek kişisel veri girilmemelidir. İlk açılıştaki beş faaliyet örnek veridir.

## Çalıştırma

Depoyu klonlayıp kökünde yerel HTTP sunucusu başlat:

~~~bash
git clone https://github.com/busrabuseucar/serdengectiler.git
cd serdengectiler
python3 -m http.server 5174 --bind 127.0.0.1
~~~

Windows'ta python3 yerine python kullanabilirsin. http://127.0.0.1:5174 adresini aç; bir demo rolü seçip **Demoyu Aç** düğmesine bas. Dosyayı file:// üzerinden açmak yerine localhost kullan: güvenli bağlam API'leri ve depolama davranışı buna göre test edilir.

Uygulamayı incelemek için npm veya API anahtarı gerekmez. Derlenmiş Tailwind CSS depoda bulunur. Font Awesome ikonları CDN'den gelir; bağlantı yoksa ikonlar eksik kalabilir, düğme metinleri ve temel işlevler çalışır.

## Özelliklerin gerçek durumu

| Özellik | Durum |
|---|---|
| Türkiye / Siirt / Ankara demo rolü | Ekran ve şehir filtresi; güvenlik sınırı değildir |
| Manuel faaliyet girişi | Kurum, takvim tarihi ve tam sayı adet doğrulaması |
| Taslak kaydetme | Aynı tarayıcı ve seçili demo rolü altında geri yüklenir |
| Rapor ekleme / düzenleme / silme | localStorage'a kaydedilir; yenilemede korunur |
| Grafikler | Seçilen bitiş tarihine kadar kayıtlar; son 5 adet 7 günlük dilim ve son 6 ay |
| Katılımcı kategori dağılımı | Kategori verisi toplanmadığı için ölçülmüyor |
| Karne göstergesi | Katılımcı / (faaliyet × 10); yalnızca demo hesabı, resmi performans formülü değil |
| CSV dışa aktarma | Şehir/birim/kurum filtreleri uygulanır; Excel ile açılabilir, gerçek XLSX değildir |
| PDF | Tarayıcı yazdırma penceresinden PDF'ye kaydetme |
| Sesli yazım | Tarayıcı Web Speech desteğine ve mikrofon iznine bağlı |
| Otomatik metin çözümleme / öneri | Bağlı değil; manuel giriş kullanılmalı |
| Fotoğrafla yüz/katılımcı sayımı | Uygulanmadı; rapora otomatik sayı yazılmaz |

Sesli yazım tarayıcı/sağlayıcı üzerinden işlenebilir; tamamen yerel veya çevrim dışı çalıştığı iddia edilmez. Mikrofon gerçek cihazda ayrıca doğrulanmalıdır.

## Saklama ve veri güvenliği

Kayıtlar yalnızca bu tarayıcının bu origin'inde, serdengectiler.v1 anahtarında saklanır. Farklı cihaz, tarayıcı, port ve alan adı ayrı depolamadır. Çerez/site verilerini silmek kayıtları siler. Düzenli CSV dışa aktarımı yapılabilir; CSV bu sürümde tekrar içe alınamaz.

- Taslak ve raporlar tek sürümlü JSON belgesine yazılır.
- Depolama dolu/kapalıysa başarı mesajı verilmez ve form korunur.
- Bozuk saklı veri sessizce silinmez; üzerine yazmak engellenir.
- Başka sekmenin fark edilen değişikliğinin üzerine yazılması engellenir. localStorage işlemleri veritabanı işlemi değildir; eşzamanlı sekmelerde tam transaction garantisi yoktur.
- Kullanıcı metinleri HTML bağlamına kaçışlanır; CSV hücrelerinde tırnaklar ve formül başlangıçları işlenir.
- Demo rol filtresi konsoldan değiştirilebilir. Üretim yetkilendirmesi için backend ve sunucu tarafı erişim denetimi gerekir.

## Geliştirme ve test

Node.js 22+:

~~~bash
npm ci
npm run build
npm test
npx playwright install chromium
npm run test:e2e
~~~

DOM testleri saklama/yenileme, CRUD, geçersiz veriler, depolama hatası, metin enjeksiyonu, şehir filtresi ve CSV davranışını kontrol eder. Playwright gerçek tarayıcıda masaüstü ve mobil görünümde taslak → yenileme → kayıt → düzenleme → silme ve CSV indirmeyi test eder. Mikrofon/donanım testi içermez.

Dosyalar: index.html (arayüz), app.js (durum/işlevler), styles/ (yerel CSS), tests/ ve e2e/ (testler).

[Teknik Tasarım ve Kararlar](docs/TECHNICAL_DESIGN.md)

Geliştirici: **Büşra Buse Uçar**
