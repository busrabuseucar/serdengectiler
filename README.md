# Serdengeçtiler – Genç İHH Teşkilat Yönetim Portalı

Serdengeçtiler, Genç İHH teşkilatlarında saha faaliyetlerinin düzenli şekilde toplanması, raporlanması ve yetki seviyelerine göre görüntülenmesi amacıyla geliştirilmiş web tabanlı bir MVP projesidir.

## Projenin Amacı

Genç İHH teşkilatlarında faaliyet bilgilerinin dağınık, geç ve standart dışı toplanması; merkez ve il sorumluları arasında veri takibini zorlaştırmaktadır.

Serdengeçtiler ile:

- Saha faaliyetleri dijital ortamda toplanır.
- Faaliyet bilgileri manuel veya sesli olarak girilebilir.
- Kullanıcılar görev ve yetkilerine göre farklı ekranlara erişir.
- Raporlar tek merkez üzerinden görüntülenir.
- Teşkilat performansı dashboard üzerinden takip edilir.

## Çözülen Problem

Mevcut yapıda saha verilerinin farklı kişiler ve yöntemlerle toplanması, bilgilerin geç ulaşmasına ve standart bir raporlama sisteminin oluşmamasına neden olmaktadır.

Serdengeçtiler; veri girişini, raporlamayı ve teşkilat takibini tek bir dijital sistem altında birleştirerek bu süreci daha hızlı, düzenli ve izlenebilir hâle getirir.

## Çalışan Özellikler

- Rol bazlı giriş ekranı
- Türkiye genel sorumlusu görünümü
- İl teşkilat sorumlusu görünümü
- Merkez teşkilat sorumlusu görünümü
- Manuel faaliyet girişi
- Sesli veri girişi
- Faaliyetlerin listelenmesi
- Taslak kaydetme
- Rapor kaydetme
- Dashboard ve performans göstergeleri
- Teşkilat verilerinin özetlenmesi
- Tarayıcı tarafında veri saklama
- Responsive kullanıcı arayüzü
- Vercel üzerinden canlı yayın

## Kullanılan Teknolojiler

- HTML5
- CSS3
- Vanilla JavaScript
- Web Speech API
- localStorage
- GitHub
- Vercel

Projede React, Next.js, Node.js, Firebase, Supabase veya harici bir veritabanı kullanılmamıştır.

## Veri ve Durum Yönetimi

Proje, Vanilla JavaScript ile DOM tabanlı durum yönetimi kullanmaktadır.

Demo verileri JavaScript içerisinde mock data olarak tutulmaktadır. Kullanıcı işlemleri, taslaklar ve rapor verileri tarayıcı tarafında localStorage ile saklanmaktadır.

## Proje Dosyaları

```text
serdenge-tiler/
│
├── index.html
├── style.css
├── app.js
└── README.md
Yerel Kurulum

Projeyi GitHub üzerinden klonlayın:
git clone https://github.com/busrabuseucar/serdenge-tiler.git
Proje klasörüne girin:

cd serdenge-tiler

Klasörü Visual Studio Code ile açın:

code .

index.html dosyasını Visual Studio Code üzerindeki Live Server eklentisiyle çalıştırın.

Alternatif olarak index.html dosyasını doğrudan tarayıcıda açabilirsiniz.

Projede paket yöneticisi veya build işlemi bulunmadığı için aşağıdaki komutlara ihtiyaç yoktur:

npm install
npm run dev
Canlı Demo

Projenin çalışan canlı sürümü:

https://serdenge-tiler.vercel.app

GitHub Deposu

https://github.com/busrabuseucar/serdenge-tiler

Gelecek Geliştirmeler
Gerçek backend ve merkezi veritabanı
Güvenli kullanıcı kimlik doğrulama sistemi
Çevrim dışı veri girişi
İnternet bağlantısı geldiğinde otomatik senkronizasyon
Yapay zekâ destekli teşkilat öneri motoru
Excel ve PDF dışa aktarma
Gelişmiş grafikler ve karşılaştırmalı analiz
Fotoğraf doğrulama sistemi
Türkiye haritası üzerinden interaktif il takibi
Mobil uygulama desteği
Proje Durumu

Bu proje, hackathon kapsamında çalışan bir MVP olarak geliştirilmiştir.

Geliştirici

Büşra Buse Uçar
