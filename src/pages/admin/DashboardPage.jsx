import { useState, useEffect } from 'react';
import * as adminApi from '../../services/adminApi';

const formatRupiah = (angka) => {
  const nilai = Number(angka) || 0;
  return 'Rp ' + nilai.toLocaleString('id-ID');
};

const statusLabels = {
  baru: { label: 'Baru', color: '#3b82f6' },
  diproses: { label: 'Diproses', color: '#f59e0b' },
  dikirim: { label: 'Dikirim', color: '#8b5cf6' },
  selesai: { label: 'Selesai', color: '#10b981' },
  dibatalkan: { label: 'Dibatalkan', color: '#ef4444' }
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminApi.getDashboard();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Gagal memuat data');
      }
    } catch (err) {
      setError('Gagal terhubung ke server. Pastikan Apps Script sudah di-deploy.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Memuat dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={loadDashboard} className="btn-primary">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const { stats, statusCounts, recentOrders, lowStockProducts, outOfStockProducts } = data || {};

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <button onClick={loadDashboard} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalProducts || 0}</span>
            <span className="stat-label">Total Produk</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalOrders || 0}</span>
            <span className="stat-label">Total Pesanan</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">{formatRupiah(stats?.totalRevenue || 0)}</span>
            <span className="stat-label">Total Pendapatan</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalItems || 0}</span>
            <span className="stat-label">Total Stok</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Status Pesanan</h2>
          <div className="status-grid">
            {Object.entries(statusCounts || {}).map(([key, count]) => (
              <div key={key} className="status-item" style={{ borderColor: statusLabels[key]?.color }}>
                <span className="status-count" style={{ color: statusLabels[key]?.color }}>{count}</span>
                <span className="status-name">{statusLabels[key]?.label || key}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Pesanan Terbaru</h2>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="recent-orders">
              {recentOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <strong>{order.namaPembeli}</strong>
                    <span className="order-date">{order.tanggal}</span>
                  </div>
                  <div className="order-meta">
                    <span className="order-total">{formatRupiah(order.total)}</span>
                    <span className="order-status" style={{ backgroundColor: statusLabels[order.status]?.color }}>
                      {statusLabels[order.status]?.label || order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">Belum ada pesanan</p>
          )}
        </div>

        {lowStockProducts && lowStockProducts.length > 0 && (
          <div className="dashboard-section">
            <h2>⚠️ Stok Menipis</h2>
            <div className="stock-alerts">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="stock-item">
                  <span>{product.nama}</span>
                  <span className="stock-count low">{product.stok} tersisa</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {outOfStockProducts && outOfStockProducts.length > 0 && (
          <div className="dashboard-section">
            <h2>🚫 Stok Habis</h2>
            <div className="stock-alerts">
              {outOfStockProducts.map((product) => (
                <div key={product.id} className="stock-item">
                  <span>{product.nama}</span>
                  <span className="stock-count out">Habis</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
