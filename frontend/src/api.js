import axios from 'axios';

const isDevelopment = import.meta.env.DEV;

const api = axios.create({
  // En desarrollo usamos la URL completa, en producción usamos rutas relativas
  baseURL: isDevelopment ? import.meta.env.VITE_API_URL : '/api'
});

export default api;
