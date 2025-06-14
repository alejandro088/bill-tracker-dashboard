<template>
  <v-container>
    <v-card class="mb-4">
      <v-card-title class="header-card pa-4">
        <div>
          <h2 class="text-h5 font-weight-medium mb-1 text-white d-flex align-center">
            <v-icon icon="mdi-file-document-multiple" class="mr-2" color="white" />
            {{ service?.name }} - Facturas
          </h2>
          <div class="text-subtitle-2 text-white text-opacity-75">
            Gestión de facturas y pagos del servicio
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          to="/"
          variant="text"
          class="text-white"
          prepend-icon="mdi-arrow-left"
        >
          Volver
        </v-btn>
        <v-btn
          v-if="service?.autoRenew"
          color="error"
          variant="outlined"
          size="small"
          @click="handleCancelSubscription"
        >
          <template #prepend>
            <v-icon>mdi-cancel</v-icon>
          </template>
          <v-tooltip activator="parent" location="top">
            <div class="d-flex align-center gap-2">
              <v-icon size="small">mdi-alert-circle</v-icon>
              Desactivar renovación automática
            </div>
          </v-tooltip>
          Cancelar suscripción
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <v-card :color="STATUS_CONFIG.paid.color" variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h6 d-flex align-center justify-center gap-2">
                  <v-icon icon="mdi-check-circle" color="green-darken-2" />
                  Pagado
                </div>
                <div class="text-h4 d-flex align-center justify-center">
                  <v-icon icon="mdi-currency-usd" class="mr-2" />
                  {{ totals.paid.toFixed(2) }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card :color="STATUS_CONFIG.pending.color" variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h6 d-flex align-center justify-center gap-2">
                  <v-icon icon="mdi-clock-outline" color="orange-darken-2" />
                  Pendiente
                </div>
                <div class="text-h4 d-flex align-center justify-center">
                  <v-icon icon="mdi-currency-usd" class="mr-2" />
                  {{ totals.pending.toFixed(2) }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card :color="STATUS_CONFIG.overdue.color" variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h6 d-flex align-center justify-center gap-2">
                  <v-icon icon="mdi-alert-circle" color="red-darken-2" />
                  Vencido
                </div>
                <div class="text-h4 d-flex align-center justify-center">
                  <v-icon icon="mdi-currency-usd" class="mr-2" />
                  {{ totals.overdue.toFixed(2) }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-row class="mb-4">
      <v-col cols="12" sm="6">
        <v-select
          v-model="filter"
          :items="STATUS_OPTIONS"
          label="Filtrar por estado"
          density="compact"
          hide-details
          clearable
          variant="outlined"
          prepend-inner-icon="mdi-filter"
        />
      </v-col>
    </v-row>

    <v-card>
      <template v-if="loading">
        <v-card-text class="text-center py-4">
          <v-progress-circular indeterminate />
        </v-card-text>
      </template>

      <template v-else-if="error">
        <v-alert type="error" class="ma-4">{{ error }}</v-alert>
      </template>

      <template v-else>
        <v-data-table
          :headers="TABLE_HEADERS"
          :items="filteredBills"
          class="elevation-0"
          hover
        >
          <template #item.dueDate="{ item }">
            <div class="d-flex align-center gap-2">
              <v-icon size="small" icon="mdi-calendar" />
              {{ formatDate(item.dueDate) }}
            </div>
          </template>

          <template #item.amount="{ item }">
            <div class="d-flex align-center gap-2">
              <v-icon size="small" icon="mdi-currency-usd" />
              <span class="font-weight-medium">{{ item.amount.toFixed(2) }}</span>
            </div>
          </template>

          <template #item.paymentProvider="{ item }">
            <template v-if="item.payments?.length">
              <v-chip size="small" prepend-icon="mdi-credit-card-multiple">
                {{ summarizePayments(item.payments) }}
              </v-chip>
            </template>
            <v-btn
              v-else
              size="small"
              variant="text"
              :color="STATUS_CONFIG[item.status].color"
              @click="handleEdit(item)"
            >
              <v-icon start>mdi-cash-plus</v-icon>
              Agregar pago
            </v-btn>
          </template>

          <template #item.status="{ item }">
            <v-chip
              :color="STATUS_CONFIG[item.status].color"
              size="small"
              class="text-white"
            >
              <v-icon start>{{ STATUS_CONFIG[item.status].icon }}</v-icon>
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-tooltip text="Pagar factura" v-if="item.status !== 'paid'">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    color="success"
                    variant="flat"
                    icon
                    class="mx-1"
                    size="small"
                    @click="handlePay(item)"
                  >
                    <v-icon>mdi-cash-check</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="Editar factura">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    color="info"
                    variant="flat"
                    icon
                    class="mx-1"
                    size="small"
                    @click="handleEdit(item)"
                  >
                    <v-icon>mdi-file-document-edit</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="Eliminar factura">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    color="error"
                    variant="flat"
                    icon
                    class="mx-1"
                    size="small"
                    @click="handleRemove(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>
      </template>
    </v-card>

    <!-- Dialogs -->
    <EditBillForm
      v-if="editingBill"
      :bill="editingBill"
      @updated="fetchData"
      @close="closeEdit"
    />

    <PayDialog
      v-if="payingBill"
      :bill="payingBill"
      @paid="onPaid"
      @close="closePay"
      @notify="$emit('notify', $event)"
    />

    <BaseConfirmDialog
  v-model="confirmDialog"
  title="Eliminar factura"
  @confirm="handleConfirmRemove"
>
  ¿Estás seguro que querés eliminar esta factura?
</BaseConfirmDialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseConfirmDialog from '../components/BaseConfirmDialog.vue';
import EditBillForm from '../components/EditBillForm.vue';
import PayDialog from '../components/PayDialog.vue';
import { useBills } from '../composables/useBills';
import { 
    STATUS_CONFIG, 
    STATUS_OPTIONS, 
    TABLE_HEADERS, 
    formatDate, 
    summarizePayments 
} from '../utils/billUtils';

const route = useRoute();
const id = route.params.id;

// Composables
const {
    service,
    bills,
    loading,
    error,
    totals,
    fetchData,
    removeBill,
    cancelSubscription
} = useBills(id);

// Local state
const filter = ref('');
const editingBill = ref(null);
const payingBill = ref(null);
const confirmDialog = ref(false);
const billToDelete = ref(null);

onMounted(fetchData);

// Computed
const filteredBills = computed(() =>
    filter.value ? bills.value.filter((b) => b.status === filter.value) : bills.value
);

// Methods
const handleEdit = (bill) => {
    editingBill.value = { ...bill };
};

const handlePay = (bill) => {
    payingBill.value = bill;
};

const handleRemove = (bill) => {
    billToDelete.value = bill;
    confirmDialog.value = true;
};

const handleConfirmRemove = async () => {
    confirmDialog.value = false;
    if (billToDelete.value) {
        loading.value = true;
        const success = await removeBill(billToDelete.value.id);
        if (success) {
            // Notificar al usuario
            await fetchData();
        } else {
            error.value = 'Error al eliminar la factura';
        }
        loading.value = false;
    }
};

const handleCancelSubscription = async () => {
    const success = await cancelSubscription();
    if (success) {
        // Notificar al usuario
    }
};

const closeEdit = () => editingBill.value = null;
const closePay = () => payingBill.value = null;
const closeConfirm = () => confirmDialog.value = false;

const onPaid = async () => {
    await fetchData();
    closePay();
};

// Lifecycle
onMounted(fetchData);
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
</style>

