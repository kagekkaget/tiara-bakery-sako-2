import ProductImage from "./ProductImage";
import { useSettings } from "../store/SettingsContext";

export default function Hero({ onExplore }) {
  const { settings } = useSettings();

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="container hero-content">
        <div>
          <div className="eyebrow">Rasa Rumahan, Kualitas Terbaik</div>
          <h1>
            {settings.storeName.split(" ").slice(0, 2).join(" ")}<br />
            <span>{settings.tagline}</span>
          </h1>
          <p className="lead">{settings.description}</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onExplore}>Lihat Menu 🍰</button>
            <a className="btn btn-dark" href="#kategori">Jelajahi Kategori</a>
          </div>
          <div className="hero-stats">
            <div><div className="stat-value">50+</div><div className="stat-label">Varian Produk</div></div>
            <div><div className="stat-value">100%</div><div className="stat-label">Bahan Fresh</div></div>
            <div><div className="stat-value">★ 4.9</div><div className="stat-label">Rating Pelanggan</div></div>
          </div>
        </div>
        <div className="hero-media">
          <div className="hero-img-wrap">
            <ProductImage src={settings.heroImage} alt="Beragam kue Tiara Bakery" />
          </div>
        </div>
      </div>
    </section>
  );
}
