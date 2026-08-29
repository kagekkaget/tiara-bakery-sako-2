const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || '';

const SESSION_KEY = 'tiara_admin_session';
const SESSION_EXPIRY_KEY = 'tiara_admin_expiry';

function isSessionValid() {
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  if (!expiry) return false;
  return Date.now() < parseInt(expiry, 10);
}

function getSession() {
  if (!isSessionValid()) {
    clearSession();
    return null;
  }
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
}

function setSession(sessionData) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  const expiry = Date.now() + 24 * 60 * 60 * 1000;
  localStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString());
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
}

async function apiCall(action, method = 'GET', body = null, params = {}) {
  if (!APPS_SCRIPT_URL) {
    throw new Error('VITE_APPS_SCRIPT_URL belum diatur di .env');
  }

  const queryParams = new URLSearchParams({ action, ...params });

  try {
    if (method === 'GET') {
      const response = await fetch(`${APPS_SCRIPT_URL}?${queryParams}`, {
        redirect: 'follow'
      });
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Response not JSON:', text.substring(0, 500));
        return { success: false, message: 'Response tidak valid dari server' };
      }
    }

    const session = getSession();
    if (!session) {
      return { success: false, message: 'Session expired. Silakan login kembali.' };
    }
    const payload = {
      ...body,
      sessionToken: session.sessionToken
    };

    console.log('POST payload:', { action, payload });

    let response;
    try {
      const formData = new URLSearchParams();
      formData.append('action', action);
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });

      response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: formData
      });
    } catch (fetchError) {
      console.error('Fetch failed:', fetchError);
      return { success: false, message: 'Tidak dapat terhubung ke server. Pastikan:\n1. URL Apps Script benar\n2. Deployment di-set "Anyone"\n3. Koneksi internet stabil' };
    }
    const text = await response.text();
    console.log('POST response status:', response.status);
    console.log('POST response text:', text.substring(0, 200));
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Response not JSON:', text.substring(0, 500));
      return { success: false, message: 'Response tidak valid. Cek console untuk detail.' };
    }
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

export async function login(username, password) {
  const result = await apiCall('login', 'GET', null, { username, password });

  if (result.success && result.data) {
    setSession(result.data);
  }

  return result;
}

export async function logout() {
  const session = getSession();
  if (session?.sessionToken) {
    await apiCall('logout', 'GET', null, { sessionToken: session.sessionToken });
  }
  clearSession();
  return { success: true };
}

export async function checkSession() {
  const session = getSession();
  if (!session) return { success: false };

  const result = await apiCall('checkSession', 'GET', null, {
    sessionToken: session.sessionToken
  });

  if (!result.success) {
    clearSession();
  }

  return result;
}

export async function getDashboard() {
  return apiCall('getDashboard', 'GET');
}

export async function getProducts() {
  return apiCall('getProducts', 'GET');
}

export async function addProduct(product) {
  return apiCall('addProduct', 'POST', { product });
}

export async function updateProduct(product) {
  return apiCall('updateProduct', 'POST', { product });
}

export async function deleteProduct(id) {
  return apiCall('deleteProduct', 'POST', { id });
}

export async function getOrders() {
  return apiCall('getOrders', 'GET');
}

export async function addOrder(order) {
  return apiCall('addOrder', 'POST', { order });
}

export async function updateOrderStatus(id, status) {
  return apiCall('updateOrderStatus', 'POST', { id, status });
}

export async function getSettings() {
  return apiCall('getSettings', 'GET');
}

export async function updateSetting(key, value) {
  return apiCall('updateSetting', 'POST', { key, value });
}

export async function getCategories() {
  return apiCall('getCategories', 'GET');
}

export async function changePassword(currentPassword, newPassword) {
  return apiCall('changePassword', 'POST', { currentPassword, newPassword });
}

export async function addUser(userData) {
  return apiCall('addUser', 'POST', userData);
}

export async function initSheets() {
  return apiCall('initSheets', 'POST', {});
}

export { getSession, isSessionValid };
