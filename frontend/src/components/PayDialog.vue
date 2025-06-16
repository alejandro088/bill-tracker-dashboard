<template>
  <v-dialog v-model="dialog" max-width="500" @update:modelValue="val => !val && close()">
    <v-card>
      <v-card-title>Pagar factura</v-card-title>
      <v-card-text>
        <div v-for="(p, i) in payments" :key="i" class="d-flex align-center mb-2">
          <v-text-field
            v-model.number="p.amount"
            type="number"
            :label="'Monto ' + (p.currency === 'USD' ? 'USD' : 'ARS')"
            density="compact"
            class="mr-2"
            style="max-width:100px"
          />
          <v-select
            v-model="p.currency"
            :items="['ARS', 'USD']"
            label="Moneda"
            density="compact"
            class="mr-2"
            style="max-width:100px"
            @update:model-value="updateExchangeRate(i)"
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
          Total en {{ props.bill?.currency }}: {{ totalInBillCurrency.toFixed(2) }} / {{ props.bill?.amount.toFixed(2) }}
        </div>
        <div v-if="hasMultipleCurrencies" class="text-right">
          <div class="text-subtitle-2">Tasa de cambio USD/ARS: {{ exchangeRate.toFixed(2) }}</div>
          <div class="text-caption" v-if="lastUpdate">
            Última actualización: {{ new Date(lastUpdate).toLocaleString() }}
          </div>
        </div>
        <div v-if="lastUpdate" class="text-right text-caption">
          Última actualización: {{ lastUpdate.toLocaleString() }}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn variant="text" color="green" @click="confirm" :disabled="!isValidTotal">
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
const exchangeRate = ref(0);
const lastUpdate = ref(null);

// Obtener tasa de cambio actual desde dolarapi.com
async function fetchExchangeRate() {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
    if (!response.ok) {
      throw new Error('Error al obtener el tipo de cambio');
    }
    const data = await response.json();
    // Usamos el valor de venta para las conversiones
    exchangeRate.value = data.venta;
    
    // Guardar la última actualización
    lastUpdate.value = new Date(data.fechaActualizacion);
  } catch (error) {
    console.error('Error al obtener tipo de cambio:', error);
    // En caso de error, usar un valor de respaldo
    exchangeRate.value = 500;
    emit('notify', {
      type: 'warning',
      message: 'No se pudo obtener el tipo de cambio actualizado. Usando valor de respaldo.'
    });
  }
}

watch(
  () => props.bill,
  async (b) => {
    dialog.value = !!b;
    if (b) {
      await fetchExchangeRate();
      payments.value = [{ 
        amount: b.amount, 
        currency: b.currency,
        paymentProvider: '',
        exchangeRate: exchangeRate.value
      }];
    } else {
      payments.value = [];
    }
  },
  { immediate: true }
);

const hasMultipleCurrencies = computed(() => {
  const currencies = new Set(payments.value.map(p => p.currency));
  return currencies.size > 1;
});

async function updateExchangeRate(index) {
  await fetchExchangeRate();
  payments.value[index].exchangeRate = exchangeRate.value;
}

const totalInBillCurrency = computed(() => {
  return payments.value.reduce((sum, p) => {
    if (p.currency === props.bill.currency) {
      return sum + Number(p.amount || 0);
    } else if (p.currency === 'USD' && props.bill.currency === 'ARS') {
      return sum + (Number(p.amount || 0) * p.exchangeRate);
    } else if (p.currency === 'ARS' && props.bill.currency === 'USD') {
      return sum + (Number(p.amount || 0) / p.exchangeRate);
    }
    return sum;
  }, 0);
});

const isValidTotal = computed(() => {
  return Math.abs(totalInBillCurrency.value - props.bill.amount) < 0.01;
});

function addLine() {
  payments.value.push({ 
    amount: 0, 
    currency: props.bill.currency,
    paymentProvider: '',
    exchangeRate: exchangeRate.value
  });
}

function remove(i) {
  payments.value.splice(i, 1);
}

function close() {
  dialog.value = false;
  emit('close');
}

function formatAmount(amount, currency) {
  return currency === 'USD' ? `USD ${Number(amount).toFixed(2)}` : `$${Number(amount).toFixed(2)}`;
}

async function confirm() {
  if (!isValidTotal.value) return;
  await api.put(`/bills/${props.bill.id}`, {
    status: 'paid',
    payments: payments.value
  });
  emit('notify', `Factura pagada: ${props.bill?.name || ''} (${formatAmount(props.bill?.amount, props.bill?.currency)})`);
  emit('paid');
  close();
}
</script>

