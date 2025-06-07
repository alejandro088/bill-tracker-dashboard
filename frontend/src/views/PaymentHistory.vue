<template>
  <v-container>
    <h2>Payment History<span v-if="name"> - {{ name }}</span></h2>
    <v-btn variant="text" to="/">Back</v-btn>
    <div v-if="!name" class="info">Select a bill from the dashboard to view history.</div>
    <div v-else>
      <v-progress-linear v-if="loading" indeterminate />
      <v-alert v-else-if="error" type="error" dense>{{ error }}</v-alert>
      <v-data-table
        v-else
        :headers="headers"
        :items="payments"
        class="elevation-1"
        hide-default-footer
      >
        <template #item.dueDate="{ item }">{{ format(item.dueDate) }}</template>
        <template #item.paidDate="{ item }">{{ format(item.paidDate) }}</template>
        <template #item.amount="{ item }">{{ item.amount.toFixed(2) }}</template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';

const props = defineProps({ name: String });
const payments = ref([]);
const loading = ref(false);
const error = ref(null);

const headers = [
  { title: 'Bill Name', key: 'name' },
  { title: 'Amount', key: 'amount' },
  { title: 'Due Date', key: 'dueDate' },
  { title: 'Paid Date', key: 'paidDate' }
];

function format(d) {
  return new Date(d).toLocaleDateString();
}

const fetchData = async () => {
  if (!props.name) return;
  loading.value = true;
  try {
    const { data } = await api.get(`/payments/${props.name}`);
    payments.value = data;
    error.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>


