<template>
  <div>
    <v-row class="mb-2" align="center">
      <v-col cols="12" sm="4">
        <v-tooltip text="Filtrar por categor\u00eda">
          <template #activator="{ props }">
            <v-select
              v-bind="props"
              v-model="category"
              :items="categoryOptions"
              label="Categor\u00eda"
              density="compact"
              clearable
            />
          </template>
        </v-tooltip>
      </v-col>
      <v-col cols="12" sm="4">
        <v-tooltip text="Filtrar por proveedor">
          <template #activator="{ props }">
            <v-select
              v-bind="props"
              v-model="paymentProvider"
              :items="providers"
              label="Proveedor"
              density="compact"
              clearable
            />
          </template>
        </v-tooltip>
      </v-col>
      <v-col cols="12" sm="4">
        <v-tooltip text="Filtrar por recurrencia">
          <template #activator="{ props }">
            <v-select
              v-bind="props"
              v-model="recurrence"
              :items="recurrenceOptions"
              label="Recurrencia"
              density="compact"
              clearable
            />
          </template>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-switch
      v-model="dueSoon"
      density="compact"
      label="Vencimientos en 7 d\u00edas"
      class="mb-2"
    />
    <v-progress-linear v-if="loading" indeterminate />
    <v-alert v-else-if="error" type="error" dense>{{ error }}</v-alert>
    <v-data-table
      v-else
      :headers="headers"
      :items="services"
      class="elevation-1"
      hide-default-footer
    >
      <template #item.name="{ item }">
        {{ item.name }}
        <v-tooltip v-if="item.autoRenew" text="Renovaci\u00f3n autom\u00e1tica activada">
          <template #activator="{ props }">
            <v-icon v-bind="props" class="ml-1" size="small">mdi-autorenew</v-icon>
          </template>
        </v-tooltip>
      </template>
      <template #item.lastBill="{ item }">
        <span v-if="item.lastBill" class="d-inline-flex align-center">
          <v-tooltip text="Monto de la \u00faltima factura">
            <template #activator="{ props }">
              <span class="pointer" v-bind="props" @click="openQuick(item.lastBill)">
                {{ formatAmount(item.lastBill.amount) }}
              </span>
            </template>
          </v-tooltip>
          <v-tooltip :text="`Venci\u00f3 el ${formatDate(item.lastBill.dueDate)}`">
            <template #activator="{ props }">
              <span class="pointer ml-1" v-bind="props" @click="openQuick(item.lastBill)">
                ({{ shortMonth(item.lastBill.dueDate) }})
              </span>
            </template>
          </v-tooltip>
          <v-tooltip :text="statusLabel(item.lastBill)">
            <template #activator="{ props }">
              <v-icon
                v-bind="props"
                :color="statusColor(item.lastBill.status)"
                class="ml-1 pointer"
                :icon="statusIcon(item.lastBill.status)"
                size="small"
                @click="openQuick(item.lastBill)"
              />
            </template>
          </v-tooltip>
          <v-icon icon="mdi-chevron-right" size="small" class="ml-1 pointer" @click="openQuick(item.lastBill)" />
          <v-tooltip v-if="item.lastBill.status === 'overdue'" :text="`Venci\u00f3 el ${formatDate(item.lastBill.dueDate)}`">
            <template #activator="{ props }">
              <v-badge v-bind="props" color="red" class="ml-1">⚠ overdue ({{ overdueDays(item.lastBill.dueDate) }} d\u00edas)</v-badge>
            </template>
          </v-tooltip>
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
        <v-tooltip text="Archivar servicio">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="archive(item)">
              <v-icon>mdi-archive</v-icon>
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
    <QuickBillDialog
      v-if="selectedBill"
      :bill="selectedBill"
      @updated="fetchServices"
      @close="closeQuick"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../api.js';
import ManualInvoiceForm from './ManualInvoiceForm.vue';
import QuickBillDialog from './QuickBillDialog.vue';

const services = ref([]);
const loading = ref(false);
const error = ref(null);
const category = ref(localStorage.getItem('svc_category') || '');
const paymentProvider = ref(localStorage.getItem('svc_provider') || '');
const recurrence = ref(localStorage.getItem('svc_recurrence') || '');
const newBill = ref(null);
const selectedBill = ref(null);
const dueSoon = ref(localStorage.getItem('svc_dueSoon') === '1');

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
        recurrence: recurrence.value,
        dueSoon: dueSoon.value ? 7 : undefined
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
watch([category, paymentProvider, recurrence, dueSoon], () => {
  localStorage.setItem('svc_category', category.value);
  localStorage.setItem('svc_provider', paymentProvider.value);
  localStorage.setItem('svc_recurrence', recurrence.value);
  localStorage.setItem('svc_dueSoon', dueSoon.value ? '1' : '0');
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

function openQuick(bill) {
  selectedBill.value = bill;
}

function closeQuick() {
  selectedBill.value = null;
}

async function archive(service) {
  try {
    await api.put(`/services/${service.id}`, { archived: true });
    fetchServices();
  } catch (err) {
    error.value = err.message;
  }
}

function overdueDays(date) {
  const diff = Math.floor((new Date() - new Date(date)) / 86400000);
  return diff > 0 ? diff : 0;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString();
}

function statusLabel(bill) {
  return { paid: 'Pagado', pending: 'Pendiente', overdue: 'Vencido' }[bill.status];
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

