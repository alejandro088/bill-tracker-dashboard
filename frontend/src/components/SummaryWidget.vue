<template>
  <div class="summary">
    <div v-if="loading">Loading summary...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <span>Paid: {{ summary.paid.toFixed(2) }}</span>
      <span>Pending: {{ summary.pending.toFixed(2) }}</span>
      <span>Overdue: {{ summary.overdue.toFixed(2) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const summary = ref({ paid: 0, pending: 0, overdue: 0 });
const loading = ref(false);
const error = ref(null);

const fetchSummary = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get('/bills/summary');
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

<style scoped>
.summary {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}
.error {
  color: red;
}
</style>
