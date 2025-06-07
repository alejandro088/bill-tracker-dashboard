import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../../frontend/src/App.vue';
import router from '../../frontend/src/router/index.js';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { vi } from 'vitest';
vi.mock('vuetify/styles');

const vuetify = createVuetify({ components, directives });

describe.skip('navigation', () => {
it('navigates between tabs', async () => {
  router.push('/');
  await router.isReady();
  const wrapper = mount(App, {
    global: {
      plugins: [router, vuetify],
      stubs: ['BillForm', 'BillTable', 'SummaryWidget', 'v-date-picker']
    }
  });
  await router.push('/assistant');
  await wrapper.vm.$nextTick();
  expect(router.currentRoute.value.path).toBe('/assistant');
});
});
