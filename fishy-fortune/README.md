# 🐟 Fishy Fortune - Pixel Art Fishing Gacha 🎮

🎮 Game gacha memancing PIXEL ART yang retro untuk Farcaster! Dapatkan ikan biasa, langka, atau **LEGENDARY** dengan sistem reward token! 🐠✨

## 🎮 Cara Bermain

1. Klik tombol "🎣 Mulai Memancing!"
2. Tonton animasi pancing yang menarik
3. Dapatkan hasil: Ikan Biasa (70%), Ikan Langka (25%), atau Ikan Legendary (5%)
4. Legendary memberi bonus token!
5. Bagikan hasil ke feed Farcaster

## 🛠️ Teknologi

- **Vanilla JavaScript** - Tanpa framework, best practices dari awal
- **HTML5 Canvas** - Animasi PIXEL ART pancing yang retro
- **CSS3** - Styling modern dengan pixel-perfect effects dan responsive design
- **Farcaster Mini App SDK** - Integrasi penuh dengan Farcaster
- **Pixel Art Style** - Aesthetic retro gaming yang viral

## 📁 Struktur Proyek

```
fishy-fortune/
├── index.html          # HTML utama dengan embed meta tags
├── styles.css          # CSS dengan best practices
├── game.js            # Logika game lengkap
├── .well-known/
│   └── farcaster.json # Manifest untuk publishing
└── README.md          # Dokumentasi ini
```

## 🚀 Setup & Development

### Prerequisites

- Node.js 22.11.0 atau lebih baru
- Domain untuk hosting (diperlukan untuk mini app Farcaster)

### Langkah Setup

1. **Clone atau download proyek ini**

2. **Update manifest dengan domain Anda:**
   ```json
   // .well-known/farcaster.json
   {
     "accountAssociation": {
       // Dapatkan dari https://farcaster.xyz/~/developers/mini-apps/manifest
       "header": "YOUR_HEADER",
       "payload": "YOUR_PAYLOAD",
       "signature": "YOUR_SIGNATURE"
     },
     "miniapp": {
       "iconUrl": "https://YOUR_DOMAIN/icon.png",
       "homeUrl": "https://YOUR_DOMAIN",
       // ... update semua URL dengan domain Anda
     }
   }
   ```

3. **Upload gambar yang diperlukan:**
   - `icon.png` (200x200px) - Icon app
   - `og-image.png` (1200x630px) - OpenGraph image
   - `hero-image.png` - Hero image untuk app store
   - `screenshot1-3.png` - Screenshots untuk app store

4. **Deploy ke domain Anda**

5. **Test di Farcaster:**
   - Gunakan [Mini App Preview Tool](https://farcaster.xyz/~/developers/mini-apps/preview)
   - Masukkan URL app Anda

## 🎯 Fitur

### ✅ Sudah Diimplementasi

- **Animasi Canvas**: Tali pancing turun dengan efek visual PIXEL ART retro
- **Sistem Gacha**: Random weighted dengan probabilitas yang tepat
- **Reward Token**: Legendary memberi bonus token
- **Persistent State**: Statistik tersimpan di localStorage
- **Share ke Feed**: Integrasi dengan Farcaster composeCast
- **Responsive Design**: Mobile-first dengan accessibility
- **Error Handling**: Robust error handling dan fallback
- **Farcaster Integration**: SDK ready() dan composeCast

### 🔮 Rekomendasi Fitur Masa Depan

1. **Leaderboard Global**
   - Papan peringkat pemain dengan token terbanyak
   - Integrasi dengan database backend
   - Reward mingguan untuk top players

2. **Multiple Fishing Sessions**
   - Sistem stamina/energy
   - Cooldown antara fishing
   - Daily rewards untuk login rutin

3. **Social Features**
   - Lihat hasil teman di feed
   - Challenge sistem antar pemain
   - Guild/clan system

4. **Economy System**
   - Shop untuk upgrade equipment
   - Rare items dengan NFT integration
   - Token staking untuk passive income

5. **Advanced Gacha**
   - Seasonal events dengan rate-up
   - Collection system lengkap
   - Trade system antar pemain

6. **Mini-Games**
   - Timing-based fishing untuk bonus multiplier
   - Boss fights dengan ikan besar
   - Tournament mode

7. **Cross-Platform**
   - Web3 wallet integration
   - Token bridging ke blockchain
   - Multi-chain support

8. **Analytics & Monetization**
   - User behavior tracking
   - Premium features dengan subscription
   - Affiliate system untuk referral

## 🎨 Best Practices Diimplementasi

- **Modular Code**: Fungsi terpisah dengan single responsibility
- **Error Handling**: Try-catch di semua async operations
- **Performance**: Canvas optimization, event delegation
- **Accessibility**: Keyboard navigation, screen reader support
- **Security**: Input validation, XSS prevention
- **Mobile-First**: Responsive design dengan touch support
- **Progressive Enhancement**: Fallback untuk fitur yang tidak didukung

## 📊 Probabilitas Gacha

```javascript
const FISH_TYPES = {
  common: { probability: 0.7, tokenReward: 0 },    // 70%
  rare: { probability: 0.25, tokenReward: 5 },     // 25%
  legendary: { probability: 0.05, tokenReward: 50 } // 5%
};
```

## 🔧 Development Notes

- Gunakan `window.FishyFortune` untuk debugging di browser console
- State game tersimpan otomatis di localStorage
- Canvas responsive dengan fallback untuk browser lama
- SDK Farcaster dimuat secara lazy untuk performance

## 📞 Support

Untuk pertanyaan atau dukungan:
- Buat issue di repository ini
- Join [Farcaster Devs group](https://farcaster.xyz/~/group/devs) untuk diskusi mini apps

---

**Dibuat dengan ❤️ untuk komunitas Farcaster**