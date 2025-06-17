import { mount } from '@vue/test-utils';
import ServiceTable from '@/components/ServiceTable.vue';

describe('ServiceTable', () => {
  const mockServices = [
    {
      id: 1,
      name: 'Netflix',
      category: 'subscriptions',
      paymentProvider: 'Visa',
      recurrence: 'monthly',
      defaultCurrency: 'USD',
      autoRenew: true,
      lastBill: {
        amount: 15.99,
        status: 'paid',
        currency: 'USD'
      }
    }
  ];

  it('renders all columns correctly', () => {
    const wrapper = mount(ServiceTable, {
      props: {
        services: mockServices,
        loading: false,
        error: null
      },
      global: {
        stubs: ['v-data-table', 'v-icon', 'v-btn', 'v-chip', 'v-tooltip']
      }
    });

    // Verificar que se renderizan todas las columnas
    const headers = wrapper.vm.headers;
    expect(headers).toHaveLength(6);
    expect(headers.map(h => h.key)).toContain('name');
    expect(headers.map(h => h.key)).toContain('category');
    expect(headers.map(h => h.key)).toContain('paymentProvider');
    expect(headers.map(h => h.key)).toContain('recurrence');
    expect(headers.map(h => h.key)).toContain('lastBill');
    expect(headers.map(h => h.key)).toContain('actions');
  });

  it('emits edit event when edit button is clicked', async () => {
    const wrapper = mount(ServiceTable, {
      props: {
        services: mockServices,
        loading: false,
        error: null
      },
      global: {
        stubs: ['v-data-table', 'v-icon', 'v-btn', 'v-chip', 'v-tooltip']
      }
    });

    // Simular click en el botón de editar
    await wrapper.find('[data-test="edit-button"]').trigger('click');
    expect(wrapper.emitted()).toHaveProperty('edit');
    expect(wrapper.emitted().edit[0]).toEqual([mockServices[0]]);
  });

  it('shows loading state correctly', () => {
    const wrapper = mount(ServiceTable, {
      props: {
        services: [],
        loading: true,
        error: null
      },
      global: {
        stubs: ['v-data-table', 'v-icon', 'v-btn', 'v-chip', 'v-tooltip', 'v-progress-linear']
      }
    });

    expect(wrapper.find('v-progress-linear-stub').exists()).toBe(true);
  });

  it('shows error state correctly', () => {
    const errorMessage = 'Error loading services';
    const wrapper = mount(ServiceTable, {
      props: {
        services: [],
        loading: false,
        error: errorMessage
      },
      global: {
        stubs: ['v-data-table', 'v-icon', 'v-btn', 'v-chip', 'v-tooltip', 'v-alert']
      }
    });

    expect(wrapper.find('v-alert-stub').exists()).toBe(true);
    expect(wrapper.text()).toContain(errorMessage);
  });
});
