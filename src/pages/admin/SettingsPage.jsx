import { useState, useEffect } from 'react';
import * as adminApi from '../../services/adminApi';

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [userForm, setUserForm] = useState({ username: '', password: '', nama: '' });
  const [passwordError, setPasswordError] = useState('');
  const [userError, setUserError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const result = await adminApi.getSettings();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal memuat pengaturan' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key) => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Saving:', key, settings[key]);
      const result = await adminApi.updateSetting(key, settings[key]);
      console.log('Save result:', result);
      if (result.success) {
        setMessage({ type: 'success', text: `${labelForKey(key)} berhasil disimpan` });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Gagal menyimpan' });
      }
    } catch (err) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: 'Gagal terhubung: ' + (err.message || 'Unknown error') });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const keys = Object.keys(settings);
      for (const key of keys) {
        await adminApi.updateSetting(key, settings[key]);
      }
      setMessage({ type: 'success', text: 'Semua pengaturan berhasil disimpan' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Password baru tidak cocok');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password minimal 6 karakter');
      return;
    }

    try {
      const result = await adminApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        setMessage({ type: 'success', text: 'Password berhasil diubah' });
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setPasswordError(result.message || 'Gagal mengubah password');
      }
    } catch (err) {
      setPasswordError('Gagal terhubung ke server');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setUserError('');

    if (!userForm.username || !userForm.password || !userForm.nama) {
      setUserError('Semua field wajib diisi');
      return;
    }

    if (userForm.password.length < 6) {
      setUserError('Password minimal 6 karakter');
      return;
    }

    try {
      const result = await adminApi.addUser(userForm);
      if (result.success) {
        setMessage({ type: 'success', text: `User ${userForm.username} berhasil ditambahkan` });
        setShowUserModal(false);
        setUserForm({ username: '', password: '', nama: '' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setUserError(result.message || 'Gagal menambahkan user');
      }
    } catch (err) {
      setUserError('Gagal terhubung ke server');
    }
  };

  const labelForKey = (key) => {
    const labels = {
      storeName: 'Nama Toko',
      storeShortName: 'Nama Pendek',
      tagline: 'Tagline',
      description: 'Deskripsi',
      phoneDisplay: 'No. Telepon',
      whatsapp: 'WhatsApp',
      email: 'Email',
      address: 'Alamat',
      logo: 'URL Logo',
      heroImage: 'URL Gambar Hero',
      googleMapsEmbed: 'Google Maps Embed',
      googleMapsLink: 'Google Maps Link',
      copyright: 'Copyright'
    };
    return labels[key] || key;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Memuat pengaturan...</p>
      </div>
    );
  }

  const settingGroups = [
    {
      title: 'Identitas Toko',
      fields: [
        { key: 'storeName', label: 'Nama Toko', type: 'text' },
        { key: 'storeShortName', label: 'Nama Pendek', type: 'text' },
        { key: 'tagline', label: 'Tagline', type: 'text' },
        { key: 'description', label: 'Deskripsi', type: 'textarea' }
      ]
    },
    {
      title: 'Kontak & Alamat',
      fields: [
        { key: 'phoneDisplay', label: 'No. Telepon (tampilan)', type: 'text' },
        { key: 'whatsapp', label: 'WhatsApp (tanpa +)', type: 'text', hint: 'Contoh: 6281234567890' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'address', label: 'Alamat', type: 'textarea' }
      ]
    },
    {
      title: 'Media & Link',
      fields: [
        { key: 'logo', label: 'URL Logo', type: 'url' },
        { key: 'heroImage', label: 'URL Gambar Hero', type: 'url' },
        { key: 'googleMapsEmbed', label: 'Google Maps Embed URL', type: 'url' },
        { key: 'googleMapsLink', label: 'Google Maps Link', type: 'url' }
      ]
    },
    {
      title: 'Lainnya',
      fields: [
        { key: 'copyright', label: 'Copyright', type: 'text' }
      ]
    }
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Pengaturan</h1>
        <div className="header-actions">
          <button onClick={() => setShowPasswordModal(true)} className="btn-secondary">
            🔑 Ubah Password
          </button>
          <button onClick={() => setShowUserModal(true)} className="btn-secondary">
            + Tambah Admin
          </button>
          <button
            onClick={handleSaveAll}
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Menyimpan...' : '💾 Simpan Semua'}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-grid">
        {settingGroups.map((group) => (
          <div key={group.title} className="settings-section">
            <h2>{group.title}</h2>
            {group.fields.map((field) => (
              <div key={field.key} className="settings-field">
                <label htmlFor={field.key}>{field.label}</label>
                {field.hint && <small className="field-hint">{field.hint}</small>}
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.key}
                    value={settings[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    rows="3"
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.key}
                    value={settings[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                )}
                <button
                  onClick={() => handleSave(field.key)}
                  className="btn-save-field"
                  disabled={saving}
                >
                  Simpan
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ubah Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="btn-close">✕</button>
            </div>
            <form onSubmit={handleChangePassword} className="password-form">
              {passwordError && <div className="error-message">{passwordError}</div>}
              <div className="form-group">
                <label>Password Saat Ini</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password Baru</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Ubah Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tambah Admin Baru</h2>
              <button onClick={() => setShowUserModal(false)} className="btn-close">✕</button>
            </div>
            <form onSubmit={handleAddUser} className="password-form">
              {userError && <div className="error-message">{userError}</div>}
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  value={userForm.nama}
                  onChange={(e) => setUserForm(p => ({ ...p, nama: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) => setUserForm(p => ({ ...p, username: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm(p => ({ ...p, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowUserModal(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Tambah Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
