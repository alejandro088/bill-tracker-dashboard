import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

export default defineConfig({
  plugins: [vue(), vuetify({ styles: 'none' })],
  test: {
    environment: 'jsdom',
    exclude: ['tests/frontend/**', 'node_modules/**']
  }
});
