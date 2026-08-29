/**
 * GOOGLE APPS SCRIPT BACKEND - TIARA BAKERY ADMIN
 * ==================================================
 *
 * INSTALASI:
 * 1. Buka Google Sheets Anda
 * 2. Extensions > Apps Script
 * 3. Hapus kode default, paste seluruh kode ini
 * 4. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy URL deployment, simpan untuk VITE_APPS_SCRIPT_URL di .env
 *
 * STRUKTUR SHEET YANG DIBUTUHKAN:
 * 1. "Users"     - username | password_hash | nama | created_at
 * 2. "Products"  - id | kategori | nama | deskripsi | harga | harga_diskon | stok | varian | gambar | tersedia | slot | created_at | updated_at
 * 3. "Orders"    - id | tanggal | nama_pembeli | hp | alamat | items | total | status | catatan | created_at
 * 4. "Settings"  - key | value | updated_at
 */

// ============ KONFIGURASI ============
const SHEET_USERS = 'Users';
const SHEET_PRODUCTS = 'Products';
const SHEET_ORDERS = 'Orders';
const SHEET_SETTINGS = 'Settings';

// Session token expiry (dalam jam)
const SESSION_EXPIRY_HOURS = 24;

// ============ ENTRY POINTS ============

function doGet(e) {
  const action = e.parameter.action;

  try {
    switch (action) {
      case 'test':
        return jsonResponse({ success: true, message: 'Koneksi berhasil!', timestamp: new Date().toISOString() });
      case 'login':
        return jsonResponse(login(e.parameter));
      case 'logout':
        return jsonResponse(logout(e.parameter));
      case 'checkSession':
        return jsonResponse(checkSession(e.parameter));
      case 'getProducts':
        return jsonResponse(getProducts());
      case 'getOrders':
        return jsonResponse(getOrders());
      case 'getSettings':
        return jsonResponse(getSettings());
      case 'getDashboard':
        return jsonResponse(getDashboard());
      case 'getCategories':
        return jsonResponse(getCategories());
      default:
        return jsonResponse({ success: false, message: 'Action tidak valid' });
    }
  } catch (error) {
    return jsonResponse({ success: false, message: error.toString() });
  }
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ success: false, message: 'Invalid JSON body' });
  }

  if (!verifySession(data.sessionToken)) {
    return jsonResponse({ success: false, message: 'Session tidak valid. Silakan login kembali.' });
  }

  try {
    switch (data.action) {
      case 'addProduct':
        return jsonResponse(addProduct(data));
      case 'updateProduct':
        return jsonResponse(updateProduct(data));
      case 'deleteProduct':
        return jsonResponse(deleteProduct(data));
      case 'addOrder':
        return jsonResponse(addOrder(data));
      case 'updateOrderStatus':
        return jsonResponse(updateOrderStatus(data));
      case 'updateSetting':
        return jsonResponse(updateSetting(data));
      case 'changePassword':
        return jsonResponse(changePassword(data));
      case 'initSheets':
        return jsonResponse(initSheets());
      default:
        return jsonResponse({ success: false, message: 'Action tidak valid' });
    }
  } catch (error) {
    return jsonResponse({ success: false, message: error.toString() });
  }
}

// ============ AUTH FUNCTIONS ============

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function checkRateLimit(username) {
  const cache = ScriptCache.get('login_' + username.toLowerCase());

  if (cache) {
    const attempts = parseInt(cache, 10);
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      return { locked: true, message: 'Terlalu banyak percobaan. Coba lagi dalam ' + LOCKOUT_MINUTES + ' menit.' };
    }
  }

  return { locked: false };
}

function recordFailedAttempt(username) {
  const key = 'login_' + username.toLowerCase();
  const cache = ScriptCache.get(key);
  const attempts = cache ? parseInt(cache, 10) + 1 : 1;
  ScriptCache.put(key, attempts.toString(), LOCKOUT_MINUTES * 60);
}

function clearFailedAttempts(username) {
  ScriptCache.remove('login_' + username.toLowerCase());
}

function login(params) {
  const { username, password } = params;

  if (!username || !password) {
    return { success: false, message: 'Username dan password wajib diisi' };
  }

  const rateLimit = checkRateLimit(username);
  if (rateLimit.locked) {
    return { success: false, message: rateLimit.message };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, SHEET_USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().toLowerCase());

  const usernameIdx = headers.indexOf('username');
  const passwordIdx = headers.indexOf('password_hash');
  const namaIdx = headers.indexOf('nama');

  if (usernameIdx === -1 || passwordIdx === -1) {
    return { success: false, message: 'Sheet Users belum diinisialisasi. Jalankan initSheets terlebih dahulu.' };
  }

  for (let i = 1; i < data.length; i++) {
    if (data[i][usernameIdx] && data[i][usernameIdx].toString().toLowerCase() === username.toLowerCase()) {
      const storedHash = data[i][passwordIdx].toString();

      if (verifyPassword(password, storedHash)) {
        clearFailedAttempts(username);
        const sessionToken = createSession(username);
        const nama = namaIdx !== -1 ? data[i][namaIdx] : username;

        return {
          success: true,
          message: 'Login berhasil',
          data: {
            username,
            nama,
            sessionToken
          }
        };
      } else {
        recordFailedAttempt(username);
        return { success: false, message: 'Password salah' };
      }
    }
  }

  recordFailedAttempt(username);
  return { success: false, message: 'Username tidak ditemukan' };
}

function logout(params) {
  const { sessionToken } = params;
  if (!sessionToken) {
    return { success: true, message: 'Logout berhasil' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Sessions');
  if (sheet) {
    const data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === sessionToken) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
  }

  return { success: true, message: 'Logout berhasil' };
}

function checkSession(params) {
  const { sessionToken } = params;
  const valid = verifySession(sessionToken);

  if (valid) {
    return { success: true, message: 'Session valid', data: valid };
  }
  return { success: false, message: 'Session tidak valid atau sudah expired' };
}

function createSession(username) {
  const token = generateUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, 'Sessions', [['token', 'username', 'expires_at', 'created_at']]);
  sheet.appendRow([token, username, expiresAt.toISOString(), new Date().toISOString()]);

  return token;
}

function verifySession(token) {
  if (!token) return false;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getheetByName('Sessions');
  if (!sheet) return false;

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().toLowerCase());
  const tokenIdx = headers.indexOf('token');
  const usernameIdx = headers.indexOf('username');
  const expiresIdx = headers.indexOf('expires_at');

  for (let i = 1; i < data.length; i++) {
    if (data[i][tokenIdx] === token) {
      const expiresAt = new Date(data[i][expiresIdx]);
      if (expiresAt > new Date()) {
        return { username: data[i][usernameIdx] };
      } else {
        sheet.deleteRow(i + 1);
        return false;
      }
    }
  }

  return false;
}

function changePassword(data) {
  const { currentPassword, newPassword, sessionToken } = data;
  const session = verifySession(sessionToken);

  if (!session) {
    return { success: false, message: 'Session tidak valid' };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'Password baru minimal 6 karakter' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_USERS);
  const sheetData = sheet.getDataRange().getValues();
  const headers = sheetData[0].map(h => h.toString().toLowerCase());
  const usernameIdx = headers.indexOf('username');
  const passwordIdx = headers.indexOf('password_hash');

  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][usernameIdx].toString().toLowerCase() === session.username.toLowerCase()) {
      if (!verifyPassword(currentPassword, sheetData[i][passwordIdx])) {
        return { success: false, message: 'Password saat ini salah' };
      }

      const newHash = hashPassword(newPassword);
      sheet.getRange(i + 1, passwordIdx + 1).setValue(newHash);
      return { success: true, message: 'Password berhasil diubah' };
    }
  }

  return { success: false, message: 'User tidak ditemukan' };
}

// ============ PRODUCT FUNCTIONS ============

function getProducts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PRODUCTS);

  if (!sheet) {
    return { success: true, data: [] };
  }

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    return { success: true, data: [] };
  }

  const headers = data[0].map(h => h.toString().toLowerCase().replace(/\s+/g, '_'));
  const products = [];

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    const product = {};
    headers.forEach((h, idx) => {
      product[h] = data[i][idx];
    });
    products.push({
      id: product.id || '',
      kategori: product.kategori || '',
      nama: product.nama || '',
      deskripsi: product.deskripsi || '',
      harga: Number(product.harga) || 0,
      hargaDiskon: Number(product.harga_diskon) || 0,
      stok: Number(product.stok) || 0,
      varian: product.varian ? product.varian.split(',').map(v => v.trim()).filter(Boolean) : [],
      gambar: product.gambar || '',
      tersedia: product.tersedia === true || product.tersedia === 'TRUE' || product.tersedia === 'true',
      slot: product.slot || '',
      createdAt: product.created_at || '',
      updatedAt: product.updated_at || ''
    });
  }

  return { success: true, data: products };
}

function addProduct(data) {
  const { product } = data;
  if (!product || !product.nama) {
    return { success: false, message: 'Data produk tidak valid' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, SHEET_PRODUCTS, [[
    'id', 'kategori', 'nama', 'deskripsi', 'harga', 'harga_diskon',
    'stok', 'varian', 'gambar', 'tersedia', 'slot', 'created_at', 'updated_at'
  ]]);

  const now = new Date().toISOString();
  const id = product.id || 'prod_' + generateUUID().substring(0, 8);

  sheet.appendRow([
    id,
    product.kategori || '',
    product.nama,
    product.deskripsi || '',
    Number(product.harga) || 0,
    Number(product.hargaDiskon) || 0,
    Number(product.stok) || 0,
    Array.isArray(product.varian) ? product.varian.join(', ') : (product.varian || ''),
    product.gambar || '',
    product.tersedia !== false ? 'TRUE' : 'FALSE',
    product.slot || '',
    now,
    now
  ]);

  return { success: true, message: 'Produk berhasil ditambahkan', data: { id } };
}

function updateProduct(data) {
  const { product } = data;
  if (!product || !product.id) {
    return { success: false, message: 'ID produk wajib diisi' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PRODUCTS);
  if (!sheet) {
    return { success: false, message: 'Sheet Products tidak ditemukan' };
  }

  const dataRange = sheet.getDataRange().getValues();
  const idCol = 0;

  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][idCol].toString() === product.id.toString()) {
      const now = new Date().toISOString();

      if (product.kategori !== undefined) sheet.getRange(i + 1, 2).setValue(product.kategori);
      if (product.nama !== undefined) sheet.getRange(i + 1, 3).setValue(product.nama);
      if (product.deskripsi !== undefined) sheet.getRange(i + 1, 4).setValue(product.deskripsi);
      if (product.harga !== undefined) sheet.getRange(i + 1, 5).setValue(Number(product.harga) || 0);
      if (product.hargaDiskon !== undefined) sheet.getRange(i + 1, 6).setValue(Number(product.hargaDiskon) || 0);
      if (product.stok !== undefined) sheet.getRange(i + 1, 7).setValue(Number(product.stok) || 0);
      if (product.varian !== undefined) {
        const varianStr = Array.isArray(product.varian) ? product.varian.join(', ') : product.varian;
        sheet.getRange(i + 1, 8).setValue(varianStr);
      }
      if (product.gambar !== undefined) sheet.getRange(i + 1, 9).setValue(product.gambar);
      if (product.tersedia !== undefined) {
        sheet.getRange(i + 1, 10).setValue(product.tersedia ? 'TRUE' : 'FALSE');
      }
      if (product.slot !== undefined) sheet.getRange(i + 1, 11).setValue(product.slot);
      sheet.getRange(i + 1, 13).setValue(now);

      return { success: true, message: 'Produk berhasil diperbarui' };
    }
  }

  return { success: false, message: 'Produk tidak ditemukan' };
}

function deleteProduct(data) {
  const { id } = data;
  if (!id) {
    return { success: false, message: 'ID produk wajib diisi' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PRODUCTS);
  if (!sheet) {
    return { success: false, message: 'Sheet Products tidak ditemukan' };
  }

  const dataRange = sheet.getDataRange().getValues();

  for (let i = dataRange.length - 1; i >= 1; i--) {
    if (dataRange[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Produk berhasil dihapus' };
    }
  }

  return { success: false, message: 'Produk tidak ditemukan' };
}

function getCategories() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Categories');

  if (!sheet) {
    return { success: true, data: [
      { id: 'semua', nama: 'Semua', icon: '🍽️' },
      { id: 'kue-basah', nama: 'Kue Basah', icon: '🍰' },
      { id: 'jajanan-pasar', nama: 'Jajanan Pasar', icon: '🥧' },
      { id: 'tart', nama: 'Tart', icon: '🎂' },
      { id: 'snack-box', nama: 'Snack Box', icon: '🍱' },
      { id: 'roti', nama: 'Roti', icon: '🍞' },
      { id: 'minuman', nama: 'Minuman', icon: '🥤' }
    ]};
  }

  const data = sheet.getDataRange().getValues();
  const categories = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      categories.push({
        id: data[i][0],
        nama: data[i][1] || data[i][0],
        icon: data[i][2] || '🏷️'
      });
    }
  }

  return { success: true, data: categories };
}

// ============ ORDER FUNCTIONS ============

function getOrders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ORDERS);

  if (!sheet) {
    return { success: true, data: [] };
  }

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    return { success: true, data: [] };
  }

  const headers = data[0].map(h => h.toString().toLowerCase().replace(/\s+/g, '_'));
  const orders = [];

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    const order = {};
    headers.forEach((h, idx) => {
      order[h] = data[i][idx];
    });

    let items = [];
    try {
      items = order.items ? JSON.parse(order.items) : [];
    } catch (e) {
      items = [];
    }

    orders.push({
      id: order.id || '',
      tanggal: order.tanggal || '',
      namaPembeli: order.nama_pembeli || '',
      hp: order.hp || '',
      alamat: order.alamat || '',
      items: items,
      total: Number(order.total) || 0,
      status: order.status || 'baru',
      catatan: order.catatan || '',
      createdAt: order.created_at || ''
    });
  }

  return { success: true, data: orders.reverse() };
}

function addOrder(data) {
  const { order } = data;
  if (!order || !order.namaPembeli || !order.items || !order.items.length) {
    return { success: false, message: 'Data pesanan tidak valid' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, SHEET_ORDERS, [[
    'id', 'tanggal', 'nama_pembeli', 'hp', 'alamat', 'items',
    'total', 'status', 'catatan', 'created_at'
  ]]);

  const now = new Date();
  const id = 'ord_' + now.getTime().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const tanggal = now.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  sheet.appendRow([
    id,
    tanggal,
    order.namaPembeli,
    order.hp || '',
    order.alamat || '',
    JSON.stringify(order.items),
    Number(order.total) || 0,
    'baru',
    order.catatan || '',
    now.toISOString()
  ]);

  return { success: true, message: 'Pesanan berhasil ditambahkan', data: { id } };
}

function updateOrderStatus(data) {
  const { id, status } = data;
  if (!id || !status) {
    return { success: false, message: 'ID dan status wajib diisi' };
  }

  const validStatuses = ['baru', 'diproses', 'dikirim', 'selesai', 'dibatalkan'];
  if (!validStatuses.includes(status)) {
    return { success: false, message: 'Status tidak valid' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ORDERS);
  if (!sheet) {
    return { success: false, message: 'Sheet Orders tidak ditemukan' };
  }

  const dataRange = sheet.getDataRange().getValues();
  const headers = dataRange[0].map(h => h.toString().toLowerCase().replace(/\s+/g, '_'));
  const idIdx = headers.indexOf('id');
  const statusIdx = headers.indexOf('status');

  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][idIdx].toString() === id.toString()) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(status);
      return { success: true, message: 'Status pesanan berhasil diperbarui' };
    }
  }

  return { success: false, message: 'Pesanan tidak ditemukan' };
}

// ============ SETTINGS FUNCTIONS ============

function getSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_SETTINGS);

  const defaultSettings = {
    storeName: 'TIARA BAKERY SAKO PALEMBANG',
    storeShortName: 'Tiara Bakery',
    tagline: 'Roti, Kue Basah & Jajanan Pasar Pilihan',
    description: 'Toko roti dan jajanan pasar lokal di Palembang.',
    logo: '/logos/logo-tiara-bakery.svg',
    heroImage: '/logos/hero-tiara-bakery.svg',
    phoneDisplay: '+62 812-3456-7890',
    whatsapp: '6281234567890',
    email: 'halo@tiarabakery.id',
    address: 'Jl. Sako Baru, Kec. Sako, Kota Palembang, Sumatera Selatan 30163',
    googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.2!2d104.8!3d-2.98!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwNTgnNDguOCJTIDEwNMKwNDgnMDAuMCJF!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid',
    googleMapsLink: 'https://maps.google.com/?q=Sako+Palembang',
    copyright: 'Copyright MZF - 2026'
  };

  if (!sheet) {
    return { success: true, data: defaultSettings };
  }

  const data = sheet.getDataRange().getValues();
  const settings = { ...defaultSettings };

  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const value = data[i][1];
    if (key && value !== undefined && value !== '') {
      settings[key.toString()] = value.toString();
    }
  }

  return { success: true, data: settings };
}

function updateSetting(data) {
  const { key, value } = data;
  if (!key) {
    return { success: false, message: 'Key wajib diisi' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, SHEET_SETTINGS, [['key', 'value', 'updated_at']]);

  const dataRange = sheet.getDataRange().getValues();

  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0].toString() === key.toString()) {
      sheet.getRange(i + 1, 2).setValue(value);
      sheet.getRange(i + 1, 3).setValue(new Date().toISOString());
      return { success: true, message: 'Pengaturan berhasil diperbarui' };
    }
  }

  sheet.appendRow([key, value, new Date().toISOString()]);
  return { success: true, message: 'Pengaturan berhasil ditambahkan' };
}

// ============ DASHBOARD FUNCTIONS ============

function getDashboard() {
  const products = getProducts();
  const orders = getOrders();
  const settings = getSettings();

  const productList = products.data || [];
  const orderList = orders.data || [];

  const totalProducts = productList.length;
  const totalOrders = orderList.length;
  const totalRevenue = orderList
    .filter(o => o.status !== 'dibatalkan')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const recentOrders = orderList.slice(0, 5);
  const lowStockProducts = productList.filter(p => Number(p.stok) > 0 && Number(p.stok) <= 5);
  const outOfStockProducts = productList.filter(p => Number(p.stok) === 0);

  const statusCounts = {
    baru: orderList.filter(o => o.status === 'baru').length,
    diproses: orderList.filter(o => o.status === 'diproses').length,
    dikirim: orderList.filter(o => o.status === 'dikirim').length,
    selesai: orderList.filter(o => o.status === 'selesai').length,
    dibatalkan: orderList.filter(o => o.status === 'dibatalkan').length
  };

  return {
    success: true,
    data: {
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
        totalItems: productList.reduce((sum, p) => sum + Number(p.stok), 0)
      },
      statusCounts,
      recentOrders,
      lowStockProducts,
      outOfStockProducts,
      settings: settings.data
    }
  };
}

// ============ INITIALIZATION ============

function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Users sheet with default admin
  const usersSheet = getOrCreateSheet(ss, SHEET_USERS, [[
    'username', 'password_hash', 'nama', 'created_at'
  ]]);
  if (usersSheet.getLastRow() === 1) {
    usersSheet.appendRow([
      'admin',
      hashPassword('admin123'),
      'Administrator',
      new Date().toISOString()
    ]);
  }

  // Products sheet
  getOrCreateSheet(ss, SHEET_PRODUCTS, [[
    'id', 'kategori', 'nama', 'deskripsi', 'harga', 'harga_diskon',
    'stok', 'varian', 'gambar', 'tersedia', 'slot', 'created_at', 'updated_at'
  ]]);

  // Orders sheet
  getOrCreateSheet(ss, SHEET_ORDERS, [[
    'id', 'tanggal', 'nama_pembeli', 'hp', 'alamat', 'items',
    'total', 'status', 'catatan', 'created_at'
  ]]);

  // Settings sheet
  getOrCreateSheet(ss, SHEET_SETTINGS, [['key', 'value', 'updated_at']]);

  // Sessions sheet (hidden)
  getOrCreateSheet(ss, 'Sessions', [['token', 'username', 'expires_at', 'created_at']]);

  // Categories sheet
  getOrCreateSheet(ss, 'Categories', [['id', 'nama', 'icon']]);
  const catSheet = ss.getSheetByName('Categories');
  if (catSheet.getLastRow() === 1) {
    const defaultCats = [
      ['semua', 'Semua', '🍽️'],
      ['kue-basah', 'Kue Basah', '🍰'],
      ['jajanan-pasar', 'Jajanan Pasar', '🥧'],
      ['tart', 'Tart', '🎂'],
      ['snack-box', 'Snack Box', '🍱'],
      ['roti', 'Roti', '🍞'],
      ['minuman', 'Minuman', '🥤']
    ];
    defaultCats.forEach(cat => catSheet.appendRow(cat));
  }

  return {
    success: true,
    message: 'Semua sheet berhasil diinisialisasi. Default login: admin / admin123',
    sheets: ['Users', 'Products', 'Orders', 'Settings', 'Sessions', 'Categories']
  };
}

// ============ HELPERS ============

function generateUUID() {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length) {
      sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
      sheet.getRange(1, 1, 1, headers[0].length)
        .setFontWeight('bold')
        .setBackground('#4285f4')
        .setFontColor('#ffffff');
    }
  }
  return sheet;
}

function hashPassword(password) {
  const salt = generateUUID().replace(/-/g, '');
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + password,
    Utilities.Charset.UTF_8
  );
  const hashHex = hash.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
  return salt + ':' + hashHex;
}

function verifyPassword(password, storedHash) {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;

  const salt = parts[0];
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + password,
    Utilities.Charset.UTF_8
  );
  const hashHex = hash.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');

  return hashHex === parts[1];
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleOptions(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
