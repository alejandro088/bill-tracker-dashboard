import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import api from './api.js';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    themes: {
      light: {
        colors: {
          onSurface: '#222', // afecta textos en menús y listas
        },
      },
    },
  },
});

// simple route guard for pages that require auth
router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.requiresAuth) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return next({ path: '/login' });
    } catch (e) {
      return next({ path: '/login' });
    }
  }
  next();
});

async function validateTokenAndMount() {
  try {
    // Use the raw pathname (available before router is mounted)
    const initialPath = window.location.pathname || '/';
    // If the initial route is the register page, skip token checks entirely
    if (initialPath === '/register') {
      createApp(App).use(router).use(vuetify).mount('#app');
      return;
    }

    const token = localStorage.getItem('auth_token');
    // If no token, redirect to login (unless already there)
    if (!token) {
      if (initialPath !== '/login') {
        await router.replace('/login').catch(() => {});
      }
      createApp(App).use(router).use(vuetify).mount('#app');
      return;
    }

    // Validate token calling backend; if invalid, backend returns 401
    await api.get('/auth/me');
  } catch (e) {
    try { localStorage.removeItem('auth_token'); } catch (err) {}
    // If currently not on login or register, redirect there after mount
    if (router.currentRoute.value.path !== '/login' && router.currentRoute.value.path !== '/register') {
      await router.replace('/login').catch(() => {});
    }
  }

  createApp(App).use(router).use(vuetify).mount('#app');
}

validateTokenAndMount();
