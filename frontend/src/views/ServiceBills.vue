<template>
    <v-container>
        <v-card class="mb-4">
            <v-card-title class="header-card pa-4">
                <div>
                    <h2
                        class="text-h5 font-weight-medium mb-1 text-white d-flex align-center"
                    >
                        <v-icon
                            icon="mdi-file-document-multiple"
                            class="mr-2"
                            color="white"
                        />
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
                    class="text-white mr-2"
                    prepend-icon="mdi-arrow-left"
                >
                    Volver
                </v-btn>
                <v-btn
                    color="success"
                    variant="flat"
                    class="text-white mr-2"
                    @click="openNewBillForm"
                    prepend-icon="mdi-plus"
                >
                    Nueva Factura
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
                        <base-card type="success">
                            <template #icon>
                                <v-icon size="large">mdi-check-circle</v-icon>
                            </template>
                            <template #title>Pagado</template>
                            <template #value>
                                <div class="d-flex align-center">
                                    <span class="currency">$</span>
                                    <span class="amount">{{ formatAmount(totals.paid) }}</span>
                                </div>
                            </template>
                            <template #footer v-if="lastPaidDate">
                                <div class="d-flex align-center">
                                    <v-icon size="small" class="me-1">mdi-calendar-check</v-icon>
                                    Último pago: {{ formatDate(lastPaidDate) }}
                                </div>
                            </template>
                        </base-card>
                    </v-col>

                    <v-col cols="12" sm="4">
                        <base-card type="warning">
                            <template #icon>
                                <v-icon size="large">mdi-clock-outline</v-icon>
                            </template>
                            <template #title>Pendiente</template>
                            <template #value>
                                <div class="d-flex align-center">
                                    <span class="currency">$</span>
                                    <span class="amount">{{ formatAmount(totals.pending) }}</span>
                                </div>
                            </template>
                            <template #footer v-if="nextDueDate">
                                <div class="d-flex align-center">
                                    <v-icon size="small" class="me-1">mdi-calendar-clock</v-icon>
                                    Próximo venc.: {{ formatDate(nextDueDate) }}
                                </div>
                            </template>
                        </base-card>
                    </v-col>

                    <v-col cols="12" sm="4">
                        <base-card type="danger">
                            <template #icon>
                                <v-icon size="large">mdi-alert-circle</v-icon>
                            </template>
                            <template #title>Vencido</template>
                            <template #value>
                                <div class="d-flex align-center">
                                    <span class="currency">$</span>
                                    <span class="amount">{{ formatAmount(totals.overdue) }}</span>
                                </div>
                            </template>
                            <template #footer v-if="overdueCount">
                                <div class="d-flex align-center">
                                    <v-icon size="small" class="me-1">mdi-alert</v-icon>
                                    {{ overdueCount }} factura{{ overdueCount > 1 ? 's' : '' }} sin pagar
                                </div>
                            </template>
                        </base-card>
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
            <v-tooltip :text="getDaysUntilDue(item.dueDate) < 0 
              ? `Vencido hace ${Math.abs(getDaysUntilDue(item.dueDate))} días`
              : `Vence en ${getDaysUntilDue(item.dueDate)} días`"
            >
              <template #activator="{ props }">
                <div v-bind="props" class="d-flex align-center gap-2">
                  <v-icon 
                    size="small" 
                    :color="getDaysUntilDue(item.dueDate) < 0 ? 'error' : 'grey'"
                  >
                    mdi-calendar
                  </v-icon>
                  <span :class="{ 'text-error': getDaysUntilDue(item.dueDate) < 0 }">
                    {{ formatDate(item.dueDate) }}
                  </span>
                </div>
              </template>
            </v-tooltip>
          </template>

                    <template #item.amount="{ item }">
                        <v-chip
                            :color="STATUS_CONFIG[item.status].color"
                            class="amount-chip"
                            size="small"
                            variant="elevated"
                        >
                            <v-icon start size="18">mdi-currency-usd</v-icon>
                            <span class="font-weight-medium">
                                {{ formatAmount(item.amount) }}
                            </span>
                        </v-chip>
                    </template>

                    <template #item.paymentProvider="{ item }">
                        <template v-if="item.payments?.length">
                            <v-chip
                                size="small"
                                prepend-icon="mdi-credit-card-multiple"
                            >
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
                        <v-tooltip :text="getStatusTooltip(item)">
                            <template #activator="{ props }">
                                <v-chip
                                    v-bind="props"
                                    :color="STATUS_CONFIG[item.status].color"
                                    :variant="STATUS_CONFIG[item.status].chipVariant"
                                    size="small"
                                    class="text-white px-2"
                                >
                                    <v-icon start size="16">
                                        {{ STATUS_CONFIG[item.status].icon }}
                                    </v-icon>
                                    {{ STATUS_CONFIG[item.status].text }}
                                </v-chip>
                            </template>
                        </v-tooltip>
                    </template>

                    <template #item.actions="{ item }">
                        <div class="d-flex gap-1">
                            <v-tooltip
                                text="Pagar factura"
                                v-if="item.status !== 'paid'"
                            >
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
                                        @click="deleteBill(item)"
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

        <ManualInvoiceForm
            v-if="showNewBillForm"
            :bill="{ serviceId: service?.id }"
            @created="handleBillCreated"
            @close="showNewBillForm = false"
        />

        <base-confirm-dialog
      v-model="showDeleteDialog"
      title="Confirmar eliminación"
      text="¿Estás seguro que deseas eliminar este pago?"
      :loading="loading"
      @confirm="confirmDelete"
    >
      <template #details v-if="billToDelete">
        <p class="text-body-2">
          <strong>Servicio:</strong> {{ billToDelete.Bill.Service.name }}<br>
          <strong>Monto:</strong> ${{ billToDelete.amount?.toFixed(2) }}<br>
          <strong>Fecha de pago:</strong> {{ format(billToDelete.paidAt) }}
        </p>
      </template>
    </base-confirm-dialog>

        <EditBillForm
            v-if="selectedBill"
            :bill="selectedBill"
            @updated="handleBillUpdated"
            @close="selectedBill = null"
        />

        <PayDialog
            v-if="billToPay"
            :bill="billToPay"
            @paid="handleBillPaid"
            @close="billToPay = null"
        />
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseCard from '../components/BaseCard.vue';
import api from '../api.js';
import EditBillForm from '../components/EditBillForm.vue';
import PayDialog from '../components/PayDialog.vue';
import ManualInvoiceForm from '../components/ManualInvoiceForm.vue';
import BaseConfirmDialog from '../components/BaseConfirmDialog.vue';
import { useBills } from '../composables/useBills';
import {
    STATUS_OPTIONS,
    TABLE_HEADERS,
    summarizePayments,
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
    cancelSubscription,
} = useBills(id);

// Local state
const filter = ref('');
const selectedBill = ref(null);
const billToPay = ref(null);
const confirmDialog = ref(false);
const billToDelete = ref(null);
const showNewBillForm = ref(false);
const showDeleteDialog = ref(false);

const emit = defineEmits(['notify']);

onMounted(fetchData);

// Computed
const filteredBills = computed(() =>
    filter.value
        ? bills.value.filter((b) => b.status === filter.value)
        : bills.value
);

// Methods
const handleEdit = (bill) => {
    selectedBill.value = bill;
};

const deleteBill = (item) => {
  billToDelete.value = item;
  showDeleteDialog.value = true;
};


const confirmDelete = async () => {
    if (!billToDelete.value) return;
    try {
      console.log('Removing bill', billToDelete.value);
        await removeBill(billToDelete.value.id);
        console.log('Bill removed successfully');
    } catch (err) {
        console.log(err);
    }
    billToDelete.value = null;
};

const handleBillUpdated = async () => {
    selectedBill.value = null;
    await fetchData();
    notify('Factura actualizada exitosamente', 'success');
};

const handlePay = (bill) => {
    billToPay.value = bill;
};

const handleBillPaid = async () => {
    billToPay.value = null;
    await fetchData();
    notify('Pago registrado exitosamente', 'success');
};

const openNewBillForm = () => {
    showNewBillForm.value = true;
};

const handleBillCreated = async () => {
    showNewBillForm.value = false;
    await fetchData();
    notify('Factura creada exitosamente', 'success');
};

const notify = (message, type = 'success') => {
    emit('notify', message);
};

const getDaysUntilDue = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const formatAmount = (amount) => {
    return amount.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
};

// Computed properties para las fechas
const lastPaidDate = computed(() => {
    const paidBills = bills.value.filter(bill => bill.status === 'paid');
    if (!paidBills.length) return null;
    return Math.max(...paidBills.map(bill => new Date(bill.paidAt)));
});

const nextDueDate = computed(() => {
    const pendingBills = bills.value.filter(bill => bill.status === 'pending');
    if (!pendingBills.length) return null;
    return Math.min(...pendingBills.map(bill => new Date(bill.dueDate)));
});

const overdueCount = computed(() => {
    return bills.value.filter(bill => bill.status === 'overdue').length;
});

// Configuración mejorada de estados
const STATUS_CONFIG = {
  paid: {
    color: 'success',
    icon: 'mdi-check-circle',
    text: 'Pagado',
    chipVariant: 'elevated'
  },
  pending: {
    color: 'warning',
    icon: 'mdi-clock-outline',
    text: 'Pendiente',
    chipVariant: 'flat'
  },
  overdue: {
    color: 'error',
    icon: 'mdi-alert-circle',
    text: 'Vencido',
    chipVariant: 'elevated'
  }
};

const getStatusTooltip = (bill) => {
  switch (bill.status) {
    case 'paid':
      return `Pagado ${bill.payments?.length > 0 ? 'el ' + formatDate(bill.payments[0].paidAt) : ''}`;
    case 'pending':
      return `Pendiente - Vence el ${formatDate(bill.dueDate)}`;
    case 'overdue':
      return `Vencido hace ${Math.abs(getDaysUntilDue(bill.dueDate))} días`;
    default:
      return bill.status;
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

.text-error {
  color: rgb(var(--v-theme-error)) !important;
}

.text-success {
  color: rgb(var(--v-theme-success)) !important;
}

.text-warning {
  color: rgb(var(--v-theme-warning)) !important;
}

.v-chip {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.v-chip .v-icon {
  margin-right: 4px;
}

.amount-chip {
  font-weight: 500;
  letter-spacing: 0.5px;
  min-width: 120px;
  justify-content: center;
}

.amount-chip.v-chip {
  color: white;
}

.amount-chip .v-icon {
  margin-right: 4px;
}

.currency {
    font-size: 1rem;
    font-weight: 500;
    margin-right: 4px;
    opacity: 0.7;
}

.amount {
    font-size: 1.5rem;
    font-weight: 600;
}

:deep(.card-value) {
    margin: 8px 0;
}
</style>
