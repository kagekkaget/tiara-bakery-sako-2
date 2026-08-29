import { appConfig } from "../config/appConfig";
import { openWa } from "../utils/whatsapp";

export default function ContactPage() {
  const wa = openWa("Halo Tiara Bakery, saya ingin bertanya tentang produk Anda.");

  return (
    <main className="container section">
      <div className="section-head">
        <div className="eyebrow">Hubungi Kami</div>
        <h2>Kontak & Lokasi</h2>
        <p>Kunjungi toko kami atau hubungi langsung untuk pemesanan.</p>
      </div>

      <div className="contact-grid">
        <div>
          <div className="info-card">
            <div className="info-icon">📍</div>
            <div>
              <h4>Alamat</h4>
              <p>{appConfig.address}</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">📞</div>
            <div>
              <h4>Telepon / WhatsApp</h4>
              <p>{appConfig.phoneDisplay}</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">✉️</div>
            <div>
              <h4>Email</h4>
              <p>{appConfig.email}</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">🕐</div>
            <div>
              <h4>Jam Operasional</h4>
              {appConfig.openingHours.map((o, i) => (
                <p key={i}>{o.day}: {o.hours}</p>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <a className="btn btn-whatsapp" href={wa} target="_blank" rel="noreferrer noopener">
              Chat via WhatsApp 💬
            </a>
          </div>
        </div>

        <div>
          <iframe
            className="map-frame"
            src={appConfig.googleMapsEmbed}
            title="Lokasi Tiara Bakery"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="mt-3 text-center">
            <a className="btn btn-outline btn-sm" href={appConfig.googleMapsLink} target="_blank" rel="noreferrer noopener">
              Buka di Google Maps ↗
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
