<template>
  <div>
    <div class="service-table-header d-flex align-center justify-space-between">
      <div>
        <div class="service-table-title">Servicios registrados</div>
        <div class="service-table-subtitle">Listado actualizado de todos los servicios y sus facturas</div>
      </div>
      <BillForm @added="refresh" @notify="notify" />
    </div>
    <v-row class="mb-2" align="center">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar servicio"
          dense
          clearable
          @input="onSearch"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-select
          v-model="category"
          :items="categoryOptions"
          label="Categoría"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-select
          v-model="paymentProvider"
          :items="providers"
          label="Proveedor"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-select
          v-model="recurrence"
          :items="recurrenceOptions"
          label="Recurrencia"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" md="2" class="d-flex align-center">
        <v-switch
          v-model="dueSoon"
          density="compact"
          label="Próximos 7 días"
          class="ml-2"
        />
      </v-col>
    </v-row>
    <v-progress-linear v-if="loading" indeterminate class="mb-2" />
    <v-alert v-else-if="error" type="error" dense>{{ error }}</v-alert>
    <v-data-table
      v-else
      :headers="headers"
      :items="filteredServices"
      class="elevation-3 service-table"
      hide-default-footer
      :items-per-page="8"
      :mobile-breakpoint="0"
      :footer-props="{ showFirstLastPage: true, 'items-per-page-options': [8, 16, 32] }"
      :loading="loading"
      :hover="true"
      :fixed-header="true"
      style="min-width: 800px;"
    >
      <template #item.name="{ item }">
        <span class="font-weight-bold">{{ item.name }}</span>
        <v-icon v-if="item.autoRenew" size="small" color="primary" class="ml-1">mdi-autorenew</v-icon>
      </template>
      <template #item.lastBill="{ item }">
        <v-chip
          v-if="item.lastBill"
          :color="statusColor(item.lastBill.status)"
          class="ma-1 white--text"
          size="small"
          label
        >
          <v-icon left size="18">{{ statusIcon(item.lastBill.status) }}</v-icon>
          {{ formatAmount(item.lastBill.amount) }}
        </v-chip>
        <span v-else>-</span>
      </template>
      <template #item.actions="{ item }">
        <v-tooltip text="Ver historial de facturas">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :to="`/services/${item.id}`"
              color="info"
              variant="flat"
              icon
              class="mx-1"
            >
              <v-icon>mdi-file-document-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Agregar factura">
          <template #activator="{ props }">
            <v-btn v-bind="props" color="success" icon class="mx-1" @click="newInvoice(item)">
              <v-icon>mdi-file-plus</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Archivar servicio">
          <template #activator="{ props }">
            <v-btn v-bind="props" color="grey darken-2" icon class="mx-1" @click="archive(item)">
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
import { ref, onMounted, watch, computed } from 'vue';
import api from '../api.js';
import ManualInvoiceForm from './ManualInvoiceForm.vue';
import QuickBillDialog from './QuickBillDialog.vue';
import BillForm from '../components/BillForm.vue';

const services = ref([]);
const loading = ref(false);
const error = ref(null);
const category = ref(localStorage.getItem('svc_category') || '');
const paymentProvider = ref(localStorage.getItem('svc_provider') || '');
const recurrence = ref(localStorage.getItem('svc_recurrence') || '');
const newBill = ref(null);
const selectedBill = ref(null);
const dueSoon = ref(localStorage.getItem('svc_dueSoon') === '1');
const search = ref('');

const providers = ['Visa', 'Mastercard', 'MercadoPago', 'Google Play', 'MODO', 'PayPal'];
const categoryOptions = [
  { title: 'Todas', value: '' },
  { title: 'Servicios', value: 'utilities' },
  { title: 'Suscripciones', value: 'subscriptions' },
  { title: 'Impuestos', value: 'taxes' },
  { title: 'Otros', value: 'others' }
];
const recurrenceOptions = [
  { title: 'Todas', value: '' },
  { title: 'Semanal', value: 'weekly' },
  { title: 'Mensual', value: 'monthly' },
  { title: 'Bimestral', value: 'bimonthly' },
  { title: 'Anual', value: 'yearly' },
  { title: 'Única vez', value: 'none' }
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

const filteredServices = computed(() => {
  if (!search.value) return services.value;
  return services.value.filter(s =>
    s.name.toLowerCase().includes(search.value.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(search.value.toLowerCase())) ||
    (s.paymentProvider && s.paymentProvider.toLowerCase().includes(search.value.toLowerCase()))
  );
});

const emit = defineEmits(['notify']);
const refreshKey = ref(0);

function refresh() {
  refreshKey.value++;
}

function onSearch() {
  // El filtrado es reactivo por computed
}

function notify(msg) {
  emit('notify', msg);
}

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
  return new Date(d).toLocaleDateString('es-ES');
}

function statusLabel(bill) {
  return { paid: 'Pagado', pending: 'Pendiente', overdue: 'Vencido' }[bill.status];
}

function formatAmount(val) {
  return `$${Number(val).toFixed(2)}`;
}

function shortMonth(date) {
  return new Date(date)
    .toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
    .replace('.', '');
}

function dueTooltip(date) {
  const d = new Date(date);
  const prefix = d < new Date() ? 'Venció el' : 'Vencerá el';
  return `${prefix} ${formatDate(d)}`;
}

function statusColor(status) {
  return { paid: 'green', pending: 'orange', overdue: 'red' }[status] || 'grey';
}

function statusIcon(status) {
  return { paid: 'mdi-check', pending: 'mdi-clock-outline', overdue: 'mdi-alert' }[status];
}
</script>

<style scoped>
.service-table {
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.v-data-table-header th {
  background: #f5f7fa;
  color: #222d32;
  font-weight: bold;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
}
.v-data-table__tr {
  transition: background 0.2s;
}
.v-data-table__tr:hover {
  background: #f0f4ff !important;
}
.table-header {
  font-weight: bold;
  font-size: 1.1rem;
}
.service-table-header {
  background: linear-gradient(90deg, #ffa726 80%, #fb8c00 100%);
  border-radius: 6px 6px 0 0;
  box-shadow: 0 2px 8px rgba(251, 140, 0, 0.08);
  padding: 18px 24px 10px 24px;
  margin-bottom: 0px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.service-table-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 2px;
  letter-spacing: 0.5px;
}
.service-table-subtitle {
  font-size: 0.98rem;
  color: #ffe0b2;
}
.add-bill-btn {
  color: #fff !important;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.12);
}
@media (max-width: 900px) {
  .service-table {
    min-width: 600px;
    font-size: 0.95rem;
  }
}
@media (max-width: 600px) {
  .service-table {
    min-width: 400px;
    font-size: 0.9rem;
  }
  .v-row, .v-col {
    padding: 0 !important;
    margin: 0 !important;
  }
}
</style>

