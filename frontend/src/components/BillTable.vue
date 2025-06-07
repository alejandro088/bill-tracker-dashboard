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
      <select v-model="paymentProvider">
        <option value="">All Providers</option>
        <option v-for="p in providers" :key="p" :value="p">{{ p }}</option>
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
          <th>Payment Provider</th>
          <th>Status</th>
          <th>Auto Renew</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bill in bills" :key="bill.id">
          <td>{{ bill.name }}</td>
          <td>{{ bill.description }}</td>
          <td>{{ bill.category }}</td>
          <td>{{ formatDate(bill.dueDate) }}</td>
          <td>{{ bill.amount.toFixed(2) }}</td>
          <td>{{ providerIcon(bill.paymentProvider) }} {{ bill.paymentProvider }}</td>
          <td :class="'status-' + bill.status">{{ bill.status }}</td>
          <td>{{ bill.autoRenew ? 'Yes' : 'No' }}</td>
          <td>
            <button @click="pay(bill)" :disabled="bill.status === 'paid'">
              Pay
            </button>
            <button
              v-if="bill.category === 'subscriptions'"
              @click="cancel(bill)"
              :disabled="!bill.autoRenew"
            >
              Cancel
            </button>
            <button v-if="bill.category === 'subscriptions'" @click="history(bill)">
              History
            </button>
            <button @click="edit(bill)">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button @click="prev" :disabled="page === 1">Prev</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button @click="next" :disabled="page === totalPages">Next</button>
    </div>
    <EditBillForm
      v-if="editingBill"
      :bill="editingBill"
      @updated="onUpdated"
      @close="closeEdit"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import api from '../api.js';
import EditBillForm from './EditBillForm.vue';
import { useRouter } from 'vue-router';

const emit = defineEmits(['notify']);

const bills = ref([]);
const total = ref(0);
const page = ref(1);
const limit = 10;
const search = ref('');
const category = ref('');
const status = ref('');
const providers = [
  'Visa',
  'Mastercard',
  'MercadoPago',
  'Google Play',
  'MODO',
  'PayPal'
];
const paymentProvider = ref('');
const sort = ref('dueDate');
const loading = ref(false);
const error = ref(null);
const editingBill = ref(null);
const router = useRouter();

const fetchBills = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/bills', {
      params: {
        page: page.value,
        limit,
        sort: sort.value,
        search: search.value,
        category: category.value,
        status: status.value,
        paymentProvider: paymentProvider.value
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

watch([page, search, category, status, paymentProvider, sort], fetchBills);
onMounted(fetchBills);

watch(paymentProvider, (val) => {
  router.replace({
    query: { ...router.currentRoute.value.query, paymentProvider: val || undefined }
  });
});

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

function providerIcon(name) {
  const icons = {
    Visa: '💳',
    Mastercard: '💳',
    MercadoPago: '🤑',
    'Google Play': '📱',
    MODO: '🏦',
    PayPal: '💲'
  };
  return icons[name] || '';
}

function edit(bill) {
  editingBill.value = { ...bill };
}

function closeEdit() {
  editingBill.value = null;
}

async function onUpdated() {
  await fetchBills();
}

async function pay(bill) {
  try {
    const { data } = await api.put(`/bills/${bill.id}`, { status: 'paid' });
    await fetchBills();
    if (data.newBill) emitNotify('New bill generated via auto-renew');
  } catch (err) {
    error.value = err.message;
  }
}

async function cancel(bill) {
  try {
    await api.put(`/bills/${bill.id}`, { autoRenew: false });
    await fetchBills();
  } catch (err) {
    error.value = err.message;
  }
}

function history(bill) {
  router.push(`/history/${bill.name}`);
}

function emitNotify(msg) {
  emit('notify', msg);
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
