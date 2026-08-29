import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { appConfig } from "../config/appConfig";
import { useCart } from "../store/CartContext";

export default function Header() {
  const { count, openCart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-inner container">
        <Link to="/" className="brand">
          <img src={appConfig.logo} alt={appConfig.logoAlt} />
          <span>
            <div className="brand-name">{appConfig.storeShortName}</div>
            <div className="brand-sub">{appConfig.tagline}</div>
          </span>
        </Link>

        <nav className="header-links">
          <div className="nav-links" style={{ display: menuOpen ? "flex" : undefined, flexDirection: "column", position: menuOpen ? "absolute" : undefined, top: 64, right: 16, background: "#fff", padding: 12, borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,.15)", zIndex: 50 }}>
            {appConfig.navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={() => setMenuOpen(false)}>
                {l.label}
              </NavLink>
            ))}
          </div>
          <button className="menu-toggle" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}>☰</button>
          <button className="cart-btn" aria-label="Keranjang" onClick={() => { navigate("/"); openCart(); }}>
            🛒
            {count > 0 && <span className="count">{count}</span>}
          </button>
        </nav>
      </div>
    </header>
  );
}
