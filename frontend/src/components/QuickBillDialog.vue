<template>
  <v-dialog v-model="open" max-width="500">
    <v-card v-if="bill">
      <v-card-title class="pb-0">Detalle factura</v-card-title>
      <v-card-text class="pt-0">
        <div class="mb-2">Monto: {{ formatAmount(bill.amount) }}</div>
        <div class="mb-2">Vencimiento: {{ formatDate(bill.dueDate) }}</div>
        <div>Estado: {{ bill.status }}</div>
        <v-select
          v-if="bill.status !== 'paid'"
          v-model="provider"
          :items="providers"
          label="Medio de pago"
          density="compact"
          class="mt-2"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" color="green" @click="markPaid" :disabled="bill.status==='paid'">Marcar como pagado</v-btn>
        <v-btn variant="text" @click="edit">Editar</v-btn>
        <v-btn variant="text" color="red" @click="remove">Eliminar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <EditBillForm v-if="editing" :bill="bill" @updated="onUpdated" @close="closeEdit" />
</template>

<script setup>
import { ref, watch } from 'vue';
import EditBillForm from './EditBillForm.vue';
import api from '../api.js';

const props = defineProps({ bill: Object });
const emit = defineEmits(['updated', 'close']);

const open = ref(false);
const editing = ref(false);
const providers = ['Visa', 'Mastercard', 'MercadoPago', 'Google Play', 'MODO', 'PayPal'];
const provider = ref(providers[0]);

watch(
  () => props.bill,
  (b) => {
    open.value = !!b;
    if (b) provider.value = b.paymentProvider || providers[0];
  },
  { immediate: true }
);

function close() {
  open.value = false;
  emit('close');
}

async function markPaid() {
  await api.put(`/bills/${props.bill.id}`, { status: 'paid', paymentProvider: provider.value });
  emit('updated');
  close();
}

function edit() {
  editing.value = true;
}

function closeEdit() {
  editing.value = false;
  close();
}

function onUpdated() {
  editing.value = false;
  emit('updated');
  close();
}

async function remove() {
  await api.delete(`/bills/${props.bill.id}`);
  emit('updated');
  close();
}

function formatDate(d) {
  return new Date(d).toLocaleDateString();
}
function formatAmount(a) {
  return `$${Number(a).toFixed(2)}`;
}
</script>
