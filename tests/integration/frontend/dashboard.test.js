import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Dashboard from '../../frontend/src/views/Dashboard.vue';

describe('Dashboard view', () => {
  it('renders dashboard with widgets', () => {
    const wrapper = mount(Dashboard, {
      global: {
        stubs: ['BillForm', 'BillTable', 'SummaryWidget']
      }
    });
    expect(wrapper.exists()).toBe(true);
  });
});
