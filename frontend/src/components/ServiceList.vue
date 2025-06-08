<template>
  <div>
    <v-row class="mb-2" align="center">
      <v-col cols="12" sm="4">
        <v-select
          v-model="category"
          :items="categoryOptions"
          label="Categor\u00eda"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="paymentProvider"
          :items="providers"
          label="Proveedor"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="recurrence"
          :items="recurrenceOptions"
          label="Recurrencia"
          density="compact"
          clearable
        />
      </v-col>
    </v-row>
    <v-progress-linear v-if="loading" indeterminate />
    <v-alert v-else-if="error" type="error" dense>{{ error }}</v-alert>
    <v-data-table
      v-else
      :headers="headers"
      :items="services"
      class="elevation-1"
      hide-default-footer
    >
      <template #item.lastBill="{ item }">
        <span v-if="item.lastBill">
          {{ formatAmount(item.lastBill.amount) }} ({{ shortMonth(item.lastBill.dueDate) }})
          <v-icon
            :color="statusColor(item.lastBill.status)"
            class="ml-1"
            :icon="statusIcon(item.lastBill.status)"
            size="small"
          />
        </span>
        <span v-else>-</span>
      </template>
      <template #item.actions="{ item }">
        <v-tooltip text="Historial de facturas">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :to="`/services/${item.id}`"
              variant="text"
              icon
            >
              <v-icon>mdi-file-document-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Agregar factura">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="newInvoice(item)">
              <v-icon>mdi-file-plus</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </v-data-table>
    <ManualInvoiceForm
      v-if="newBill"
      :bill="newBill"
      @created="onCreated"
      @close="closeNew"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../api.js';
import ManualInvoiceForm from './ManualInvoiceForm.vue';

const services = ref([]);
const loading = ref(false);
const error = ref(null);
const category = ref(localStorage.getItem('svc_category') || '');
const paymentProvider = ref(localStorage.getItem('svc_provider') || '');
const recurrence = ref(localStorage.getItem('svc_recurrence') || '');
const newBill = ref(null);

const providers = ['Visa', 'Mastercard', 'MercadoPago', 'Google Play', 'MODO', 'PayPal'];
const categoryOptions = [
  { title: 'All', value: '' },
  { title: 'utilities', value: 'utilities' },
  { title: 'subscriptions', value: 'subscriptions' },
  { title: 'taxes', value: 'taxes' },
  { title: 'others', value: 'others' }
];
const recurrenceOptions = [
  { title: 'All', value: '' },
  { title: 'weekly', value: 'weekly' },
  { title: 'monthly', value: 'monthly' },
  { title: 'bimonthly', value: 'bimonthly' },
  { title: 'yearly', value: 'yearly' },
  { title: 'none', value: 'none' }
];
const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Categoría', key: 'category' },
  { title: 'Proveedor', key: 'paymentProvider' },
  { title: 'Recurrencia', key: 'recurrence' },
  { title: 'Última factura', key: 'lastBill' },
  { title: 'Acciones', key: 'actions', sortable: false }
];

const fetchServices = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/services', {
      params: {
        category: category.value,
        paymentProvider: paymentProvider.value,
        recurrence: recurrence.value
      }
    });
    services.value = data;
    error.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchServices);
watch([category, paymentProvider, recurrence], () => {
  localStorage.setItem('svc_category', category.value);
  localStorage.setItem('svc_provider', paymentProvider.value);
  localStorage.setItem('svc_recurrence', recurrence.value);
  fetchServices();
});

function newInvoice(service) {
  newBill.value = {
    name: service.name,
    category: service.category,
    paymentProvider: service.paymentProvider || '',
    recurrence: service.recurrence || 'none',
    amount: 0,
    dueDate: '',
    status: 'pending',
    serviceId: service.id
  };
}

function closeNew() {
  newBill.value = null;
}

function onCreated() {
  closeNew();
}

function formatAmount(val) {
  return `$${Number(val).toFixed(2)}`;
}

function shortMonth(date) {
  return new Date(date).toLocaleDateString('es-ES', { month: 'short' });
}

function statusColor(status) {
  return { paid: 'green', pending: 'orange', overdue: 'red' }[status] || 'grey';
}

function statusIcon(status) {
  return { paid: 'mdi-check', pending: 'mdi-clock-outline', overdue: 'mdi-alert' }[status];
}
</script>

