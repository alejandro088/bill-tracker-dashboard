<template>
  <div>
    <v-row class="mb-2" align="center">
      <v-col cols="12" sm="4">
        <v-text-field v-model="search" label="Search" density="compact" />
      </v-col>
      <v-col cols="12" sm="2">
        <v-select
          v-model="category"
          :items="categoryOptions"
          label="Category"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="2">
        <v-select
          v-model="status"
          :items="statusOptions"
          label="Status"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="2">
        <v-select
          v-model="paymentProvider"
          :items="providers"
          label="Provider"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="2">
        <v-select
          v-model="recurrence"
          :items="recurrenceOptions"
          label="Recurrence"
          density="compact"
          clearable
        />
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="bills"
      :loading="loading"
      class="elevation-1"
      hide-default-footer
    >
      <template #item.dueDate="{ item }">
        {{ formatDate(item.dueDate) }}
      </template>
      <template #item.paymentProvider="{ item }">
        <v-chip size="small">
          <v-icon start>{{ providerIcon(item.paymentProvider) }}</v-icon>
          {{ item.paymentProvider }}
        </v-chip>
      </template>
      <template #item.status="{ item }">
        <v-chip :color="statusColor(item.status)" size="small" class="text-white">
          {{ item.status }}
        </v-chip>
      </template>
      <template #item.autoRenew="{ item }">
        <v-icon v-if="item.autoRenew">mdi-check</v-icon>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon @click="pay(item)" :disabled="item.status === 'paid'">
          <v-icon>mdi-cash</v-icon>
        </v-btn>
        <v-btn
          icon
          v-if="item.category === 'subscriptions'"
          @click="cancel(item)"
          :disabled="!item.autoRenew"
        >
          <v-icon>mdi-cancel</v-icon>
        </v-btn>
        <v-btn icon v-if="item.category === 'subscriptions'" @click="history(item)">
          <v-icon>mdi-history</v-icon>
        </v-btn>
        <v-btn icon @click="edit(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-pagination v-model="page" :length="totalPages" class="mt-2" />

    <EditBillForm
      v-if="editingBill"
      :key="editingBill.id"
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
const providers = ['Visa', 'Mastercard', 'MercadoPago', 'Google Play', 'MODO', 'PayPal'];
const paymentProvider = ref('');
const recurrenceOptions = [
  { title: 'All', value: '' },
  { title: 'Weekly', value: 'weekly' },
  { title: 'Monthly', value: 'monthly' },
  { title: 'Bimonthly', value: 'bimonthly' },
  { title: 'Yearly', value: 'yearly' },
  { title: 'None', value: 'none' }
];
const recurrence = ref('');
const sort = ref('dueDate');
const loading = ref(false);
const error = ref(null);
const editingBill = ref(null);
const router = useRouter();

const categoryOptions = [
  { title: 'All Categories', value: '' },
  { title: 'Utilities', value: 'utilities' },
  { title: 'Subscriptions', value: 'subscriptions' },
  { title: 'Taxes', value: 'taxes' },
  { title: 'Others', value: 'others' }
];

const statusOptions = [
  { title: 'All Statuses', value: '' },
  { title: 'paid', value: 'paid' },
  { title: 'pending', value: 'pending' },
  { title: 'overdue', value: 'overdue' }
];

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Category', key: 'category' },
  { title: 'Due Date', key: 'dueDate' },
  { title: 'Amount', key: 'amount' },
  { title: 'Payment Provider', key: 'paymentProvider' },
  { title: 'Recurrence', key: 'recurrence' },
  { title: 'Status', key: 'status' },
  { title: 'Auto Renew', key: 'autoRenew', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false }
];

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
        paymentProvider: paymentProvider.value,
        recurrence: recurrence.value
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

watch([page, search, category, status, paymentProvider, recurrence, sort], fetchBills);
onMounted(fetchBills);

watch(paymentProvider, (val) => {
  router.replace({
    query: { ...router.currentRoute.value.query, paymentProvider: val || undefined }
  });
});

const totalPages = computed(() => Math.ceil(total.value / limit) || 1);

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function statusColor(status) {
  return { paid: 'green', pending: 'orange', overdue: 'red' }[status];
}

function providerIcon(name) {
  const icons = {
    Visa: 'mdi-credit-card',
    Mastercard: 'mdi-credit-card',
    MercadoPago: 'mdi-currency-usd',
    'Google Play': 'mdi-cellphone',
    MODO: 'mdi-bank',
    PayPal: 'mdi-currency-usd'
  };
  return icons[name] || 'mdi-cash';
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
.error {
  color: red;
}
</style>
