import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BillForm from '../../frontend/src/components/BillForm.vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { vi } from 'vitest';
vi.mock('vuetify/styles');

const vuetify = createVuetify({ components, directives });

describe.skip('BillForm component', () => {
  it('opens dialog when button clicked', async () => {
    const wrapper = mount(BillForm, {
      global: { plugins: [vuetify], stubs: ['v-date-picker'] }
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.vm.dialog).toBe(true);
  });
});
