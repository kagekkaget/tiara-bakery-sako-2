import { Link } from "react-router-dom";
import { appConfig } from "../config/appConfig";
import { openWa } from "../utils/whatsapp";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="brand-name">{appConfig.storeName}</div>
          <p className="mt-3" style={{ opacity: .85, fontSize: 14 }}>{appConfig.description}</p>
          <div className="mt-4" style={{ display: "flex", gap: 10 }}>
            <a className="btn btn-whatsapp btn-sm" href={openWa("Halo, saya ingin bertanya tentang produk Tiara Bakery.")}
              target="_blank" rel="noreferrer noopener">💬 WhatsApp</a>
          </div>
        </div>

        <div>
          <h4>Navigasi</h4>
          <ul>
            {appConfig.navLinks.map((l) => (
              <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
            ))}
            <li><Link to="/admin/login">🔐 Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4>Jadwal Buka</h4>
          <ul>
            {appConfig.openingHours.map((o, i) => (
              <li key={i}>{o.day}: <b>{o.hours}</b></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          📍 {appConfig.address}<br />
          <span style={{ opacity: .7 }}>
            {appConfig.email} • {appConfig.phoneDisplay}
          </span><br /><br />
        </div>
        {appConfig.copyright}
      </div>
    </footer>
  );
}
