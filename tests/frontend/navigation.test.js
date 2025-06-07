import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../../frontend/src/App.vue';
import router from '../../frontend/src/router/index.js';

it('navigates between tabs', async () => {
  router.push('/');
  await router.isReady();
  const wrapper = mount(App, { global: { plugins: [router], stubs: ['BillForm', 'BillTable', 'SummaryWidget', 'v-date-picker'] } });
  await router.push('/assistant');
  await wrapper.vm.$nextTick();
  expect(router.currentRoute.value.path).toBe('/assistant');
});
