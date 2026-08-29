// ==========================================================================
// UTILITAS WHATSAPP - membuat link wa.me yang aman & ter-encode
// ==========================================================================

import { appConfig } from "../config/appConfig";
import { buildWhatsAppMessage } from "./sanitize";

// Gabungkan nomor hp + pesan menjadi URL wa.me yang aman.
function waLink(phone, message) {
  const clean = String(phone || appConfig.whatsapp).replace(/[^0-9]/g, "");
  const base = `https://wa.me/${clean}`;
  const encoded = encodeURIComponent(message);
  return `${base}?text=${encoded}`;
}

// Buka WhatsApp di tab baru.
export function openWa(message, phone) {
  return waLink(phone, message);
}

// Membangun pesan pesanan siap kirim dari data keranjang + pengiriman.
export function buildOrderMessage(items, subtotal, shipping) {
  const lines = [
    `*PESANAN BARU - ${appConfig.storeName}*`,
    "--------------------------------",
    "",
  ];

  items.forEach((it, i) => {
    const price = it.price;
    lines.push(`${i + 1}. ${it.name}${it.variant && it.variant !== "Default" ? ` (${it.variant})` : ""}`);
    lines.push(`   ${it.qty} x ${formatRupiah(price)} = ${formatRupiah(price * it.qty)}`);
  });

  lines.push("--------------------------------");
  lines.push(`*Subtotal*: ${formatRupiah(subtotal)}`);
  if (shipping && shipping.ongkir) {
    lines.push(`*Ongkir*: ${formatRupiah(shipping.ongkir)}`);
  }
  const total = shipping && shipping.ongkir ? subtotal + shipping.ongkir : subtotal;
  lines.push(`*TOTAL*: ${formatRupiah(total)}`);
  lines.push("");

  if (shipping) {
    lines.push("--------------------------------");
    lines.push("*Detail Pengiriman*");
    lines.push(`Nama   : ${shipping.nama}`);
    lines.push(`HP     : ${shipping.hp}`);
    if (shipping.alamat) lines.push(`Alamat : ${shipping.alamat}`);
    if (shipping.catatan) lines.push(`Catatan: ${shipping.catatan}`);
  }
  lines.push("");
  lines.push(`_${appConfig.copyright}_`);

  return buildWhatsAppMessage(lines);
}

export function formatRupiah(angka) {
  return "Rp " + (Number(angka) || 0).toLocaleString("id-ID");
}
