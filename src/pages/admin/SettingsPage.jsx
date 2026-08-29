import { useState, useEffect } from 'react';
import * as adminApi from '../../services/adminApi';

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      const result = await adminApi.updateSetting(key, settings[key]);
      if (result.success) {
        setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Gagal menyimpan' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal terhubung ke server' });
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
        <h1>Pengaturan Toko</h1>
        <button
          onClick={handleSaveAll}
          className="btn-primary"
          disabled={saving}
        >
          {saving ? 'Menyimpan...' : '💾 Simpan Semua'}
        </button>
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
    </div>
  );
}
