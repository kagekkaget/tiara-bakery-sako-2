import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { sanitizeString } from "../utils/sanitize";

// ==========================================================================
// KATALOG - grid produk dengan pencarian + filter kategori.
// Fungsi murni untuk memfilter (mudah diuji, aman).
// ==========================================================================
export function filterProducts(products, { search = "", category = "semua", limit = 0 }) {
  const q = sanitizeString(search).toLowerCase();
  let list = products || [];
  if (category && category !== "semua") {
    list = list.filter((p) => p.kategori === category);
  }
  if (q) {
    list = list.filter((p) =>
      (p.nama || "").toLowerCase().includes(q) ||
      (p.deskripsi || "").toLowerCase().includes(q) ||
      (p.kategori || "").toLowerCase().includes(q)
    );
  }
  if (limit > 0) list = list.slice(0, limit);
  return list;
}

export default function Catalog({
  products, categories, search, category, onCategory, onOpen, limit = 0,
}) {
  const [showAll, setShowAll] = useState(false);
  const filtered = useMemo(
    () => filterProducts(products, { search, category }),
    [products, search, category]
  );
  const isLimited = limit > 0 && filtered.length > limit;
  const display = isLimited && !showAll ? filtered.slice(0, limit) : filtered;

  return (
    <div id="kategori">
      {/* Filter kategori */}
      {categories && categories.length > 0 && (
        <div className="cat-row">
          {categories.map((c) => (
            <button
              key={c.id}
              className={"cat-pill" + (category === c.id ? " active" : "")}
              onClick={() => onCategory && onCategory(c.id)}
            >
              <span>{c.icon}</span> {c.nama}
            </button>
          ))}
        </div>
      )}

      {products && products.length === 0 ? (
        <div className="empty">
          <div className="spinner" />
          <p>Memuat produk...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 44 }}>🔍</div>
          <p>Maaf, produk tidak ditemukan. Coba kata kunci lain.</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {display.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={onOpen} />
            ))}
          </div>
          {isLimited && (
            <div className="text-center mt-4">
              <button className="btn btn-outline" onClick={() => setShowAll((s) => !s)}>
                {showAll ? "Tampilkan Lebih Sedikit" : `Lihat Semua (${filtered.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
