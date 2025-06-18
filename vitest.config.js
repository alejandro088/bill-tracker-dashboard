// vite.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
      styles: 'expose' // opcional, expone los estilos para personalizarlos
    })
  ],
  test: {
    include: ['tests/integration/**/*.test.js'],
    environment: 'jsdom',
    exclude: ['tests/integration/frontend/**', 'node_modules/**']
  }
})
