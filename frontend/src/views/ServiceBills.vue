<template>
  <v-container>
    <h2>{{ service?.name }} - Facturas</h2>
    <v-btn variant="text" to="/">Back</v-btn>
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
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api.js';

const route = useRoute();
const id = route.params.id;

const service = ref(null);
const bills = ref([]);
const loading = ref(false);
const error = ref(null);
const filter = ref('');

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
  { title: 'Estado', key: 'status' }
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
</script>

