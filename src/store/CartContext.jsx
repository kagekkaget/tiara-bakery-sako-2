// ==========================================================================
// STORE CART (Context) - keranjang belanja interaktif
// Menyimpan item, menambahkan/mengubah/menghapus, dan menghitung subtotal.
// Data dipakai bersama oleh header, drawer cart, dan halaman checkout.
// ==========================================================================

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { sanitizeString } from "../utils/sanitize";

const CartContext = createContext(null);

const STORAGE_KEY = "tiara_cart_v1";

// ---- Reducer murni (mudah diuji, aman dari mutasi langsung) ----
function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const { id, variant, qty } = action.payload;
      const key = `${id}::${variant}`;
      const existing = state.items.find(it => it.key === key);
      let items;
      if (existing) {
        items = state.items.map(it =>
          it.key === key ? { ...it, qty: it.qty + qty } : it
        );
      } else {
        items = [...state.items, { key, productId: id, variant, qty, ...action.payload.meta }];
      }
      return { ...state, items, isOpen: true };
    }
    case "SET_QTY": {
      const { key, qty } = action.payload;
      const items = state.items
        .map(it => (it.key === key ? { ...it, qty: Math.max(0, qty) } : it))
        .filter(it => it.qty > 0);
      return { ...state, items };
    }
    case "REMOVE": {
      return { ...state, items: state.items.filter(it => it.key !== action.payload.key) };
    }
    case "CLEAR": {
      return { ...state, items: [] };
    }
    case "TOGGLE_OPEN": {
      return { ...state, isOpen: !state.isOpen };
    }
    case "SET_OPEN": {
      return { ...state, isOpen: action.payload };
    }
    case "HYDRATE": {
      return { ...state, items: action.payload };
    }
    default:
      return state;
  }
}

// ---- Helper harga (diskon berlaku) ----
export function effectivePrice(product) {
  const diskon = Number(product?.hargaDiskon) || 0;
  const harga = Number(product?.harga) || 0;
  return diskon > 0 && diskon < harga ? diskon : harga;
}

function initCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const items = JSON.parse(raw);
      if (Array.isArray(items)) return { items, isOpen: false };
    }
  } catch { /* abaikan */ }
  return { items: [], isOpen: false };
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initCart);

  // Simpan ke localStorage setiap kali berubah
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch { /* abaikan */ }
  }, [state.items]);

  // ---- API keranjang ----
  const api = useMemo(() => ({
    items: state.items,
    isOpen: state.isOpen,
    count: state.items.reduce((s, it) => s + it.qty, 0),
    subtotal: state.items.reduce((s, it) => s + it.price * it.qty, 0),
    openCart: () => dispatch({ type: "SET_OPEN", payload: true }),
    closeCart: () => dispatch({ type: "SET_OPEN", payload: false }),
    toggleCart: () => dispatch({ type: "TOGGLE_OPEN" }),
    addItem: (product, variant = "Default", qty = 1) => {
      const safeVariant = sanitizeString(variant) || "Default";
      const safeName = sanitizeString(product.nama);
      const price = effectivePrice(product);
      if (price <= 0) return;
      dispatch({
        type: "ADD",
        payload: {
          id: sanitizeString(product.id),
          variant: safeVariant,
          qty,
          meta: { name: safeName, price, gambar: product.gambar || "" },
        },
      });
    },
    setQty: (key, qty) => dispatch({ type: "SET_QTY", payload: { key, qty } }),
    removeItem: (key) => dispatch({ type: "REMOVE", payload: { key } }),
    clear: () => dispatch({ type: "CLEAR" }),
  }), [state.items, state.isOpen]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus dipakai di dalam <CartProvider>");
  return ctx;
}
