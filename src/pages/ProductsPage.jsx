import { useState } from "react";
import SearchBar from "../components/SearchBar";
import Catalog from "../components/Catalog";
import ProductModal from "../components/ProductModal";
import { useCatalog } from "../hooks/useCatalog";

export default function ProductsPage() {
  const { products, categories, loading } = useCatalog();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("semua");
  const [selected, setSelected] = useState(null);

  return (
    <main className="container section">
      <div className="section-head">
        <div className="eyebrow">Koleksi Lengkap</div>
        <h2>Semua Produk Kami</h2>
        <p>Roti, kue basah, jajanan pasar, tart, hingga snack box untuk segala acara.</p>
      </div>

      <div className="search-wrap" style={{ marginBottom: 20 }}>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {loading && products.length === 0 ? (
        <div className="loading"><div className="spinner" /><p>Memuat produk...</p></div>
      ) : (
        <Catalog
          products={products.filter((p) => p.tersedia !== false)}
          categories={categories}
          search={search}
          onSearch={setSearch}
          category={category}
          onCategory={setCategory}
          onOpen={setSelected}
        />
      )}

      {selected && <ProductModal key={selected.id} product={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
