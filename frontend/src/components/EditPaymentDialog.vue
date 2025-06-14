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
          v-model="payment.paymentProvider"
          :items="providers"
          label="Payment Provider"
          density="compact"
        />
        <v-text-field
          v-model="payment.paidAt"
          label="Paid Date"
          type="date"
          density="compact"
        />
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
import { ref, watch } from 'vue';
import api from '../api.js';

const props = defineProps({ payment: Object });
const emit = defineEmits(['edited', 'close']);

const dialog = ref(false);
const providers = ['Visa', 'Mastercard', 'MODO', 'MercadoPago', 'Google Play', 'PayPal'];

const payment = ref({
  amount: 0,
  paymentProvider: '',
  paidAt: ''
});

watch(
  () => props.payment,
  (p) => {
    dialog.value = !!p;
    payment.value = p ? { ...p } : { amount: 0, paymentProvider: '', paidAt: '' };
  },
  { immediate: true }
);

function close() {
  dialog.value = false;
  emit('close');
}

async function confirm() {
  try {
    await api.put(`/payments/${payment.value.id}`, payment.value);
    emit('edited', payment.value);
    close();
  } catch (error) {
    console.error('Error editing payment:', error);
  }
}
</script>
