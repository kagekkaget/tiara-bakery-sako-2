import { useEffect, useState } from "react";
import ProductImage from "./ProductImage";
import { getKategori, formatRupiah } from "../data/seed";
import { effectivePrice, useCart } from "../store/CartContext";
import { sanitizeString } from "../utils/sanitize";

export default function ProductModal({ product, onClose }) {
  const { addItem } = useCart();
  // State diinisialisasi dari produk saat modal dipasang.
  // Komponen dipasang ulang (via key) tiap produk berubah, jadi reset otomatis.
  const [variant, setVariant] = useState(product?.varian?.[0] || "Default");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose && onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  if (!product) return null;

  const kategori = getKategori(product.kategori) || { nama: product.kategori };
  const price = effectivePrice(product);
  const hasDisc = Number(product.hargaDiskon) > 0 && Number(product.hargaDiskon) < Number(product.harga);
  const outOfStock = Number(product.stok) <= 0;
  const lowStock = !outOfStock && Number(product.stok) <= 10;
  const variants = Array.isArray(product.varian) && product.varian.length ? product.varian : [];

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(product, sanitizeString(variant) || variants[0] || "Default", qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-wrap">
          <button className="modal-close" aria-label="Tutup" onClick={onClose}>✕</button>
        </div>
        <div className="modal-grid">
          <ProductImage src={product.gambar} alt={product.nama} className="modal-img" />
          <div className="modal-body">
            <div className="product-cat">{kategori.nama || product.kategori}</div>
            <h2>{sanitizeString(product.nama)}</h2>
            <div className="product-price">
              <span className="price" style={{ fontSize: 24 }}>{formatRupiah(price)}</span>
              {hasDisc && <span className="price-old" style={{ fontSize: 15 }}>{formatRupiah(product.harga)}</span>}
            </div>
            <p className="lead" style={{ fontSize: 15 }}>{sanitizeString(product.deskripsi)}</p>

            {outOfStock ? (
              <div className="tag tag-out" style={{ marginTop: 10 }}>Stok Habis</div>
            ) : (
              <>
                {variants.length > 0 && (
                  <>
                    <div style={{ fontWeight: 700, color: "var(--brown-dark)", marginTop: 14 }}>Pilih Varian</div>
                    <div className="variant-list">
                      {variants.map((v) => (
                        <button
                          key={v}
                          className={"variant-chip" + (variant === v ? " active" : "")}
                          onClick={() => setVariant(v)}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="qty-row">
                  <button className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span className="qty-val">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty((q) => q + 1)}>+</button>
                </div>

                <div className="meta-row">
                  {lowStock && !outOfStock ? (
                    <span className="tag tag-stock-low">Sisa {product.stok} — cepat pesan!</span>
                  ) : (
                    <span className="tag tag-stock">Stok tersedia</span>
                  )}
                </div>

                <div className="mt-4">
                  <button className="btn btn-primary btn-block" onClick={handleAdd}>
                    {added ? "✓ Masuk Keranjang" : "Tambah ke Keranjang 🛒"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
