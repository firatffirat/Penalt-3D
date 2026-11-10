# Penaltı Game

Mobil uyumlu, Three.js tabanlı 3D penaltı oyunu. İki oyuncu oda koduyla bağlanır; takım seçer, hazır olur ve her vuruşta şut atan ile kaleci yönünü gizlice seçer. Sunucu iki seçim gelmeden sonucu açıklamaz.

## Gereksinimler
- Node.js 20 veya üzeri
- npm

## Yerelde çalıştırma
```bash
npm install
npm run dev
```
Vite arayüzü ve Socket.IO sunucusu birlikte açılır. Telefonlardan aynı Wi-Fi üzerinden test etmek için Vite adresini kullanın; sunucu portu 3000'dir.

## Üretim
```bash
npm install
npm run build
npm start
```
Render için **Web Service** seçin (Static Site değil):
- Build: `npm install && npm run build`
- Start: `npm start`
- Root Directory: boş

## Oyun notları
- Saha, kale, file, tribün, ışıklar, top ve karakterler Three.js geometrileriyle yerel olarak oluşturulur.
- Ses efektleri `public/audio` içindeki WAV dosyalarıdır.
- Bu sürüm oynanabilir prototiptir. Karakterler özgün düşük poligonlu modellerdir; lisanslı kulüp armaları veya profesyonel motion-capture animasyonları içermez.
