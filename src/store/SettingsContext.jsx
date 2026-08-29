import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setWhatsAppConfig } from '../utils/whatsapp';

const SettingsContext = createContext(null);

const defaultSettings = {
  storeName: 'TIARA BAKERY SAKO PALEMBANG',
  storeShortName: 'Tiara Bakery',
  tagline: 'Roti, Kue Basah & Jajanan Pasar Pilihan',
  description: 'Toko roti dan jajanan pasar lokal di Palembang.',
  logo: '/logos/logo-tiara-bakery.svg',
  logoAlt: 'Logo Tiara Bakery Sako Palembang',
  favicon: '/logos/logo-tiara-bakery.svg',
  heroImage: '/logos/hero-tiara-bakery.svg',
  phoneDisplay: '+62 812-3456-7890',
  whatsapp: '6281234567890',
  email: 'halo@tiarabakery.id',
  address: 'Jl. Sako Baru, Kec. Sako, Kota Palembang, Sumatera Selatan 30163',
  googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.2!2d104.8!3d-2.98!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwNTgnNDguOCJTIDEwNMKwNDgnMDAuMCJF!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid',
  googleMapsLink: 'https://maps.google.com/?q=Sako+Palembang',
  copyright: 'Copyright MZF - 2026',
  openingHours: [
    { day: 'Senin - Jumat', hours: '08.00 - 20.00 WIB' },
    { day: 'Sabtu', hours: '08.00 - 21.00 WIB' },
    { day: 'Minggu', hours: '07.00 - 21.00 WIB' }
  ],
  navLinks: [
    { label: 'Beranda', to: '/' },
    { label: 'Produk', to: '/produk' },
    { label: 'Tentang', to: '/tentang' },
    { label: 'Kontak', to: '/kontak' }
  ]
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
      if (!appsScriptUrl) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${appsScriptUrl}?action=getSettings`);
      const result = await response.json();

      if (result.success && result.data) {
        setSettings(prev => ({ ...prev, ...result.data }));
      }
    } catch (err) {
      console.warn('Gagal memuat settings, menggunakan default:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setWhatsAppConfig(settings);
  }, [settings]);

  const refreshSettings = useCallback(() => {
    setLoading(true);
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings harus dipakai di dalam SettingsProvider');
  }
  return context;
}
