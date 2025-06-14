<template>
  <div>
    <v-card class="mb-4">
      <v-card-title class="header-card pa-4">
        <div>
          <h2 class="text-h5 font-weight-medium mb-1 text-white">Servicios registrados</h2>
          <div class="text-subtitle-2 text-white text-opacity-75">
            Últimos servicios registrados al {{ new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) }}
          </div>
        </div>
        <v-spacer></v-spacer>
        <BillForm @added="refresh" @notify="notify" />
      </v-card-title>
    </v-card>
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
      class="elevation-2 service-table rounded-lg"
      :hover="true"
      :loading="loading"
      loading-text="Cargando servicios..."
      no-data-text="No hay servicios registrados"
      :items-per-page="8"
      :footer-props="{
        'items-per-page-text': 'Servicios por página',
        'items-per-page-options': [8, 16, 32],
        showFirstLastPage: true
      }"
    >
      <template #item.name="{ item }">
        <v-tooltip :text="item.description || 'Sin descripción'">
          <template #activator="{ props }">
            <div v-bind="props" class="d-flex align-center">
              <span class="font-weight-medium">{{ item.name }}</span>
              <v-icon 
                v-if="item.autoRenew" 
                size="small" 
                color="primary" 
                class="ml-2"
              >
                mdi-autorenew
              </v-icon>
            </div>
          </template>
        </v-tooltip>
      </template>

      <template #item.category="{ item }">
        <v-chip
          size="small"
          :color="item.category === 'subscriptions' ? 'primary' : 'grey'"
          variant="flat"
          class="text-capitalize"
        >
          {{ item.category }}
        </v-chip>
      </template>

      <template #item.lastBill="{ item }">
        <v-chip
          v-if="item.lastBill"
          :color="statusColor(item.lastBill.status)"
          class="status-chip"
          size="small"
          variant="elevated"
        >
          <v-icon start size="18">{{ statusIcon(item.lastBill.status) }}</v-icon>
          <span class="font-weight-medium">{{ formatAmount(item.lastBill.amount) }}</span>
        </v-chip>
        <v-chip v-else color="grey" size="small" variant="flat">Sin facturas</v-chip>
      </template>

      <template #item.recurrence="{ item }">
        <div class="d-flex align-center justify-center gap-2">
          <v-icon size="small" color="grey-darken-1">mdi-calendar-sync</v-icon>
          <span class="text-caption">{{ item.recurrence }}</span>
        </div>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex gap-1">
          <v-tooltip text="Ver historial de facturas">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :to="`/services/${item.id}`"
                color="info"
                variant="flat"
                icon
                size="small"
                class="mx-1"
              >
                <v-icon>mdi-file-document-outline</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Agregar factura">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="success"
                variant="flat"
                icon
                size="small"
                class="mx-1"
                @click="newInvoice(item)"
              >
                <v-icon>mdi-file-plus</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Archivar servicio">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="grey-darken-2"
                variant="flat"
                icon
                size="small"
                class="mx-1"
                @click="archive(item)"
              >
                <v-icon>mdi-archive</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
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

const emit = defineEmits(['notify']);

const notify = (message) => {
  emit('notify', {
    text: message,
    color: 'success',
    timeout: 3000
  });
};

const onCreated = async (bill) => {
  await fetchServices();
  notify('Servicio creado exitosamente');
  closeNew();
};

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

const statusColor = (status) => {
  const colors = {
    paid: 'success',
    pending: 'warning',
    overdue: 'error'
  };
  return colors[status] || 'grey';
};

const statusIcon = (status) => {
  const icons = {
    paid: 'mdi-check-circle',
    pending: 'mdi-clock-outline',
    overdue: 'mdi-alert-circle'
  };
  return icons[status] || 'mdi-help-circle';
};

const formatAmount = (amount) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(amount);
};

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
  { 
    title: 'Servicio',
    key: 'name',
    align: 'start',
    sortable: true
  },
  { 
    title: 'Categoría',
    key: 'category',
    align: 'center',
    sortable: true
  },
  { 
    title: 'Proveedor',
    key: 'paymentProvider',
    align: 'center',
    sortable: true
  },
  { 
    title: 'Recurrencia',
    key: 'recurrence',
    align: 'center',
    sortable: true
  },
  { 
    title: 'Última factura',
    key: 'lastBill',
    align: 'center',
    sortable: true
  },
  { 
    title: 'Acciones',
    key: 'actions',
    align: 'end',
    sortable: false
  }
];

const fetchServices = async (showNotification = false) => {
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
    if (showNotification) {
      notify('Lista de servicios actualizada');
    }
  } catch (err) {
    error.value = err.message;
    if (showNotification) {
      emit('notify', {
        text: 'Error al cargar los servicios: ' + err.message,
        color: 'error',
        timeout: 5000
      });
    }
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

const refreshKey = ref(0);

const refresh = async () => {
  await fetchServices(true);
};

function onSearch() {
  // El filtrado es reactivo por computed
}

const newInvoice = (service) => {
  newBill.value = {
    serviceId: service.id,
    name: service.name,
    amount: service.lastBill?.amount || 0
  };
}

function closeNew() {
  newBill.value = null;
}

function openQuick(bill) {
  selectedBill.value = bill;
}

function closeQuick() {
  selectedBill.value = null;
}

const archive = async (service) => {
  try {
    await api.patch(`/services/${service.id}`, { archived: true });
    await fetchServices();
    notify(`El servicio ${service.name} ha sido archivado`);
  } catch (err) {
    emit('notify', {
      text: 'Error al archivar el servicio: ' + err.message,
      color: 'error',
      timeout: 5000
    });
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
</script>

<style scoped>
.service-table {
  border-radius: 8px;
  overflow: hidden;
}

.service-table :deep(.v-data-table__thead tr th) {
  background-color: #f5f7fa !important;
  color: #2c3e50 !important;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.service-table :deep(.v-data-table__tbody tr:nth-child(even)) {
  background-color: #f8fafc;
}

.service-table :deep(.v-data-table__tbody tr:hover) {
  background-color: #f0f4ff !important;
  transition: background-color 0.2s ease;
}

.service-table :deep(.v-data-table__tbody td) {
  padding: 12px 16px;
  font-size: 0.875rem;
}

.status-chip {
  font-weight: 500;
  letter-spacing: 0.5px;
  min-width: 100px;
  justify-content: center;
}

.header-card {
  background: linear-gradient(135deg, #ff9f43 0%, #ff7b1e 100%) !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-card :deep(.v-btn) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.header-card :deep(.v-btn:hover) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

@media (max-width: 600px) {
  .service-table {
    font-size: 0.875rem;
  }
  
  .service-table :deep(.v-data-table__tbody td) {
    padding: 8px 12px;
  }
  
  .status-chip {
    min-width: 80px;
    font-size: 0.75rem;
  }
}
</style>

