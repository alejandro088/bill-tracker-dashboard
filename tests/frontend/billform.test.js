import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BillForm from '../../frontend/src/components/BillForm.vue';

describe('BillForm component', () => {
  it('opens dialog when button clicked', async () => {
    const wrapper = mount(BillForm, { global: { stubs: ['v-date-picker'] } });
    await wrapper.find('button').trigger('click');
    expect(wrapper.vm.dialog).toBe(true);
  });
});
