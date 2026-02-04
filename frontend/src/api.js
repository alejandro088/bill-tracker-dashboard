import axios from 'axios';

const isDevelopment = import.meta.env.DEV;

const api = axios.create({
  // En desarrollo usamos la URL completa, en producción usamos rutas relativas
  baseURL: isDevelopment ? import.meta.env.VITE_API_URL : '/api'
});

// Añadir token automáticamente desde localStorage
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

export default api;
