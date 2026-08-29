import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ==========================================================================
// Konfigurasi Vite + Vercel (headers keamanan: CSP, CORS, dll)
// ==========================================================================
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
  },
  // Alias agar import lebih rapi
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    port: 5173,
    // CSP diterapkan di dev juga untuk konsistensi
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https: http:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https:; " +
        "frame-src 'self' https://www.google.com; " +
        "base-uri 'self'; form-action 'self'; " +
        "frame-ancestors 'self'; " +
        "manifest-src 'self'",
    },
  },
});
