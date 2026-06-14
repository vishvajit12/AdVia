// =====================================================================
// AdVia Frontend — API Client
// A single axios instance shared across the app. Automatically attaches
// the JWT (from localStorage) to every request, and redirects to /login
// on a 401 (expired/invalid token).
// =====================================================================
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('advia_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('advia_token');
      localStorage.removeItem('advia_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/** Extract a human-readable message from an axios error. */
export function getErrorMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.errors?.[0]?.message ||
    err?.message ||
    'Something went wrong. Please try again.'
  );
}

export default api;
