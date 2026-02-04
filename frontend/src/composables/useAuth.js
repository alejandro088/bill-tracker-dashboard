import { ref } from 'vue';
import api from '../api.js';

const user = ref(null);

function saveToken(token) {
  localStorage.setItem('auth_token', token);
}

function clearToken() {
  localStorage.removeItem('auth_token');
}

export async function login(username, password) {
  const res = await api.post('/auth/login', { username, password });
  const { token } = res.data || {};
  if (token) {
    saveToken(token);
    user.value = { username };
  }
  return res.data;
}

export async function register(username, email, password) {
  const res = await api.post('/auth/register', { username, email, password });
  return res.data;
}

export function logout() {
  clearToken();
  user.value = null;
}

export function getUser() {
  return user;
}

export function isAuthenticated() {
  try {
    return !!localStorage.getItem('auth_token');
  } catch (e) {
    return false;
  }
}

export default { login, register, logout, getUser, isAuthenticated };
