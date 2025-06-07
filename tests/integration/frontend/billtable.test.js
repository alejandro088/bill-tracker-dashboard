import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BillTable from '../../frontend/src/components/BillTable.vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { createRouter, createWebHistory } from 'vue-router';
vi.mock('vuetify/styles');

const vuetify = createVuetify({ components, directives });
const router = createRouter({ history: createWebHistory(), routes: [] });

vi.mock('../../frontend/src/api.js', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: [], total: 0 } }),
    put: vi.fn().mockResolvedValue({ data: {} })
  }
}));

const bills = [
  { id: '1', name: 'Service', amount: 10, dueDate: new Date().toISOString(), category: 'subscriptions', status: 'pending', autoRenew: true }
];

describe.skip('BillTable actions', () => {
  it('emits notify when pay clicked', async () => {
    const wrapper = mount(BillTable, {
      props: {},
      global: {
        plugins: [router, vuetify],
        stubs: ['EditBillForm', 'v-date-picker']
      }
    });
    // set bills directly
    wrapper.vm.bills = bills;
    await wrapper.vm.$nextTick();
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted().notify).toBeTruthy();
  });
});
