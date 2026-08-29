import { useState, useEffect } from "react";
import { useCart } from "../store/CartContext";
import { useSettings } from "../store/SettingsContext";
import { buildOrderMessage, formatRupiah, setWhatsAppConfig } from "../utils/whatsapp";
import { sanitizeString, sanitizePhone } from "../utils/sanitize";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const { settings } = useSettings();
  const [form, setForm] = useState({ nama: "", hp: "", alamat: "", catatan: "" });
  const [ongkir, setOngkir] = useState(0);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setWhatsAppConfig(settings);
  }, [settings]);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const nama = sanitizeString(form.nama);
    const hp = sanitizePhone(form.hp);
    const alamat = sanitizeString(form.alamat);

    if (!nama) return setError("Mohon isi nama lengkap.");
    if (hp.length < 8) return setError("Mohon isi nomor WhatsApp yang valid.");

    const shipping = {
      nama,
      hp,
      alamat,
      catatan: sanitizeString(form.catatan),
      ongkir,
    };

    const message = buildOrderMessage(items, subtotal, shipping);
    const url = `https://wa.me/${sanitizePhone(settings.whatsapp)}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpened(true);
  };

  if (items.length === 0 && !opened) {
    return (
      <main className="container section">
        <div className="card" style={{ background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 52 }}>🛒</div>
          <h2 style={{ color: "var(--brown-dark)", margin: "12px 0 6px" }}>Keranjang Kosong</h2>
          <p style={{ color: "var(--text-soft)" }}>Tambahkan produk terlebih dahulu sebelum melakukan checkout.</p>
          <a className="btn btn-primary mt-4" href="/produk">Lihat Produk</a>
        </div>
      </main>
    );
  }

  const total = subtotal + ongkir;
  const btnText = opened
    ? "Pesanan dibuka di WhatsApp — cek keranjang kembali jika ingin mengulang"
    : `Pesan via WhatsApp — ${formatRupiah(total)}`;

  return (
    <main className="container section">
      <div className="section-head">
        <div className="eyebrow">Checkout</div>
        <h2>Lengkapi Data Kamu</h2>
        <p>Kirim pesanan langsung ke WhatsApp kami. Konfirmasi cepat, proses kilat!</p>
      </div>

      <div className="checkout-grid">
        <form className="form-card" onSubmit={handleSubmit} noValidate>
          <h3>Detail Pengiriman</h3>

          <div className="form-group">
            <label htmlFor="nama">Nama Lengkap *</label>
            <input
              id="nama"
              className="form-control"
              value={form.nama}
              onChange={(e) => setField("nama", e.target.value)}
              maxLength={60}
              placeholder="Contoh: Siti Aminah"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hp">No. WhatsApp / HP *</label>
            <input
              id="hp"
              className="form-control"
              type="tel"
              value={form.hp}
              onChange={(e) => setField("hp", e.target.value)}
              placeholder="Contoh: 0812 3456 7890"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="alamat">Alamat Pengiriman</label>
            <textarea
              id="alamat"
              className="form-control"
              value={form.alamat}
              onChange={(e) => setField("alamat", e.target.value)}
              placeholder="Isi alamat lengkap (opsional, untuk antar lokal)"
              maxLength={300}
            />
          </div>

          <div className="form-group">
            <label htmlFor="catatan">Catatan Pesanan</label>
            <textarea
              id="catatan"
              className="form-control"
              value={form.catatan}
              onChange={(e) => setField("catatan", e.target.value)}
              placeholder="Contoh: Tolong pisahkan kemasan, atau tulis ucapan di tart"
              maxLength={300}
            />
          </div>

          <div className="form-group">
            <label>Ongkos Kirim (opsional)</label>
            <div className="variant-list">
              {[{ label: "Ambil di Toko", val: 0 }, { label: "Antar Lokal (+ Rp 15.000)", val: 15000 }, { label: "Antar Jauh (+ Rp 30.000)", val: 30000 }].map((o) => (
                <button
                  type="button"
                  key={o.val}
                  className={"variant-chip" + (ongkir === o.val ? " active" : "")}
                  onClick={() => setOngkir(o.val)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: "#fbeaea", color: "#b91c1c", padding: "10px 14px", borderRadius: 10, fontSize: 14, marginBottom: 14 }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn btn-whatsapp btn-block">
            {btnText}
          </button>
          <div className="form-hint" style={{ textAlign: "center", marginTop: 10 }}>
            Dengan menekan tombol, pesanan kamu akan terbuka di WhatsApp untuk dikonfirmasi.
          </div>
        </form>

        <aside className="order-summary">
          <h3>Ringkasan Pesanan</h3>
          {items.map((it) => (
            <div className="summary-line" key={it.key}>
              <span>{it.name}{it.variant && it.variant !== "Default" ? ` (${it.variant})` : ""} × {it.qty}</span>
              <span>{formatRupiah(it.price * it.qty)}</span>
            </div>
          ))}
          <div className="summary-line">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div className="summary-line">
            <span>Ongkir</span>
            <span>{ongkir ? formatRupiah(ongkir) : "Gratis / Ambil"}</span>
          </div>
          <div className="summary-line total">
            <span>Total</span>
            <b>{formatRupiah(total)}</b>
          </div>
          <div className="mt-4">
            <button className="btn btn-outline btn-block btn-sm" onClick={() => window.history.back()}>← Kembali</button>
          </div>
        </aside>
      </div>
      {opened && <div className="toast">✅ Pesanan dibuka di WhatsApp. Jangan lupa kirim ya!</div>}
    </main>
  );
}
