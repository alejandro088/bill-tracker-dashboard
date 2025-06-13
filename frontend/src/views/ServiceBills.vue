<template>
  <v-container>
    <h2>{{ service?.name }} - Facturas</h2>
    <v-btn variant="text" to="/">Back</v-btn>
    <v-btn
      v-if="service?.autoRenew"
      class="ml-2"
      color="red"
      @click="cancelSub"
    >
      ❌ Cancelar suscripción
    </v-btn>
    <div class="my-2 d-flex gap-2">
      <v-chip color="green">💰 Paid: {{ totals.paid.toFixed(2) }}</v-chip>
      <v-chip color="orange">⏳ Pending: {{ totals.pending.toFixed(2) }}</v-chip>
      <v-chip color="red">⚠️ Overdue: {{ totals.overdue.toFixed(2) }}</v-chip>
    </div>
    <v-select
      v-model="filter"
      :items="statusOptions"
      label="Status"
      density="compact"
      clearable
      class="mb-2"
    />
    <v-progress-linear v-if="loading" indeterminate />
    <v-alert v-else-if="error" type="error" dense>{{ error }}</v-alert>
    <v-data-table
      v-else
      :headers="headers"
      :items="filteredBills"
      class="elevation-1"
      hide-default-footer
    >
      <template #item.dueDate="{ item }">{{ format(item.dueDate) }}</template>
      <template #item.amount="{ item }">{{ item.amount.toFixed(2) }}</template>
      <template #item.paymentProvider="{ item }">
        <span v-if="item.payments?.length">
          {{ summarize(item.payments) }}
        </span>
        <v-tooltip v-else text="Agregar medio de pago" location="top">
          <template #activator="{ props }">
            <v-icon
              v-bind="props"
              class="cursor-pointer"
              @click="edit(item)"
            >mdi-pencil</v-icon>
          </template>
        </v-tooltip>
      </template>
      <template #item.status="{ item }">
        <v-chip :color="statusColor(item.status)" size="small" class="text-white">
          <v-icon start>{{ statusIcon(item.status) }}</v-icon>
          {{ item.status }}
        </v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-tooltip v-if="item.status !== 'paid'" text="Pagar" location="top">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              color="green"
              size="small"
              @click="pay(item)"
            >
              <v-icon>mdi-cash-check</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Editar" location="top">
          <template #activator="{ props }">
            <v-btn icon size="small" v-bind="props" @click="edit(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Eliminar" location="top">
          <template #activator="{ props }">
            <v-btn icon size="small" color="red" v-bind="props" @click="remove(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </v-data-table>
    <EditBillForm
      v-if="editingBill"
      :bill="editingBill"
      @updated="onUpdated"
      @close="closeEdit"
    />
    <PayDialog
      v-if="payingBill"
      :bill="payingBill"
      @paid="onPaid"
      @close="closePay"
      @notify="$emit('notify', $event)"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api.js';
import EditBillForm from '../components/EditBillForm.vue';
import PayDialog from '../components/PayDialog.vue';

const route = useRoute();
const id = route.params.id;

const service = ref(null);
const bills = ref([]);
const loading = ref(false);
const error = ref(null);
const filter = ref('');
const editingBill = ref(null);
const payingBill = ref(null);

const statusOptions = [
  { title: 'All', value: '' },
  { title: 'paid', value: 'paid' },
  { title: 'pending', value: 'pending' },
  { title: 'overdue', value: 'overdue' }
];

const headers = [
  { title: 'Due Date', key: 'dueDate' },
  { title: 'Monto', key: 'amount' },
  { title: 'Medio de pago', key: 'paymentProvider', sortable: false },
  { title: 'Estado', key: 'status' },
  { title: 'Acciones', key: 'actions', sortable: false }
];

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await api.get(`/services/${id}`);
    service.value = data;
    bills.value = data.bills || [];
    error.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const sortedBills = computed(() =>
  [...bills.value].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
);

const filteredBills = computed(() =>
  filter.value ? sortedBills.value.filter((b) => b.status === filter.value) : sortedBills.value
);

const totals = computed(() => {
  return bills.value.reduce(
    (acc, b) => {
      acc[b.status] += b.amount;
      return acc;
    },
    { paid: 0, pending: 0, overdue: 0 }
  );
});

function statusColor(status) {
  return { paid: 'green', pending: 'orange', overdue: 'red' }[status] || 'grey';
}

function statusIcon(status) {
  return (
    {
      paid: 'mdi-check-circle',
      pending: 'mdi-clock-outline',
      overdue: 'mdi-alert-circle'
    }[status] || ''
  );
}

function summarize(payments) {
  const map = {};
  payments.forEach((p) => {
    if (!map[p.paymentProvider]) map[p.paymentProvider] = 0;
    map[p.paymentProvider] += Number(p.amount);
  });
  return Object.entries(map)
    .map(([prov, amt]) => `${prov} ($${amt.toFixed(2)})`)
    .join(' + ');
}

function format(d) {
  return new Date(d).toLocaleDateString();
}

function edit(bill) {
  editingBill.value = { ...bill };
}

function closeEdit() {
  editingBill.value = null;
}

async function onUpdated() {
  await fetchData();
}

async function pay(bill) {
  payingBill.value = bill;
}

function closePay() {
  payingBill.value = null;
}

async function onPaid() {
  await fetchData();
  closePay();
}

async function remove(bill) {
  try {
    await api.delete(`/bills/${bill.id}`);
    await fetchData();
  } catch (err) {
    error.value = err.message;
  }
}

async function cancelSub() {
  try {
    await api.put(`/services/${id}`, { autoRenew: false });
    service.value.autoRenew = false;
  } catch (err) {
    error.value = err.message;
  }
}
</script>

