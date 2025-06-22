<template>
  <v-dialog v-model="dialog" max-width="500" @update:modelValue="val => !val && close()">
    <v-card>
      <v-card-title>Edit Payment</v-card-title>
      <v-card-text>
        <v-text-field
          v-model.number="payment.amount"
          type="number"
          label="Amount"
          density="compact"
          class="mr-2"
        />
        <v-select
          v-model="payment.paymentMethodId"
          :items="providers"
          item-title="title"
          item-value="value"
          label="Medio de Pago"
          density="compact"
        />
        <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition">
            <template #activator="{ props }">
              <v-text-field
                v-model="payment.paidAt"
                label="Paid Date"
                readonly
                v-bind="props"
                density="compact"
              />
            </template>
            <v-date-picker v-model="payment.paidAt" @update:modelValue="menu = false" />
          </v-menu>

      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancel</v-btn>
        <v-btn variant="text" color="green" @click="confirm">
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import api from '../api.js';

const props = defineProps({ payment: Object });
const emit = defineEmits(['edited', 'close']);

const dialog = ref(false);
const menu = ref(false);
const providers = ref([]);

const payment = ref({
  amount: 0,
  paymentMethodId: null,
  paidAt: ''
});

watch(
  () => props.payment,
  (p) => {
    dialog.value = !!p;
    if (p) {
      // Formatear la fecha ISO a YYYY-MM-DD para el input type="date"
      const paidAt = p.paidAt ? new Date(p.paidAt).toISOString().split('T')[0] : '';
      payment.value = { 
        ...p,
        paidAt 
      };
    } else {
      payment.value = { amount: 0, paymentMethodId: null, paidAt: '' };
    }
  },
  { immediate: true }
);

function close() {
  dialog.value = false;
  emit('close');
}

async function confirm() {
  try {
    // Convertir la fecha a formato ISO
    const paymentData = {
      ...payment.value,
      paidAt: payment.value.paidAt ? new Date(payment.value.paidAt).toISOString() : null
    };

    console.log('Editing payment:', paymentData);
    await api.put(`/payments/${payment.value.id}`, paymentData);
    emit('edited', paymentData);
    close();
  } catch (error) {
    console.error('Error editing payment:', error);
  }
}

async function fetchProviders() {
  try {
    const { data } = await api.get('/payment-methods');
    // Transformar los datos al formato requerido por v-select
    providers.value = data.map(method => ({
      title: method.name,
      value: method.id,
      description: method.description,
      icon: method.icon
    }));
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    // Valores por defecto en caso de error
    providers.value = [
      { title: 'Visa', value: '1' },
      { title: 'Mastercard', value: '2' },
      { title: 'MercadoPago', value: '3' },
      { title: 'Google Play', value: '4' },
      { title: 'MODO', value: '5' },
      { title: 'PayPal', value: '6' }
    ];
  }
}

// Cargar los proveedores al montar el componente
onMounted(fetchProviders);
</script>
