// ==========================================================================
// GAMBAR PRODUK - lazy load, placeholder, & URL aman
// Menggunakan loading="lazy" + placeholder sehingga pemuatan cepat.
// ==========================================================================

import { useState } from "react";
import { safeImageUrl } from "../utils/sanitize";

// Gambar placeholder generik bila produk tidak punya foto.
const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450">
     <rect width="100%" height="100%" fill="#f7ecdc"/>
     <circle cx="300" cy="200" r="90" fill="#e0c7a6"/>
     <text x="300" y="330" font-family="Arial" font-size="28" fill="#6d4c2f" text-anchor="middle">Tiara Bakery</text>
   </svg>`
)}`;

export default function ProductImage({ src, alt, className, style }) {
  const url = safeImageUrl(src);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const finalSrc = error || !url ? PLACEHOLDER_SVG : url;

  return (
    <img
      src={finalSrc}
      alt={alt || ""}
      loading="lazy"
      decoding="async"
      className={className}
      style={{
        ...style,
        opacity: loaded ? 1 : 1,
        transition: "opacity .25s ease",
      }}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
    />
  );
}
