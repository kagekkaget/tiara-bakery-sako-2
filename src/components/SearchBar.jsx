import { useState } from "react";

export default function SearchBar({ value, onChange, placeholder }) {
  const [local, setLocal] = useState(value || "");

  const submit = (e) => {
    if (e) e.preventDefault();
    onChange && onChange(local);
  };

  return (
    <form className="search-bar" onSubmit={submit} role="search">
      <span style={{ fontSize: 20 }}>🔍</span>
      <input
        type="search"
        value={local}
        placeholder={placeholder || "Cari roti, kue basah, tart, snack box..."}
        aria-label="Pencarian produk"
        onChange={(e) => { setLocal(e.target.value); }}
      />
      <button type="submit" className="btn btn-primary btn-sm">Cari</button>
    </form>
  );
}
