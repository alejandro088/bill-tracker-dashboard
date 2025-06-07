import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BillTable from '../../frontend/src/components/BillTable.vue';

vi.mock('../../frontend/src/api.js', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: [], total: 0 } }),
    put: vi.fn().mockResolvedValue({ data: {} })
  }
}));

const bills = [
  { id: '1', name: 'Service', amount: 10, dueDate: new Date().toISOString(), category: 'subscriptions', status: 'pending', autoRenew: true }
];

describe('BillTable actions', () => {
  it('emits notify when pay clicked', async () => {
    const wrapper = mount(BillTable, {
      props: { },
      global: { stubs: ['EditBillForm', 'v-date-picker'] }
    });
    // set bills directly
    wrapper.vm.bills = bills;
    await wrapper.vm.$nextTick();
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted().notify).toBeTruthy();
  });
});
