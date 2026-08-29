import { useNavigate } from "react-router-dom";
import { useCart } from "../store/CartContext";
import ProductImage from "./ProductImage";
import { formatRupiah } from "../utils/whatsapp";
import { sanitizeString } from "../utils/sanitize";

export default function CartDrawer() {
  const { isOpen, closeCart, items, subtotal, setQty, removeItem } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={closeCart} />
      <aside className="drawer" role="dialog" aria-label="Keranjang belanja">
        <div className="drawer-head">
          <h3>Keranjang Belanja 🛒</h3>
          <button className="drawer-close" aria-label="Tutup keranjang" onClick={closeCart}>✕</button>
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="icon">🛒</div>
              <p>Keranjang masih kosong.<br />Yuk pilih kue favoritmu!</p>
            </div>
          ) : (
            items.map((it) => (
              <div className="cart-item" key={it.key}>
                <ProductImage src={it.gambar} alt={it.name} />
                <div className="cart-item-info">
                  <div className="cart-item-name">{sanitizeString(it.name)}</div>
                  {it.variant && it.variant !== "Default" && (
                    <div className="cart-item-var">{it.variant}</div>
                  )}
                  <div className="cart-item-price">{formatRupiah(it.price)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <button className="cart-remove" onClick={() => removeItem(it.key)}>Hapus</button>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => setQty(it.key, it.qty - 1)}>−</button>
                    <span className="qty-val">{it.qty}</span>
                    <button className="qty-btn" onClick={() => setQty(it.key, it.qty + 1)}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="subtotal-row">
              <span>Subtotal</span>
              <b>{formatRupiah(subtotal)}</b>
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={() => { navigate("/checkout"); closeCart(); }}
            >
              Lanjut ke Checkout →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
