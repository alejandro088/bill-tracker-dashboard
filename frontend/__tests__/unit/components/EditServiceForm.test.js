import { mount } from '@vue/test-utils';
import EditServiceForm from '@/components/EditServiceForm.vue';

describe('EditServiceForm', () => {
  const mockService = {
    id: 1,
    name: 'Netflix',
    defaultCurrency: 'USD',
    category: 'subscriptions',
    paymentProvider: 'Visa',
    recurrence: 'monthly',
    autoRenew: true
  };

  it('initializes form with service data', () => {
    const wrapper = mount(EditServiceForm, {
      props: {
        service: mockService
      },
      global: {
        stubs: ['v-dialog', 'v-card', 'v-form', 'v-text-field', 'v-select', 'v-switch', 'v-btn']
      }
    });

    expect(wrapper.vm.formData).toEqual({
      name: mockService.name,
      defaultCurrency: mockService.defaultCurrency,
      category: mockService.category,
      paymentProvider: mockService.paymentProvider,
      recurrence: mockService.recurrence,
      autoRenew: mockService.autoRenew
    });
  });

  it('emits close event when cancel button is clicked', async () => {
    const wrapper = mount(EditServiceForm, {
      props: {
        service: mockService
      },
      global: {
        stubs: ['v-dialog', 'v-card', 'v-form', 'v-text-field', 'v-select', 'v-switch', 'v-btn']
      }
    });

    await wrapper.find('[data-test="cancel-button"]').trigger('click');
    expect(wrapper.emitted()).toHaveProperty('close');
  });

  it('validates required fields before submission', async () => {
    const wrapper = mount(EditServiceForm, {
      props: {
        service: mockService
      },
      global: {
        stubs: ['v-dialog', 'v-card', 'v-form', 'v-text-field', 'v-select', 'v-switch', 'v-btn']
      }
    });

    // Simular formulario inválido
    wrapper.vm.form = {
      validate: () => Promise.resolve({ valid: false })
    };

    await wrapper.find('[data-test="save-button"]').trigger('click');
    expect(wrapper.emitted()).not.toHaveProperty('updated');
  });
});
