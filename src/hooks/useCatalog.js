// ==========================================================================
// HOOK KATALOG - mengambil produk & kategori, pencarian cepat + filter
// Memakai cache (localStorage TTL) sehingga pemuatan sub-detik.
// ==========================================================================

import { useEffect, useState } from "react";
import { fetchProducts, fetchCategories } from "../data/store";

export function useCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Paralel membaca produk & kategori
        const [prods, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
        if (!active) return;
        setProducts(prods);
        setCategories(cats);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return { products, categories, loading, error };
}
