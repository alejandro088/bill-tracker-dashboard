<template>
  <div>
    <h2>Payment History - {{ name }}</h2>
    <router-link to="/">Back</router-link>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <table v-else>
      <thead>
        <tr>
          <th>Bill Name</th>
          <th>Amount</th>
          <th>Due Date</th>
          <th>Paid Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in payments" :key="p.paidDate">
          <td>{{ p.name }}</td>
          <td>{{ p.amount.toFixed(2) }}</td>
          <td>{{ format(p.dueDate) }}</td>
          <td>{{ format(p.paidDate) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';

const props = defineProps({ name: String });
const payments = ref([]);
const loading = ref(false);
const error = ref(null);

function format(d) {
  return new Date(d).toLocaleDateString();
}

const fetchData = async () => {
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

<style scoped>
.error {
  color: red;
}
</style>
