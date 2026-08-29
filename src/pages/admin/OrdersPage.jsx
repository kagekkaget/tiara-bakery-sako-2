import { useState, useEffect } from 'react';
import * as adminApi from '../../services/adminApi';

const formatRupiah = (angka) => {
  const nilai = Number(angka) || 0;
  return 'Rp ' + nilai.toLocaleString('id-ID');
};

const statusOptions = [
  { value: 'baru', label: 'Baru', color: '#3b82f6' },
  { value: 'diproses', label: 'Diproses', color: '#f59e0b' },
  { value: 'dikirim', label: 'Dikirim', color: '#8b5cf6' },
  { value: 'selesai', label: 'Selesai', color: '#10b981' },
  { value: 'dibatalkan', label: 'Dibatalkan', color: '#ef4444' }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminApi.getOrders();
      if (result.success) {
        setOrders(result.data);
      } else {
        setError(result.message || 'Gagal memuat pesanan');
      }
    } catch (err) {
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(true);
    const result = await adminApi.updateOrderStatus(orderId, newStatus);
    if (result.success) {
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } else {
      alert(result.message || 'Gagal mengubah status');
    }
    setUpdating(false);
  };

  const filteredOrders = filterStatus === 'semua'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const getStatusInfo = (status) => statusOptions.find(s => s.value === status) || { label: status, color: '#6b7280' };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Memuat pesanan...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Manajemen Pesanan</h1>
        <button onClick={loadOrders} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterStatus === 'semua' ? 'active' : ''}`}
          onClick={() => setFilterStatus('semua')}
        >
          Semua ({orders.length})
        </button>
        {statusOptions.map((status) => {
          const count = orders.filter(o => o.status === status.value).length;
          return (
            <button
              key={status.value}
              className={`filter-tab ${filterStatus === status.value ? 'active' : ''}`}
              onClick={() => setFilterStatus(status.value)}
              style={{ '--status-color': status.color }}
            >
              {status.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="orders-layout">
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <p>Belum ada pesanan{filterStatus !== 'semua' ? ' dengan status ini' : ''}</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <div
                  key={order.id}
                  className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-card-header">
                    <strong>{order.namaPembeli}</strong>
                    <span className="order-status-badge" style={{ backgroundColor: statusInfo.color }}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="order-card-body">
                    <span className="order-id">#{order.id.substring(0, 12)}</span>
                    <span className="order-date">{order.tanggal}</span>
                  </div>
                  <div className="order-card-footer">
                    <span className="order-items-count">{order.items?.length || 0} item</span>
                    <strong className="order-total">{formatRupiah(order.total)}</strong>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {selectedOrder && (
          <div className="order-detail">
            <div className="detail-header">
              <h2>Detail Pesanan</h2>
              <button onClick={() => setSelectedOrder(null)} className="btn-close">✕</button>
            </div>

            <div className="detail-section">
              <h3>Informasi Pembeli</h3>
              <p><strong>Nama:</strong> {selectedOrder.namaPembeli}</p>
              <p><strong>HP:</strong> {selectedOrder.hp || '-'}</p>
              <p><strong>Alamat:</strong> {selectedOrder.alamat || '-'}</p>
              <p><strong>Tanggal:</strong> {selectedOrder.tanggal}</p>
              {selectedOrder.catatan && (
                <p><strong>Catatan:</strong> {selectedOrder.catatan}</p>
              )}
            </div>

            <div className="detail-section">
              <h3>Item Pesanan</h3>
              <div className="order-items">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <div className="item-info">
                      <span className="item-name">{item.nama}</span>
                      {item.varian && <span className="item-variant">({item.varian})</span>}
                    </div>
                    <div className="item-calc">
                      <span>{item.qty} × {formatRupiah(item.harga)}</span>
                      <strong>{formatRupiah(item.qty * item.harga)}</strong>
                    </div>
                  </div>
                ))}
                <div className="order-total-row">
                  <span>Total</span>
                  <strong>{formatRupiah(selectedOrder.total)}</strong>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Ubah Status</h3>
              <div className="status-buttons">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    className={`status-btn ${selectedOrder.status === status.value ? 'current' : ''}`}
                    onClick={() => handleStatusChange(selectedOrder.id, status.value)}
                    disabled={updating || selectedOrder.status === status.value}
                    style={{ '--status-color': status.color }}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
