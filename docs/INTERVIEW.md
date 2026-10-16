# Teknik kararlar ve sınırlar

## Anlatılabilecek mühendislik kararları

- Küçük bir statik prototipte framework yerine DOM tabanlı arayüz. HTML ile davranış kodu ayrı dosyalara taşındı.
- Taslaklar demo rolüne göre ayrılır; raporlar aynı tarayıcıdaki veri kümesindedir. Yeni kayıt ve taslak temizliği tek localStorage yazısıyla kaydedilir.
- Önce doğrulama ve depolama, sonra bellek/ekran güncellemesi: depolama hatasında kullanıcının formu ve önceki raporları korunur.
- Veri şeması sürümlüdür. Bozuk veya tanınmayan verinin sessizce üzerine yazılmaz.
- Kullanıcı değerleri HTML şablonuna kaçışlanır; veri kaynağının tarayıcı depolaması olması onu güvenilir yapmaz.
- CSV uzantısı gerçek içeriğe uygundur; tırnaklar çiftlenir, formül başlangıçları metne çevrilir.
- Grafiklerde tahmini geçmiş yerine tarihli kayıtların toplamı kullanılır. Kategori dağılımı toplanmadığı için gösterilmez.
- Uygulanmamış fotoğraf sayımı ve otomatik çözümleme artık başarı sonucu taklit etmez.

## Önceki sorunlar

Taslak düğmesi yalnızca mesaj gösteriyordu. Raporlar bellekte kalıp yenilemede kayboluyordu. Grafiklerin geçmişi üretiliyor, fotoğraf akışı rastgele sayı atıyordu. İstemci filtresi IDOR koruması gibi sunuluyordu. CSV, XLS uzantısıyla indiriliyordu. README'nin dosya listesi ve kod bloğu yapısı yanlıştı.

## Canlı sisteme geçişte açık işler

Gerçek kimlik doğrulama, backend veritabanı, her istekte rol/şehir denetimi, audit log, yedekleme ve veri saklama politikası gerekir. localStorage merkezi bir raporlama altyapısı değildir; kötü amaçlı kullanıcıdan veriyi korumaz. Eşzamanlı yazma kontrolü en iyi çabadır, transaction değildir.

Sesli yazım gerçek mikrofon ve hedef tarayıcıyla ayrıca denenmelidir. Otomatik alan çıkarımı ve bilgisayarlı görü bu sürümde uygulanmış özellik değildir. Bunları mülakatta yapılmış gibi anlatma.

## Gösterim

Bir rol seç, form doldur, taslağı kaydet, yenile ve tekrar aç. Raporu kaydet; kaydı düzenle ve CSV indir. Negatif adet deneyerek reddedildiğini göster. Son olarak yerel demo ile sunucu tarafından korunan gerçek sistem arasındaki farkı anlat.
