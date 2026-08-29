import { useState } from "react";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import Catalog from "../components/Catalog";
import ProductModal from "../components/ProductModal";
import { useCatalog } from "../hooks/useCatalog";

export default function HomePage() {
  const { products, categories, loading, error } = useCatalog();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("semua");
  const [selected, setSelected] = useState(null);

  const scrollToCatalog = () => {
    document.getElementById("kategori")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      <Hero onExplore={scrollToCatalog} />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Menu Andalan Kami</div>
            <h2>Temukan Cemilan Favoritmu</h2>
            <p>Cari dan pilih produk, lalu langsung pesan lewat WhatsApp dalam sekejap.</p>
          </div>

          <div className="search-wrap">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {error && (
            <div className="empty" style={{ color: "#b91c1c" }}>
              <p>Terjadi kendala memuat produk. Menggunakan data cadangan.</p>
            </div>
          )}

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
              limit={8}
            />
          )}
        </div>
      </section>

      <section className="section" style={{ background: "var(--cream-soft)" }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Kenapa Tiara Bakery?</div>
            <h2>Keunggulan Kami</h2>
          </div>
          <div className="feature-grid">
            <div className="feature-card"><div className="feature-icon">🥖</div><h4>Bahan Segar</h4><p>Dipanggang harian dengan bahan berkualitas.</p></div>
            <div className="feature-card"><div className="feature-icon">⚡</div><h4>Pesan Cepat</h4><p>Checkout langsung via WhatsApp tanpa ribet.</p></div>
            <div className="feature-card"><div className="feature-icon">🚚</div><h4>Pengiriman Lokal</h4><p>Melayani area Palembang & sekitarnya.</p></div>
            <div className="feature-card"><div className="feature-icon">💛</div><h4>Harga Bersahabat</h4><p>Kualitas premium dengan harga terjangkau.</p></div>
          </div>
        </div>
      </section>

      {selected && <ProductModal key={selected.id} product={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
