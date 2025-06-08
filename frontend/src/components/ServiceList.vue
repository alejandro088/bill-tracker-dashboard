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
      <template #item.actions="{ item }">
        <v-btn :to="`/services/${item.id}`" variant="text" color="primary">
          Ver facturas
        </v-btn>
        <v-btn icon @click="newInvoice(item)">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
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
const category = ref('');
const paymentProvider = ref('');
const recurrence = ref('');
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
watch([category, paymentProvider, recurrence], fetchServices);

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
</script>

