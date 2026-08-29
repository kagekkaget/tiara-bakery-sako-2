import ProductImage from "./ProductImage";
import { getKategori, formatRupiah } from "../data/seed";
import { effectivePrice } from "../store/CartContext";

export default function ProductCard({ product, onOpen }) {
  const kategori = getKategori(product.kategori) || { nama: product.kategori };
  const price = effectivePrice(product);
  const hasDisc = Number(product.hargaDiskon) > 0 && Number(product.hargaDiskon) < Number(product.harga);
  const pics = { alt: product.nama };

  return (
    <article className="product-card" onClick={() => onOpen && onOpen(product)}>
      <div className="img-wrap">
        {hasDisc && <span className="card-badge">Diskon</span>}
        <ProductImage src={product.gambar} alt={pics.alt} className="product-img" />
      </div>
      <div className="product-body">
        <div className="product-cat">{kategori.nama || product.kategori}</div>
        <div className="product-name">{product.nama}</div>
        <div className="product-desc">{product.deskripsi}</div>
        <div className="product-price">
          <span className="price">{formatRupiah(price)}</span>
          {hasDisc && <span className="price-old">{formatRupiah(product.harga)}</span>}
        </div>
        <div className="product-actions">
          <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); onOpen && onOpen(product); }}>
            Detail
          </button>
        </div>
      </div>
    </article>
  );
}
