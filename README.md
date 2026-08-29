# Tiara Bakery Sako Palembang 🍰

Aplikasi web **Full-Stack** modern untuk toko roti & jajanan pasar lokal. Dibangun dengan **React + Vite**, memakai **Google Sheets** sebagai CMS/database, dengan **cache lokal** agar super cepat dan **checkout via WhatsApp**.

> Logo (`Logo Tiara Bakery.jpg`) tidak dapat dibaca otomatis. Letakkan file logo Anda di `public/logos/` lalu ubah `src/config/appConfig.js` → `logo`.

---

## ✨ Fitur

- **Landing Page** dengan hero, filter kategori (Kue Basah, Jajanan Pasar, Tart, Snack Box), pencarian instan.
- **Detail produk** (modal) dengan foto, deskripsi, harga, dan pilihan varian.
- **Keranjang belanja interaktif** (drawer) dengan subtotal otomatis.
- **Checkout** dengan form pengiriman + ringkasan total, terkirim langsung ke **WhatsApp**.
- **Caching lokal (localStorage TTL)** → pemuatan sub-detik & hemat kuota API.
- **100% Bahasa Indonesia**, responsive, modern, dan mudah di-edit via satu file konfigurasi.
- **Keamanan**: sanitasi input (anti-XSS), proteksi prototype pollution, CSP, anti injeksi.

---

## 🚀 Cara Menjalankan

```bash
# 1. Install dependensi
npm install

# 2. Jalankan mode development
npm run dev
# buka http://localhost:5173

# 3. Build produksi
npm run build
npm run preview
```

---

## ⚙️ Konfigurasi Mudah (Tanpa Sentuh Komponen)

Semua pengaturan ada di **`src/config/appConfig.js`**:

| Hal yang ingin diubah | Di mana |
|---|---|
| Nama toko, tagline, deskripsi | `storeName`, `tagline`, `description` |
| Logo & favicon | `logo`, `favicon` (letakkan di `public/logos/`) |
| No. WhatsApp pemesanan | `whatsapp` (contoh: `6281234567890`) |
| Alamat & Google Maps | `address`, `googleMapsEmbed`, `googleMapsLink` |
| Jam operasional | `openingHours` |
| Copyright | `copyright` (sudah: *Copyright MZF - 2026*) |

---

## 🗄️ Menghubungkan Google Sheets (CMS)

1. Buat Google Sheets dengan **header kolom**:
   `id | kategori | nama | deskripsi | harga | harga_diskon | stok | varian | gambar | tersedia | slot`
2. **Share → Anyone with link → Viewer**, lalu **File → Share → Publish to web → CSV**.
3. Salin link publik, tempel ke `.env`:

```env
VITE_GOOGLE_SHEETS_URL=https://docs.google.com/spreadsheets/d/e/..../pub?output=csv
```

> Jika `VITE_GOOGLE_SHEETS_URL` kosong, aplikasi otomatis memakai data contoh dari `src/data/seed.js` sehingga tetap berjalan.

**Keamanan API Key:** Gunakan URL Google Sheets **publik** (bebas kunci), atau buat endpoint serverless sendiri yang memegang kunci rahasia di server, lalu panggil URL itu dari sisi klien. Kunci privat Google Cloud **tidak pernah** berada di kode frontend.

---

## 🧱 Struktur Proyek

```
├── index.html
├── vite.config.js          # Vite + CSP dev
├── vercel.json             # Security headers produksi (CSP/CORS)
├── .env.example
├── public/
│   └── logos/              # Taruh logo & gambar di sini
└── src/
    ├── main.jsx
    ├── App.jsx             # Routing + lazy loading
    ├── config/
    │   └── appConfig.js    # ★ SEMUA konfigurasi branding
    ├── data/
    │   ├── seed.js         # Data cadangan + formatRupiah
    │   └── store.js        # Google Sheets + cache TTL
    ├── hooks/
    │   └── useCatalog.js   # Ambil produk/kategori
    ├── store/
    │   └── CartContext.jsx # State keranjang global
    ├── utils/
    │   ├── sanitize.js     # Anti-XSS, sanitasi, rate-limit
    │   └── whatsapp.js     # Link & pesan WhatsApp
    ├── components/         # Header, Footer, Hero, Catalog, dll
    ├── pages/              # Home, Produk, Tentang, Kontak, Checkout
    └── styles/global.css
```

---

## 🛡️ Keamanan yang Diterapkan

- **Sanitasi input** pengguna (anti-XSS) → `utils/sanitize.js`.
- **Proteksi prototype pollution** saat membaca data eksternal.
- **CSP headers** (dev di `vite.config.js`, produksi di `vercel.json`).
- **CORS & rate-limiting** handling untuk fetch.
- **API key tersembunyi** — hanya URL publik/serverless dipakai frontend.
- **Referrer-Policy & X-Frame-Options** untuk mencegah clickjacking.

---

## © Copyright

**Copyright MZF - 2026**
