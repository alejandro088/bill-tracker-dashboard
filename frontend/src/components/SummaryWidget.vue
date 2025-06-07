<template>
  <v-row class="mb-4">
    <v-col cols="12" v-if="loading">
      <v-progress-linear indeterminate />
    </v-col>
    <v-col cols="12" v-else-if="error">
      <v-alert type="error" dense>{{ error }}</v-alert>
    </v-col>
    <v-col cols="12" v-else class="d-flex gap-2">
      <v-chip color="green">Paid: {{ summary.paid.toFixed(2) }}</v-chip>
      <v-chip color="orange">Pending: {{ summary.pending.toFixed(2) }}</v-chip>
      <v-chip color="red">Overdue: {{ summary.overdue.toFixed(2) }}</v-chip>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';

const summary = ref({ paid: 0, pending: 0, overdue: 0 });
const loading = ref(false);
const error = ref(null);

const fetchSummary = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/bills/summary');
    summary.value = data;
    error.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchSummary);
</script>


