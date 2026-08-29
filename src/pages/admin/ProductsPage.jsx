import { useState, useEffect } from 'react';
import * as adminApi from '../../services/adminApi';

const formatRupiah = (angka) => {
  const nilai = Number(angka) || 0;
  return 'Rp ' + nilai.toLocaleString('id-ID');
};

const emptyProduct = {
  kategori: '',
  nama: '',
  deskripsi: '',
  harga: '',
  hargaDiskon: '',
  stok: '',
  varian: '',
  gambar: '',
  tersedia: true,
  slot: ''
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [productsRes, catsRes] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories()
      ]);
      if (productsRes.success) {
        setProducts(productsRes.data);
      }
      if (catsRes.success) {
        setCategories(catsRes.data.filter(c => c.id !== 'semua'));
      }
    } catch (err) {
      setError('Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      kategori: product.kategori || '',
      nama: product.nama || '',
      deskripsi: product.deskripsi || '',
      harga: product.harga || '',
      hargaDiskon: product.hargaDiskon || '',
      stok: product.stok || '',
      varian: Array.isArray(product.varian) ? product.varian.join(', ') : '',
      gambar: product.gambar || '',
      tersedia: product.tersedia !== false,
      slot: product.slot || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(emptyProduct);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const productData = {
      ...formData,
      harga: parseInt(formData.harga) || 0,
      hargaDiskon: parseInt(formData.hargaDiskon) || 0,
      stok: parseInt(formData.stok) || 0,
      varian: formData.varian.split(',').map(v => v.trim()).filter(Boolean)
    };

    let result;
    if (editingProduct) {
      result = await adminApi.updateProduct({ ...productData, id: editingProduct.id });
    } else {
      result = await adminApi.addProduct(productData);
    }

    if (result.success) {
      closeModal();
      loadData();
    } else {
      alert(result.message || 'Gagal menyimpan produk');
    }
    setSaving(false);
  };

  const handleDelete = async (product) => {
    if (!confirm(`Hapus produk "${product.nama}"?`)) return;

    const result = await adminApi.deleteProduct(product.id);
    if (result.success) {
      loadData();
    } else {
      alert(result.message || 'Gagal menghapus produk');
    }
  };

  const filteredProducts = products.filter(p =>
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Memuat produk...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Manajemen Produk</h1>
        <button onClick={openAddModal} className="btn-primary">
          + Tambah Produk
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-controls">
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="product-count">{filteredProducts.length} produk</span>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">
                  {searchTerm ? 'Tidak ada produk yang cocok' : 'Belum ada produk'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                      {product.gambar ? (
                        <img src={product.gambar} alt={product.nama} className="product-thumb" />
                      ) : (
                        <div className="product-thumb placeholder">📷</div>
                      )}
                      <div>
                        <strong>{product.nama}</strong>
                        {product.deskripsi && (
                          <span className="product-desc">{product.deskripsi.substring(0, 50)}...</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{product.kategori}</span>
                  </td>
                  <td>
                    <div className="price-cell">
                      <strong>{formatRupiah(product.harga)}</strong>
                      {product.hargaDiskon > 0 && (
                        <span className="discount">{formatRupiah(product.hargaDiskon)}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`stock-badge ${product.stok <= 5 ? 'low' : ''}`}>
                      {product.stok}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${product.tersedia ? 'active' : 'inactive'}`}>
                      {product.tersedia ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openEditModal(product)}
                        className="btn-edit"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="btn-delete"
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button onClick={closeModal} className="btn-close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nama">Nama Produk *</label>
                  <input
                    type="text"
                    id="nama"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="kategori">Kategori</label>
                  <select
                    id="kategori"
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleChange}
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="deskripsi">Deskripsi</label>
                <textarea
                  id="deskripsi"
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="harga">Harga (Rp) *</label>
                  <input
                    type="number"
                    id="harga"
                    name="harga"
                    value={formData.harga}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="hargaDiskon">Harga Diskon (Rp)</label>
                  <input
                    type="number"
                    id="hargaDiskon"
                    name="hargaDiskon"
                    value={formData.hargaDiskon}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="stok">Stok</label>
                  <input
                    type="number"
                    id="stok"
                    name="stok"
                    value={formData.stok}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="varian">Varian (pisahkan koma)</label>
                  <input
                    type="text"
                    id="varian"
                    name="varian"
                    value={formData.varian}
                    onChange={handleChange}
                    placeholder="Coklat, Keju, Original"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="gambar">URL Gambar</label>
                <input
                  type="url"
                  id="gambar"
                  name="gambar"
                  value={formData.gambar}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="slot">Slot/Label</label>
                <input
                  type="text"
                  id="slot"
                  name="slot"
                  value={formData.slot}
                  onChange={handleChange}
                  placeholder="Best Seller, New, dll"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="tersedia"
                    checked={formData.tersedia}
                    onChange={handleChange}
                  />
                  Produk Aktif (ditampilkan di toko)
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : (editingProduct ? 'Simpan Perubahan' : 'Tambah Produk')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
