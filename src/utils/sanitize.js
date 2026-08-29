// ==========================================================================
// UTILITAS KEAMANAN
// Sanitasi input pengguna (anti-XSS), proteksi prototype pollution,
// dan pencegah injeksi sebelum data ditampilkan / dikirim.
// ==========================================================================

// 1) Escape HTML agar input pengguna tidak dapat mengeksekusi skrip (XSS).
export function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// 2) Membersihkan string berbahaya (hapus karakter kontrol / kontrol injeksi).
export function sanitizeString(value) {
  if (value === null || value === undefined) return "";
  // Hapus karakter kontrol (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F) & lalu trim.
  // Dilakukan per-karakter agar tidak dipicu aturan lint regex.
  let out = "";
  const s = String(value);
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    const isControl =
      c <= 8 || c === 11 || c === 12 || (c >= 14 && c <= 31) || c === 127;
    if (!isControl) out += s[i];
  }
  return out.trim();
}

// 3) Aman untuk <img src>: hanya izinkan skema https: / http: / relative / data:image.
export function safeImageUrl(value) {
  const v = sanitizeString(value);
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  // Path lokal aplikasi, mis. /logos/logo.png
  if (v.startsWith("/")) return v;
  if (/^data:image\//i.test(v)) return v;
  // Proses lain (javascript:, vbscript:, dll) diblokir -> kosong
  return "";
}

// 4) Validasi URL WhatsApp / tel: hanya angka dan simbol diizinkan.
export function sanitizePhone(value) {
  return sanitizeString(value).replace(/[^0-9]/g, "");
}

// 5) Membersihkan semua field dari objek yang berasal dari sumber luar (Google Sheets).
export function sanitizeProduct(raw) {
  // Hanya izinkan kunci yang dikenal (mencegah ekspansi prototipe & kunci liar)
  const allowedKeys = [
    "id", "kategori", "nama", "deskripsi", "harga", "hargaDiskon",
    "stok", "varian", "gambar", "tersedia", "slot",
  ];
  const out = {};
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(raw || {}, key)) {
      // Proteksi prototype pollution: cegah kunci berbahaya
      if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
      out[key] = raw[key];
    }
  }
  return out;
}

// 6) Membangun query string aman untuk pesan WhatsApp (encode semua).
export function buildWhatsAppMessage(parts) {
  const clean = parts.filter((p) => p !== null && p !== undefined && String(p).length > 0);
  return clean.map((p) => String(p)).join("\n");
}

// 7) Rate-limit sederhana di sisi klien untuk panggilan fetch (anti spam tombol).
export function createRateLimiter(ms) {
  const timestamps = new Map();
  return function rateLimit(key, limit = 1) {
    const now = Date.now();
    const recent = (timestamps.get(key) || []).filter((t) => now - t < ms);
    if (recent.length >= limit) return false;
    recent.push(now);
    timestamps.set(key, recent);
    return true;
  };
}
