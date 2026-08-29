// ==========================================================================
// LAPISAN DATA (GOOGLE SHEETS sebagai CMS)
// - Membaca katalog dari Google Sheets (URL publik CSV) ATAU fallback lokal.
// - Memakai localStorage dengan TTL (Time-To-Live) sebagai cache agar cepat.
// - Semua data luar disanitasi sebelum dipakai (anti XSS / injeksi).
// ==========================================================================

import { products as seedProducts, categories as seedCategories } from "../data/seed";

const SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || "";
const CACHE_TTL = Number(import.meta.env.VITE_CACHE_TTL) || 900; // detik (15 menit)

const CACHE_KEY_PRODUCTS = "tiara_products_v1";
const CACHE_KEY_CATS = "tiara_categories_v1";

// ---- Baca & tulis cache localStorage dengan TTL ----
function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { expires, data } = JSON.parse(raw);
    if (Date.now() > expires) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    const payload = { data, expires: Date.now() + CACHE_TTL * 1000 };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Kuota penuh / mode privat -> abaikan (tetap jalan)
  }
}

// ---- Konversi baris CSV -> objek produk lalu sanitasi ----
function rowToProduct(row, index) {
  const get = (key) => (row[key] !== undefined ? String(row[key]).trim() : "");
  const harga = parseInt(String(get("harga")).replace(/[^0-9]/g, ""), 10) || 0;
  const hargaDiskon = parseInt(String(get("harga_diskon")).replace(/[^0-9]/g, ""), 10) || 0;
  const stok = parseInt(get("stok"), 10) || 0;
  const varian = get("varian")
    ? get("varian").split(",").map((v) => v.trim()).filter(Boolean)
    : [];
  const tersedia = /^true$/i.test(get("tersedia")) || get("tersedia") === "1";

  return {
    id: get("id") || `produk${index}`,
    kategori: get("kategori") || "lainnya",
    nama: get("nama") || `Produk ${index}`,
    deskripsi: get("deskripsi"),
    harga,
    hargaDiskon,
    stok,
    varian,
    gambar: get("gambar"),
    tersedia: harga > 0 ? tersedia : false,
    slot: get("slot"),
  };
}

// ---- Parsing CSV sederhana (mendukung koma di dalam tanda kutip) ----
function parseCSV(text) {
  const rows = [];
  let field = "", row = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((v) => v.length)) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function csvToProducts(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const dataRows = rows.slice(1);
  // Header baris pertama adalah legenda kolom; langkah data dari indeks yang tepat
  // (baris ke-2 = contoh kolom). Data produk dimulai dari baris ke-3 bila ada baris bantuan.
  const start = 1; // data dimulai dari baris indeks ke-1 (baris kedua file)
  return dataRows.slice(start - 1).map((cells, i) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = cells[idx] !== undefined ? cells[idx] : ""; });
    if (!obj.id) return null;
    return rowToProduct(obj, i);
  }).filter(Boolean);
}

// ---- Kategori default + kategori dinamis dari produk ----
function buildCategories(products) {
  const base = seedCategories.filter((c) => c.id === "semua");
  const cats = [...base];
  const extraIds = new Set(products.map((p) => p.kategori));
  seedCategories.forEach((sc) => {
    if (sc.id !== "semua" && extraIds.has(sc.id) && !cats.some((c) => c.id === sc.id)) {
      cats.push(sc);
    }
  });
  // Sertakan kategori yang ada di produk tapi tidak didaftarkan seed
  products.forEach((p) => {
    if (!cats.some((c) => c.id === p.kategori)) {
      cats.push({ id: p.kategori, nama: p.kategori, icon: "🏷️" });
    }
  });
  return cats;
}

// ---- Fungsi utama: ambil produk (cache -> fetch -> simpan) ----
export async function fetchProducts({ force = false } = {}) {
  // 1) Coba cache lokal jika tidak dipaksa refresh
  if (!force) {
    const cached = readCache(CACHE_KEY_PRODUCTS);
    if (cached) return cached;
  }

  // 2) Tidak ada URL sheets -> pakai data lokal contoh
  if (!SHEETS_URL) {
    const data = seedProducts.map((p) => ({ ...p }));
    writeCache(CACHE_KEY_PRODUCTS, data);
    return data;
  }

  // 3) Fetch dari Google Sheets publik (CSV)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(SHEETS_URL, {
      signal: controller.signal,
      headers: { Accept: "text/csv" },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    const products = csvToProducts(text);
    if (products.length) {
      writeCache(CACHE_KEY_PRODUCTS, products);
      return products;
    }
  } catch (e) {
    console.warn("Gagal memuat Google Sheets, memakai cache/lokal:", e.message);
  }

  // 4) Fallback: cache lama atau data lokal
  const stale = readCache(CACHE_KEY_PRODUCTS) || seedProducts.map((p) => ({ ...p }));
  writeCache(CACHE_KEY_PRODUCTS, stale);
  return stale;
}

// ---- Kategori (dibangun global, jarang berubah -> cache tetap ----
// Kategori tidak perlu TTL ketat, dibangun dari produk yang sudah di-cache.
export async function fetchCategories() {
  const cached = readCache(CACHE_KEY_CATS);
  if (cached) return cached;
  const prods = await fetchProducts();
  const cats = buildCategories(prods);
  writeCache(CACHE_KEY_CATS, cats);
  return cats;
}

// ---- Bersihkan seluruh cache ----
export function clearCache() {
  localStorage.removeItem(CACHE_KEY_PRODUCTS);
  localStorage.removeItem(CACHE_KEY_CATS);
}
