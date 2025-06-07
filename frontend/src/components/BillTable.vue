<template>
  <div>
    <div class="controls">
      <input v-model="search" placeholder="Search" />
      <select v-model="category">
        <option value="">All Categories</option>
        <option value="utilities">Utilities</option>
        <option value="subscriptions">Subscriptions</option>
        <option value="taxes">Taxes</option>
        <option value="others">Others</option>
      </select>
      <select v-model="status">
        <option value="">All Statuses</option>
        <option value="paid">Paid</option>
        <option value="pending">Pending</option>
        <option value="overdue">Overdue</option>
      </select>
    </div>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <table v-else>
      <thead>
        <tr>
          <th @click="changeSort('name')">Name</th>
          <th>Description</th>
          <th @click="changeSort('category')">Category</th>
          <th @click="changeSort('dueDate')">Due Date</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bill in bills" :key="bill.id">
          <td>{{ bill.name }}</td>
          <td>{{ bill.description }}</td>
          <td>{{ bill.category }}</td>
          <td>{{ formatDate(bill.dueDate) }}</td>
          <td>{{ bill.amount.toFixed(2) }}</td>
          <td :class="'status-' + bill.status">{{ bill.status }}</td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button @click="prev" :disabled="page === 1">Prev</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button @click="next" :disabled="page === totalPages">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import axios from 'axios';

const bills = ref([]);
const total = ref(0);
const page = ref(1);
const limit = 10;
const search = ref('');
const category = ref('');
const status = ref('');
const sort = ref('dueDate');
const loading = ref(false);
const error = ref(null);

const fetchBills = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get('/bills', {
      params: {
        page: page.value,
        limit,
        sort: sort.value,
        search: search.value,
        category: category.value,
        status: status.value
      }
    });
    bills.value = data.data;
    total.value = data.total;
    error.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

watch([page, search, category, status, sort], fetchBills);
onMounted(fetchBills);

const totalPages = computed(() => Math.ceil(total.value / limit) || 1);

function prev() {
  if (page.value > 1) page.value--;
}
function next() {
  if (page.value < totalPages.value) page.value++;
}
function changeSort(field) {
  sort.value = field;
}
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
</script>

<style scoped>
.controls {
  margin-bottom: 10px;
}
.error {
  color: red;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 6px 8px;
  border: 1px solid #ccc;
}
th {
  cursor: pointer;
}
.status-paid {
  color: green;
}
.status-pending {
  color: orange;
}
.status-overdue {
  color: red;
}
.pagination {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
