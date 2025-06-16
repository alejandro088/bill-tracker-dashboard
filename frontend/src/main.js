import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
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

createApp(App).use(router).use(vuetify).mount('#app');
