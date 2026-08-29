import { appConfig } from "../config/appConfig";
import ProductImage from "../components/ProductImage";

export default function AboutPage() {
  return (
    <main className="container section">
      <div className="about-grid">
        <div className="about-text">
          <div className="eyebrow">Tentang Kami</div>
          <h2>Tentang {appConfig.storeName}</h2>
          <p>
            {appConfig.storeName} adalah toko roti dan jajanan pasar lokal yang berlokasi
            di Kecamatan Sako, Palembang. Kami menyajikan beragam kue basah, jajanan pasar,
            tart, snack box, dan roti yang dibuat dengan resep turun-temurun dan bahan pilihan.
          </p>
          <p>
            Komitmen kami sederhana: menyajikan camilan yang lezat, higienis, dan terjangkau
            agar setiap momen bersama keluarga dan teman semakin berkesan.
          </p>
          <p>
            Kami melayani pemesanan harian, pesanan tart ulang tahun, hingga snack box untuk
            rapat, acara, maupun seminar.
          </p>
          <div className="hero-stats">
            <div><div className="stat-value">5+</div><div className="stat-label">Tahun Berdiri</div></div>
            <div><div className="stat-value">50+</div><div className="stat-label">Varian Produk</div></div>
            <div><div className="stat-value">1000+</div><div className="stat-label">Pelanggan</div></div>
          </div>
        </div>
        <div className="about-image">
          <ProductImage src={appConfig.heroImage} alt={appConfig.storeName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    </main>
  );
}
