// ==========================================================================
// DATA CADANGAN LOKAL (fallback)
// Dipakai ketika VITE_GOOGLE_SHEETS_URL kosong. Berfungsi sebagai katalog contoh.
// Setelah Anda mengisi Google Sheets, aplikasi otomatis memakai data dari sana.
// ==========================================================================

// Kategori produk (urutan tampilan)
export const categories = [
  { id: "semua", nama: "Semua", icon: "🍽️" },
  { id: "kue-basah", nama: "Kue Basah", icon: "🍰" },
  { id: "jajanan-pasar", nama: "Jajanan Pasar", icon: "🥧" },
  { id: "tart", nama: "Tart", icon: "🎂" },
  { id: "snack-box", nama: "Snack Box", icon: "🍱" },
  { id: "roti", nama: "Roti", icon: "🍞" },
  { id: "minuman", nama: "Minuman", icon: "🥤" },
];

// Produk contoh. `gambar` kosong => pakai placeholder.
export const products = [
  {
    id: "kuebasah1",
    kategori: "kue-basah",
    nama: "Bolu Gulung Coklat",
    deskripsi: "Bolu gulung lembut dengan isian krim coklat yang lumer di mulut. Tidak terlalu manis, pas untuk teman minum teh.",
    harga: 25000,
    hargaDiskon: 22000,
    stok: 25,
    varian: ["Original", "Coklat", "Pandan"],
    gambar: "",
    tersedia: true,
  },
  {
    id: "kuebasah2",
    kategori: "kue-basah",
    nama: "Lapis Legit Mini",
    deskripsi: "Kue lapis legit premium berlapis tipis dengan aroma rempah khas. Dikemas mini, cocok untuk oleh-oleh.",
    harga: 35000,
    hargaDiskon: 0,
    stok: 15,
    varian: ["Kecil", "Sedang"],
    gambar: "",
    tersedia: true,
  },
  {
    id: "jpasar1",
    kategori: "jajanan-pasar",
    nama: "Putu Ayu",
    deskripsi: "Kue putu ayu pandan lembut dengan taburan kelapa parut fresh. Manis gurih khas jajanan pasar.",
    harga: 15000,
    hargaDiskon: 0,
    stok: 30,
    varian: [],
    gambar: "",
    tersedia: true,
  },
  {
    id: "jpasar2",
    kategori: "jajanan-pasar",
    nama: "Lemper Ayam",
    deskripsi: "Lemper ketan berisi suwiran ayam berbumbu gurih, dibungkus daun pisang. Isian melimpah.",
    harga: 12000,
    hargaDiskon: 0,
    stok: 40,
    varian: ["Reguler", "Mega (2x isi)"],
    gambar: "",
    tersedia: true,
  },
  {
    id: "jpasar3",
    kategori: "jajanan-pasar",
    nama: "Onde-Onde Ketawa",
    deskripsi: "Gorengan manis kenyal dengan taburan wijen, renyah di luar lembut di dalam.",
    harga: 10000,
    hargaDiskon: 8000,
    stok: 20,
    varian: [],
    gambar: "",
    tersedia: true,
  },
  {
    id: "tart1",
    kategori: "tart",
    nama: "Tart Ulang Tahun Klasik",
    deskripsi: "Tart ulang tahun dengan whipped cream ringan dan topping buah segar. Bisa custom tulisan nama.",
    harga: 200000,
    hargaDiskon: 0,
    stok: 5,
    varian: ["Ukuran 20cm", "Ukuran 24cm", "Ukuran 30cm"],
    gambar: "",
    tersedia: true,
  },
  {
    id: "tart2",
    kategori: "tart",
    nama: "Tart Coklat Fondant",
    deskripsi: "Tart mewah dilapisi fondant coklat premium, cocok untuk acara spesial dan lamaran.",
    harga: 350000,
    hargaDiskon: 320000,
    stok: 3,
    varian: ["Ukuran 18cm", "Ukuran 24cm"],
    gambar: "",
    tersedia: true,
  },
  {
    id: "snack1",
    kategori: "snack-box",
    nama: "Snack Box Hemat",
    deskripsi: "Paket snack box berisi beragam kue kering dan jajanan, cocok untuk rapat dan seminar.",
    harga: 20000,
    hargaDiskon: 0,
    stok: 100,
    varian: ["Isi 6", "Isi 8", "Isi 10"],
    gambar: "",
    tersedia: true,
  },
  {
    id: "snack2",
    kategori: "snack-box",
    nama: "Snack Box Premium",
    deskripsi: "Paket snack box premium dengan pilihan kue artisanal dan minuman kemasan.",
    harga: 45000,
    hargaDiskon: 40000,
    stok: 50,
    varian: ["Isi 8", "Isi 12"],
    gambar: "",
    tersedia: true,
  },
  {
    id: "roti1",
    kategori: "roti",
    nama: "Roti Sobek Keju",
    deskripsi: "Roti sobek empuk berisi keju leleh, dipanggang dengan taburan keju mozzarella.",
    harga: 18000,
    hargaDiskon: 0,
    stok: 60,
    varian: ["Original", "Coklat", "Keju", "Coklat-Keju"],
    gambar: "",
    tersedia: true,
  },
  {
    id: "minum1",
    kategori: "minuman",
    nama: "Es Teh Lemon",
    deskripsi: "Es teh segar dengan perasan lemon asli, manis asam menyegarkan.",
    harga: 8000,
    hargaDiskon: 0,
    stok: 80,
    varian: ["Tanpa Gula", "Gula Normal"],
    gambar: "",
    tersedia: true,
  },
];

// Utilitas kecil
export const formatRupiah = (angka) => {
  const nilai = Number(angka) || 0;
  return "Rp " + nilai.toLocaleString("id-ID");
};

export const getKategori = (id) => categories.find((c) => c.id === id);
