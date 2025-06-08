<template>
  <v-dialog v-model="dialog" max-width="400" @update:modelValue="val => !val && close()">
    <v-card>
      <v-card-title>Seleccionar medio de pago</v-card-title>
      <v-card-text>
        <v-select
          v-model="provider"
          :items="providers"
          label="Medio de pago"
          density="compact"
          required
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn variant="text" color="green" @click="confirm" :disabled="!provider">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from '../api.js';

const props = defineProps({ bill: Object });
const emit = defineEmits(['paid', 'close']);

const dialog = ref(false);
const providers = ['Visa', 'Mastercard', 'MODO', 'MercadoPago', 'Google Play', 'PayPal'];
const provider = ref('');

watch(
  () => props.bill,
  (b) => {
    dialog.value = !!b;
    provider.value = b?.paymentProvider || '';
  },
  { immediate: true }
);

function close() {
  dialog.value = false;
  emit('close');
}

async function confirm() {
  if (!provider.value) return;
  await api.put(`/bills/${props.bill.id}`, {
    status: 'paid',
    paymentProvider: provider.value
  });
  emit('paid');
  close();
}
</script>

