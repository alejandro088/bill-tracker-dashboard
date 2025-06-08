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
      <template #item.actions="{ item }">
        <v-btn
          v-if="item.status === 'pending'"
          size="small"
          color="green"
          variant="text"
          @click="pay(item)"
        >
          Pagar
        </v-btn>
        <v-btn size="small" variant="text" @click="edit(item)">✏️ Editar</v-btn>
        <v-btn size="small" variant="text" color="red" @click="remove(item)">
          🗑️
        </v-btn>
      </template>
    </v-data-table>
    <EditBillForm
      v-if="editingBill"
      :bill="editingBill"
      @updated="onUpdated"
      @close="closeEdit"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api.js';
import EditBillForm from '../components/EditBillForm.vue';

const route = useRoute();
const id = route.params.id;

const service = ref(null);
const bills = ref([]);
const loading = ref(false);
const error = ref(null);
const filter = ref('');
const editingBill = ref(null);

const statusOptions = [
  { title: 'All', value: '' },
  { title: 'paid', value: 'paid' },
  { title: 'pending', value: 'pending' },
  { title: 'overdue', value: 'overdue' }
];

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Descripción', key: 'description' },
  { title: 'Due Date', key: 'dueDate' },
  { title: 'Monto', key: 'amount' },
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

const filteredBills = computed(() =>
  filter.value ? bills.value.filter((b) => b.status === filter.value) : bills.value
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
  try {
    const provider = prompt('Payment provider', bill.paymentProvider || '');
    await api.put(`/bills/${bill.id}`, { status: 'paid', paymentProvider: provider });
    await fetchData();
  } catch (err) {
    error.value = err.message;
  }
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

