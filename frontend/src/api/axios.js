import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({ baseURL: BASE_URL });

// --- token helpers -------------------------------------------------------
export const tokenStore = {
  getAccess: () => localStorage.getItem('access'),
  getRefresh: () => localStorage.getItem('refresh'),
  set: ({ access, refresh }) => {
    if (access) localStorage.setItem('access', access);
    if (refresh) localStorage.setItem('refresh', refresh);
  },
  clear: () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
  },
};

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const access = tokenStore.getAccess();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// On a 401, try refreshing the access token once and retry the request.
let isRefreshing = false;
let queue = [];

function processQueue(error, token = null) {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  queue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && tokenStore.getRefresh()) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/accounts/refresh/`, {
          refresh: tokenStore.getRefresh(),
        });
        tokenStore.set({ access: data.access });
        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStore.clear();
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function firstErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return err.message || 'Something went wrong.';
  if (data.detail) return data.detail;
  const key = Object.keys(data)[0];
  if (!key) return 'Something went wrong.';
  const val = data[key];
  return Array.isArray(val) ? `${key}: ${val[0]}` : `${key}: ${val}`;
}

export default api;
