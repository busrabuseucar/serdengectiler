# İşletim ve sürüm doğrulama — Tarayıcıda saha raporlama demosu

Son inceleme: **16 Ekim 2026**. Bu belge kurulum, veri akışı, sürüm kapıları, geri dönüş ve doğrulama kapsamını birlikte kaydeder. Bir yayın adresinin açılması, tüm üretim koşullarının tamamlandığı anlamına gelmez.

## Sürüm kanıtı

- Denetlenen uygulama commit’i: `4c8953eb18c677a27168b3a2078c6a2cbef65bd2`.
- [Bu commit için başarılı CI kaydı](https://github.com/busrabuseucar/serdengectiler/actions/runs/38896210708).
- Doğrulanan otomatik kapsam: 17 DOM + 4 tarayıcı testi.
- Testlerin gerçek servis, veri veya donanım yerine taklit kullandığı noktalar aşağıda açıkça ayrılmıştır.

## Kurulum ve çalışma

Depo kökünde, README’deki çalışma zamanı sürümüyle:

```sh
npm ci
npm run build
npm test
node scripts/package-site.mjs
```

Veri akışı: Demo rolü → faaliyet doğrulama → localStorage → kayıt temelli grafik ve CSV.

Yapılandırma: Vercel çıkışı dist; vercel.json dört çalışma zamanı dosyasını paketler. npm ci ve CSS derlemesi gerekir. Harici backend/kimlik sağlayıcısı yok.

## Yayın ve geri dönüş

1. Temiz checkout ve kilitli bağımlılıklarla yukarıdaki kontrolleri çalıştır. İlgili CI başarısını commit SHA ile eşleştir.
2. Yayın paketine yalnızca çalışma zamanı dosyalarını koy. Secret, ham kullanıcı verisi, yerel veritabanı ve kişisel hazırlık notları pakete girmemeli.
3. Hedef proje, kaynak commit, ortam ve yayın sürümünü kaydet. Önceki çalışan sürüm kimliğini geri dönüş için koru.
4. Yayından sonra ana kullanıcı akışını, hata durumunu ve varsa kalıcılığı doğrula. Sunucu hatası/yanlış sonuçta yeni yazmaları durdur; önceki doğrulanmış yayını geri al.
5. Şema değiştiyse yalnızca kodu geri almak yeterli değildir. Yedekten ayrı ortamda doğrulama yapmadan canlı veri üzerine yazma.

## Veri saklama ve kurtarma

Aynı origin içinde serdengectiler.v1 saklanır. CSV dışa aktarımı vardır, CSV geri içe alma yoktur. Site verisini temizleme veya origin değişikliği veri kaybına/ayrı alana neden olur.

## Gerçek servis, model ve cihaz doğrulaması

Demo rolü güvenlik sınırı değildir. Mikrofon/Web Speech gerçek cihaz/izin testi gerektirir. Kurumsal kullanım için ortak veri tabanı ve sunucu yetkilendirmesi gerekir.

## Yayın sonrası gözlem

Önce küçük ve sentetik girdilerle temel akışı kontrol et. Beklenmeyen hata, boş ekran, yanlış hesap, yetkisiz erişim veya veri kaybında tarih, uygulama commit’i, ortam ve yeniden üretme adımlarını kaydet; kişisel veri ve secret ekleme. Statik araçlarda tarayıcı konsolu/ağ hatalarını; backend bulunan projelerde durum kodu, gecikme ve hata oranını incele. Bu belgede sürekli izleme veya otomatik geri dönüş kurulmuş olduğu iddia edilmez.

## Kabul kaydı

Her yeni sürümün kaydı; test komutu/sonucu, kaynak SHA, yayın sürümü, gerçek servis/model sürümü, cihaz/işletim sistemi, veri kümesi özeti ve geri dönüş denemesini içermeli. Erişim veya fiziksel donanım yoksa ilgili satır **çalıştırılmadı** olarak tutulur; otomatik test başarısı yerine geçirilmez.
