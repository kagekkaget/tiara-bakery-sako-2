// ==========================================================================
// TIARA BAKERY SAKO PALEMBANG - GLOBAL KONFIGURASI
// Semua branding, kontak, dan pengaturan dinamis ada di file ini.
// Ubah nilai di sini dan seluruh aplikasi otomatis menyesuaikan.
// ==========================================================================

export const appConfig = {
  // ---- Identitas Toko ----
  storeName: "TIARA BAKERY SAKO PALEMBANG",
  storeShortName: "Tiara Bakery",
  tagline: "Roti, Kue Basah & Jajanan Pasar Pilihan",
  description:
    "Toko roti dan jajanan pasar lokal di Palembang. Berbagai macam kue basah, jajanan pasar, tart, dan snack box dengan cita rasa yang terjaga.",
  homeUrl: "/",

  // ---- Logo ----
  // Letakkan file logo di folder `public/logos/` lalu ubah path di bawah.
  // Contoh: "/logos/tiara-bakery.png" atau bisa juga URL eksternal https://...
  // Catatan: file `.svg` di bawah hanya placeholder. Ganti dengan logo asli Anda!
  logo: "/logos/logo-tiara-bakery.svg",
  logoAlt: "Logo Tiara Bakery Sako Palembang",
  favicon: "/logos/logo-tiara-bakery.svg",
  heroImage: "/logos/hero-tiara-bakery.svg",

  // ---- Kontak & Alamat ----
  phoneDisplay: "+62 812-3456-7890",
  // Nomor WhatsApp (tanpa +, tanpa spasi/tanda baca) - dipakai untuk checkout otomatis
  whatsapp: "6281234567890",
  email: "halo@tiarabakery.id",
  address: "Jl. Sako Baru, Kec. Sako, Kota Palembang, Sumatera Selatan 30163",
  // Google Maps embed link (src iframe). Ganti dengan link embed milik toko Anda.
  googleMapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.2!2d104.8!3d-2.98!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwNTgnNDguOCJTIDEwNMKwNDgnMDAuMCJF!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid",
  googleMapsLink: "https://maps.google.com/?q=Sako+Palembang",

  // ---- Jam Operasional ----
  openingHours: [
    { day: "Senin - Jumat", hours: "08.00 - 20.00 WIB" },
    { day: "Sabtu", hours: "08.00 - 21.00 WIB" },
    { day: "Minggu", hours: "07.00 - 21.00 WIB" },
  ],

  // ---- Footer / Copyright ----
  copyright: "Copyright MZF - 2026",

  // ---- Navigasi ----
  navLinks: [
    { label: "Beranda", to: "/" },
    { label: "Produk", to: "/produk" },
    { label: "Tentang", to: "/tentang" },
    { label: "Kontak", to: "/kontak" },
  ],
};
