<template>
  <v-container>
    <v-card class="mb-4">
      <v-card-title class="header-card pa-4">
        <div>
          <h2 class="text-h5 font-weight-medium mb-1 text-white">
            Historial de Pagos<span v-if="name"> - {{ name }}</span>
          </h2>
          <div class="text-subtitle-2 text-white text-opacity-75">
            Registro histórico de todos los pagos realizados
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          to="/"
          class="text-white"
          prepend-icon="mdi-arrow-left"
        >
          Volver
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Summary Widget -->
    <payment-summary-widget :start-date="startDate" :end-date="endDate" />
    <v-row class="mb-2" v-if="!name" align="center">
      <v-col cols="12" sm="3">
        <v-select
          v-model="category"
          :items="categories"
          label="Category"
          density="compact"
          variant="outlined"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="3">
        <v-select
          v-model="provider"
          :items="providers"
          item-title="title"
          item-value="value"
          label="Medio de Pago"
          density="compact"
          variant="outlined"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="3">
        <v-menu v-model="menuStart" :close-on-content-click="false" transition="scale-transition">
          <template #activator="{ props }">
            <v-text-field
              v-model="startDate"
              label="Start"
              readonly
              v-bind="props"
              density="compact"
              variant="outlined"
            />
          </template>
          <v-date-picker v-model="startDate" @update:modelValue="menuStart = false" />
        </v-menu>
      </v-col>
      <v-col cols="12" sm="3">
        <v-menu v-model="menuEnd" :close-on-content-click="false" transition="scale-transition">
          <template #activator="{ props }">
            <v-text-field
              v-model="endDate"
              label="End"
              readonly
              v-bind="props"
              density="compact"
              variant="outlined"
            />
          </template>
          <v-date-picker v-model="endDate" @update:modelValue="menuEnd = false" />
        </v-menu>
      </v-col>
      <v-col cols="12" sm="3">
        <v-btn
          variant="text"
          color="primary"
          @click="fetchCategories"
          prepend-icon="mdi-refresh"
        >
          Actualizar Categorías
        </v-btn>
      </v-col>
      <v-col cols="12" sm="3">
        <v-btn
          variant="text"
          color="primary"
          @click="fetchProviders"
          prepend-icon="mdi-refresh"
        >
          Actualizar Proveedores
        </v-btn>
      </v-col>
      <v-col cols="12" sm="3">
        <v-btn
          variant="text"
          color="success"
          @click="showAddCategoryDialog = true"
          prepend-icon="mdi-plus"
        >
          Nueva Categoría
        </v-btn>
      </v-col>
      <v-col cols="12" sm="3">
        <v-btn
          variant="text"
          color="success"
          @click="showAddProviderDialog = true"
          prepend-icon="mdi-plus"
        >
          Nuevo Proveedor
        </v-btn>
      </v-col>
    </v-row>
    <v-progress-linear v-if="loading" indeterminate />
    <v-alert v-else-if="error" type="error" dense>{{ error }}</v-alert>
    <v-data-table
      v-else
      :headers="headers"
      :items="filteredPayments"
      class="elevation-1 mb-6"
    >
      <template #item.Bill.dueDate="{ item }">
        <div v-if="item.Bill" class="d-flex align-center gap-2">
          <v-icon size="small" color="grey-darken-1">mdi-calendar</v-icon>
          {{ format(item.Bill.dueDate) }}
        </div>
        <div v-else class="d-flex align-center gap-2">
          <v-icon size="small" color="grey-darken-1">mdi-cash-fast</v-icon>
          <span class="text-grey">Pago único</span>
        </div>
      </template>
      <template #item.paidAt="{ item }">
        <div class="d-flex align-center gap-2">
          <v-icon size="small" color="success">mdi-calendar-check</v-icon>
          {{ format(item.paidAt) }}
        </div>
      </template>
      <template #item.amount="{ item }">
        <div class="d-flex align-center gap-2">
          <v-icon size="small" color="grey-darken-1">mdi-currency-usd</v-icon>
          {{ item.amount.toFixed(2) }}
        </div>
      </template>
      <template #item.name="{ item }">{{ item.Bill ? item.Bill.Service.name : item.description }}</template>
      <template #item.paymentMethodName="{ item }">
        <div class="d-flex align-center gap-2">
          <v-icon size="small" color="grey-darken-1">
            {{ item.PaymentMethods?.icon ? item.PaymentMethods.icon : 'mdi-cash-multiple' }}
          </v-icon>
          {{ item.paymentMethodName }}
        </div>
      </template>
      <template #item.edit="{ item }">
        <div class="d-flex gap-1">
          <v-tooltip text="Editar pago">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="info"
                variant="flat"
                icon
                class="mx-1"
                size="small"
                @click="editPayment(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Eliminar pago">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="error"
                variant="flat"
                icon
                class="mx-1"
                size="small"
                @click="deletePayment(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>
    </v-data-table>
    <edit-payment-dialog
      :payment="selectedPayment"
      @edited="onPaymentEdited"
      @close="onEditDialogClose"
    />

    
    
    <base-confirm-dialog
      v-model="showDeleteDialog"
      title="Confirmar eliminación"
      text="¿Estás seguro que deseas eliminar este pago?"
      :loading="loading"
      @confirm="confirmDelete"
    >
      <template #details v-if="paymentToDelete">
        <p class="text-body-2">
          <strong>{{ paymentToDelete.Bill ? 'Servicio' : 'Descripción' }}:</strong> 
          {{ paymentToDelete.Bill ? paymentToDelete.Bill.Service.name : paymentToDelete.description }}<br>
          <strong>Monto:</strong> ${{ paymentToDelete.amount?.toFixed(2) }}<br>
          <strong>Fecha de pago:</strong> {{ format(paymentToDelete.paidAt) }}
        </p>
      </template>
    </base-confirm-dialog>

    <!-- Diálogo para agregar nueva categoría -->
    <v-dialog v-model="showAddCategoryDialog" max-width="500px">
      <v-card>
        <v-card-title>Nueva Categoría</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newCategory.name"
                  label="Nombre"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newCategory.description"
                  label="Descripción"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newCategory.color"
                  label="Color (HEX)"
                  hint="Ejemplo: #FF5733"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newCategory.icon"
                  label="Ícono"
                  hint="Nombre del ícono (mdi-)"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="showAddCategoryDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="success"
            variant="text"
            @click="createCategory"
            :loading="savingCategory"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para agregar nuevo método de pago -->
    <v-dialog v-model="showAddProviderDialog" max-width="500px">
      <v-card>
        <v-card-title>Nuevo Método de Pago</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newProvider.name"
                  label="Nombre"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newProvider.description"
                  label="Descripción"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newProvider.icon"
                  label="Ícono"
                  hint="Nombre del ícono (mdi-)"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="showAddProviderDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="success"
            variant="text"
            @click="createProvider"
            :loading="savingProvider"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api.js';
import PaymentSummaryWidget from '../components/PaymentSummaryWidget.vue';
import PaymentCharts from '../components/PaymentCharts.vue';
import EditPaymentDialog from '../components/EditPaymentDialog.vue';
import BaseConfirmDialog from '../components/BaseConfirmDialog.vue';

const props = defineProps({ name: String });
const route = useRoute();
const name = computed(() => route.query.name || props.name || '');

const serviceId = computed(() => route.query.serviceId || '');
const payments = ref([]);
const loading = ref(false);
const error = ref(null);
const category = ref('');
const provider = ref('');
const startDate = ref('');
const endDate = ref('');
const menuStart = ref(false);
const menuEnd = ref(false);
const confirmDialog = ref({
  visible: false,
  item: null
});
const showDeleteDialog = ref(false);
const paymentToDelete = ref(null);

const categories = ref([]);
const providers = ref([]);

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Monto', key: 'amount' },
  { title: 'Fecha de Vencimiento', key: 'Bill.dueDate' },
  { title: 'Fecha de Pago', key: 'paidAt' },
  { title: 'Método', key: 'paymentMethodName' },
  { title: 'Acciones', key: 'edit', align: 'end' },
];

function format(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getRecurrenceColor(recurrence) {
  const colors = {
    'monthly': 'primary',
    'quarterly': 'secondary',
    'yearly': 'success',
    'weekly': 'info',
    'biweekly': 'warning'
  };
  return colors[recurrence] || 'grey';
}

function getRecurrenceLabel(recurrence) {
  const labels = {
    'monthly': 'Mensual',
    'quarterly': 'Trimestral',
    'yearly': 'Anual',
    'weekly': 'Semanal',
    'biweekly': 'Quincenal'
  };
  return labels[recurrence] || recurrence;
}

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/payments');
    payments.value = data;
    error.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const { data } = await api.get('/categories');
    // Transformar los datos al formato requerido por v-select
    categories.value = data.map(cat => ({
      title: cat.name,
      value: cat.id
    }));
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    // Valores por defecto en caso de error
    categories.value = [
      { title: 'Servicios', value: 'utilities' },
      { title: 'Suscripciones', value: 'subscriptions' },
      { title: 'Impuestos', value: 'taxes' },
      { title: 'Otros', value: 'others' }
    ];
  }
};

const fetchProviders = async () => {
  try {
    const { data } = await api.get('/payment-methods');
    // Transformar los datos al formato requerido por v-select
    providers.value = data.map(method => ({
      title: method.name,
      value: method.id,
      description: method.description,
      icon: method.icon
    }));
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    // Valores por defecto en caso de error
    providers.value = [
      { title: 'Visa', value: 'Visa' },
      { title: 'Mastercard', value: 'Mastercard' },
      { title: 'MercadoPago', value: 'MercadoPago' },
      { title: 'Google Play', value: 'Google Play' },
      { title: 'MODO', value: 'MODO' },
      { title: 'PayPal', value: 'PayPal' }
    ];
  }
};

onMounted(async () => {
  await fetchCategories();
  await fetchProviders();
  fetchData();
});
watch(
  () => route.query,
  fetchData,
  { deep: true }
);

const filteredPayments = computed(() => {
  let data = [...payments.value];

  if (name.value) {
    data = data.filter((p) => {
      if (p.Bill) return p.Bill.Service.name === name.value;
      return p.description.includes(name.value);
    });
  }

  if (route.query.provider)
    data = data.filter((p) => p.paymentMethodId === route.query.provider);

  if (route.query.category)
    data = data.filter((p) => p.Bill?.Service.categoryId === route.query.category);

  if (category.value)
    data = data.filter((p) => p.Bill?.Service.categoryId === category.value);

  if (provider.value)
    data = data.filter(
      (p) => p.paymentMethodId && p.paymentMethodId === provider.value
    );

  if (startDate.value)
    data = data.filter((p) => new Date(p.paidAt) >= new Date(startDate.value));

  if (endDate.value)
    data = data.filter((p) => new Date(p.paidAt) <= new Date(endDate.value));

  return data.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
});

const editPayment = (item) => {
  selectedPayment.value = item;
};

const deletePayment = (item) => {
  paymentToDelete.value = item;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!paymentToDelete.value) return;
  
  loading.value = true;
  try {
    await api.delete(`/payments/${paymentToDelete.value.id}`);
    payments.value = payments.value.filter(p => p.id !== paymentToDelete.value.id);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
    showDeleteDialog.value = false;
    paymentToDelete.value = null;
  }
};

const selectedPayment = ref(null);

const onPaymentEdited = async (editedPayment) => {
  try {
    await fetchData(); // Actualiza los pagos desde la base de datos
    selectedPayment.value = null;
  } catch (error) {
    console.error('Error al actualizar los pagos:', error);
  }
};

const onEditDialogClose = () => {
  selectedPayment.value = null;
};

// Variables para los diálogos de nueva categoría y proveedor
const showAddCategoryDialog = ref(false);
const showAddProviderDialog = ref(false);
const newCategory = ref({
  name: '',
  description: '',
  color: '',
  icon: ''
});
const newProvider = ref({
  name: '',
  description: '',
  icon: ''
});
const savingCategory = ref(false);
const savingProvider = ref(false);

// Función para crear una nueva categoría
const createCategory = async () => {
  if (!newCategory.value.name) {
    error.value = 'El nombre de la categoría es obligatorio';
    return;
  }
  
  savingCategory.value = true;
  try {
    await api.post('/categories', newCategory.value);
    await fetchCategories();
    showAddCategoryDialog.value = false;
    newCategory.value = {
      name: '',
      description: '',
      color: '',
      icon: ''
    };
  } catch (err) {
    error.value = 'Error al crear la categoría: ' + err.message;
  } finally {
    savingCategory.value = false;
  }
};

// Función para crear un nuevo método de pago
const createProvider = async () => {
  if (!newProvider.value.name) {
    error.value = 'El nombre del método de pago es obligatorio';
    return;
  }
  
  savingProvider.value = true;
  try {
    await api.post('/payment-methods', newProvider.value);
    await fetchProviders();
    showAddProviderDialog.value = false;
    newProvider.value = {
      name: '',
      description: '',
      icon: ''
    };
  } catch (err) {
    error.value = 'Error al crear el método de pago: ' + err.message;
  } finally {
    savingProvider.value = false;
  }
};
</script>

<style scoped>
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

.v-data-table {
  background-color: white;
}

.v-data-table th {
  background-color: #f5f5f5;
}

.v-data-table td {
  vertical-align: middle;
}

.v-progress-linear {
  height: 4px;
}

.v-alert {
  margin-bottom: 16px;
}
</style>
