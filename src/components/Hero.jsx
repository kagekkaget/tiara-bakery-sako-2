import { appConfig } from "../config/appConfig";
import ProductImage from "./ProductImage";

export default function Hero({ onExplore }) {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="container hero-content">
        <div>
          <div className="eyebrow">Rasa Rumahan, Kualitas Terbaik</div>
          <h1>
            {appConfig.storeName.split(" ").slice(0, 2).join(" ")}<br />
            <span>{appConfig.tagline}</span>
          </h1>
          <p className="lead">{appConfig.description}</p>
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
            <ProductImage src={appConfig.heroImage} alt="Beragam kue Tiara Bakery" />
          </div>
        </div>
      </div>
    </section>
  );
}
