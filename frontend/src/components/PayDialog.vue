<template>
  <v-dialog v-model="dialog" max-width="500" @update:modelValue="val => !val && close()">
    <v-card>
      <v-card-title>Pagar factura</v-card-title>
      <v-card-text>
        <div v-for="(p, i) in payments" :key="i" class="d-flex align-center mb-2">
          <v-text-field
            v-model.number="p.amount"
            type="number"
            label="Monto"
            density="compact"
            class="mr-2"
            style="max-width:100px"
          />
          <v-select
            v-model="p.paymentProvider"
            :items="providers"
            label="Medio de pago"
            density="compact"
            class="flex-grow-1"
          />
          <v-btn icon size="small" @click="remove(i)" v-if="payments.length > 1">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-btn icon size="small" class="mb-2" @click="addLine">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <div class="text-right font-weight-bold">
          Total: {{ total.toFixed(2) }} / {{ props.bill?.amount.toFixed(2) }}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn variant="text" color="green" @click="confirm" :disabled="total !== props.bill?.amount">
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import api from '../api.js';

const props = defineProps({ bill: Object });
const emit = defineEmits(['paid', 'close', 'notify']);

const dialog = ref(false);
const providers = ['Visa', 'Mastercard', 'MODO', 'MercadoPago', 'Google Play', 'PayPal'];
const payments = ref([]);

watch(
  () => props.bill,
  (b) => {
    dialog.value = !!b;
    payments.value = b ? [{ amount: b.amount, paymentProvider: '' }] : [];
  },
  { immediate: true }
);

const total = computed(() => payments.value.reduce((s, p) => s + Number(p.amount || 0), 0));

function addLine() {
  payments.value.push({ amount: 0, paymentProvider: '' });
}

function remove(i) {
  payments.value.splice(i, 1);
}

function close() {
  dialog.value = false;
  emit('close');
}

function formatAmount(a) {
  return `$${Number(a).toFixed(2)}`;
}

async function confirm() {
  if (total.value !== props.bill.amount) return;
  await api.put(`/bills/${props.bill.id}`, {
    status: 'paid',
    payments: payments.value
  });
  emit('notify', `Factura pagada: ${props.bill?.name || ''} (${formatAmount(props.bill?.amount)})`);
  emit('paid');
  close();
}
</script>

