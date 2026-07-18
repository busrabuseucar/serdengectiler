# Serdengeçtiler – Genç İHH Teşkilat Yönetim Portalı

Serdengeçtiler, Genç İHH teşkilatlarında saha verilerinin düzenli şekilde toplanması, raporlanması ve yetki seviyelerine göre görüntülenmesi amacıyla geliştirilmiş bir web tabanlı MVP projesidir.

## Projenin Amacı

Genç İHH teşkilatlarında faaliyet bilgilerinin dağınık, geç ve standart dışı toplanması; merkez ve il sorumluları arasında veri takibini zorlaştırmaktadır.

Bu proje ile:

- Saha faaliyetlerinin dijital ortamda toplanması
- Sesli veya manuel veri girişi yapılması
- Rol bazlı erişim sağlanması
- Raporların tek merkezden görüntülenmesi
- Teşkilat performansının dashboard üzerinden takip edilmesi

amaçlanmıştır.

## Çalışan Özellikler

- Rol bazlı giriş ekranı
- Türkiye genel sorumlusu görünümü
- İl teşkilat sorumlusu görünümü
- Merkez teşkilat sorumlusu görünümü
- Manuel faaliyet girişi
- Sesli veri girişi
- Faaliyetlerin listelenmesi
- Taslak ve rapor kaydetme
- Dashboard ve performans göstergeleri
- Teşkilat verilerinin özetlenmesi
- Tarayıcı üzerinde localStorage ile veri saklama
- Responsive kullanıcı arayüzü

## Kullanılan Teknolojiler

- HTML5
- CSS3
- Vanilla JavaScript
- Web Speech API
- localStorage
- Vercel

Projede React, Next.js, Node.js veya harici bir veritabanı kullanılmamıştır.

## Veri Yönetimi

Proje bir MVP olduğu için gerçek bir backend ve merkezi veritabanı kullanılmamıştır.

Demo verileri JavaScript içerisinde mock data olarak tutulmaktadır. Kullanıcı işlemleri, taslaklar ve rapor verileri tarayıcı tarafında localStorage ile yönetilmektedir.

## Yerel Kurulum

Projeyi bilgisayarınıza klonlayın:

```bash
git clone https://github.com/busrabuseucar/serdenge-tiler.git

Proje klasörüne girin:

cd serdenge-tiler

Klasörü Visual Studio Code ile açın:

code .

index.html dosyasını Visual Studio Code üzerindeki Live Server eklentisiyle çalıştırın.

Alternatif olarak index.html dosyasını doğrudan tarayıcıda açabilirsiniz.

Projede paket yöneticisi veya build işlemi bulunmadığı için npm install ve npm run dev komutlarına ihtiyaç yoktur.

Canlı Demo

Projenin çalışan canlı sürümü:

https://serdenge-tiler.vercel.app

Gelecek Geliştirmeler
Gerçek backend ve merkezi veritabanı
Güvenli kullanıcı kimlik doğrulama sistemi
Çevrim dışı veri girişi ve otomatik senkronizasyon
Yapay zekâ destekli teşkilat öneri motoru
Excel ve PDF dışa aktarma
Gelişmiş grafikler ve karşılaştırmalı analiz
Fotoğraf doğrulama sistemi
Türkiye haritası üzerinden interaktif il takibi
Mobil uygulama desteği
Proje Durumu

Bu proje hackathon kapsamında çalışan bir MVP olarak geliştirilmiştir.

Geliştirici

Büşra Buse Uçar
