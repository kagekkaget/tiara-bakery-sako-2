import { Link } from "react-router-dom";
import { openWa } from "../utils/whatsapp";
import { useSettings } from "../store/SettingsContext";

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="brand-name">{settings.storeName}</div>
          <p className="mt-3" style={{ opacity: .85, fontSize: 14 }}>{settings.description}</p>
          <div className="mt-4" style={{ display: "flex", gap: 10 }}>
            <a className="btn btn-whatsapp btn-sm" href={openWa("Halo, saya ingin bertanya tentang produk Tiara Bakery.")}
              target="_blank" rel="noreferrer noopener">💬 WhatsApp</a>
          </div>
        </div>

        <div>
          <h4>Navigasi</h4>
          <ul>
            {settings.navLinks && settings.navLinks.map((l) => (
              <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
            ))}
            <li><Link to="/admin/login">🔐 Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4>Jadwal Buka</h4>
          <ul>
            {settings.openingHours && settings.openingHours.map((o, i) => (
              <li key={i}>{o.day}: <b>{o.hours}</b></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          📍 {settings.address}<br />
          <span style={{ opacity: .7 }}>
            {settings.email} • {settings.phoneDisplay}
          </span><br /><br />
        </div>
        {settings.copyright}
      </div>
    </footer>
  );
}
