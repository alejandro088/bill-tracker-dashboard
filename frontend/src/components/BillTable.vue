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
      <v-col cols="12" sm="2">
        <v-select
          v-model="currency"
          :items="['All', 'ARS', 'USD']"
          label="Currency"
          density="compact"
          clearable
        />
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="groupedBills"
      :loading="loading"
      class="elevation-1"
      hide-default-footer
    >
      <template #item.dueDate="{ item }">
        {{ formatDate(item.dueDate) }}
      </template>
      <template #item.invoiceCount="{ item }">
        Invoices: {{ item.invoiceCount }}
      </template>
      <template #item.amount="{ item }">
        {{ formatAmountWithCurrency(item.amount, item.currency) }}
      </template>
      <template #item.paymentProvider="{ item }">
        <span v-if="item.payments?.length">{{ summarize(item.payments) }}</span>
        <v-icon v-else color="grey">mdi-minus</v-icon>
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
        <v-btn icon v-if="item.invoiceCount > 1" @click="history(item)">
          <v-icon>mdi-history</v-icon>
        </v-btn>
        <v-btn icon v-if="!item.autoRenew" @click="newInvoice(item)">
          <v-icon>mdi-plus</v-icon>
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
      @close="editingBill = null"
      @notify="$emit('notify', $event)"
    />

    <PayDialog
      :bill="payingBill"
      @paid="onPaid"
      @close="payingBill = null"
      @notify="$emit('notify', $event)"
    />

    <ManualInvoiceForm
      :service="newInvoiceService"
      @created="onInvoiceCreated"
      @close="newInvoiceService = null"
      @notify="$emit('notify', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatAmount, formatAmountWithCurrency, statusColor } from '../utils/formatters';
import EditBillForm from './EditBillForm.vue';
import PayDialog from './PayDialog.vue';
import ManualInvoiceForm from './ManualInvoiceForm.vue';
import api from '../api';

defineProps({
  loading: Boolean,
  bills: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['updated', 'notify']);

const search = ref('');
const category = ref(null);
const status = ref(null);
const paymentProvider = ref(null);
const recurrence = ref(null);
const currency = ref('All');
const page = ref(1);
const editingBill = ref(null);
const payingBill = ref(null);
const newInvoiceService = ref(null);

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Amount', key: 'amount', align: 'end' },
  { title: 'Due Date', key: 'dueDate' },
  { title: 'Category', key: 'category' },
  { title: 'Provider', key: 'paymentProvider' },
  { title: 'Status', key: 'status' },
  { title: 'Auto', key: 'autoRenew', align: 'center' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const categoryOptions = ['utilities', 'subscriptions', 'taxes', 'others'];
const statusOptions = ['paid', 'pending', 'overdue'];
const providers = ['Visa', 'Mastercard', 'MercadoPago', 'Google Play', 'MODO', 'PayPal'];
const recurrenceOptions = ['none', 'weekly', 'monthly', 'bimonthly', 'yearly'];

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

const filteredBills = computed(() => {
  let result = props.bills;

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(bill => 
      bill.name.toLowerCase().includes(searchLower) ||
      bill.description?.toLowerCase().includes(searchLower)
    );
  }

  if (category.value) {
    result = result.filter(bill => bill.category === category.value);
  }

  if (status.value) {
    result = result.filter(bill => bill.status === status.value);
  }

  if (paymentProvider.value) {
    result = result.filter(bill => bill.paymentProvider === paymentProvider.value);
  }

  if (recurrence.value) {
    result = result.filter(bill => bill.recurrence === recurrence.value);
  }

  if (currency.value && currency.value !== 'All') {
    result = result.filter(bill => bill.currency === currency.value);
  }

  return result;
});

const groupedBills = computed(() => {
  return filteredBills.value.slice((page.value - 1) * 10, page.value * 10);
});

const totalPages = computed(() => Math.ceil(filteredBills.value.length / 10));

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
  router.push({
    path: '/history',
    query: {
      name: bill.name,
      provider: bill.paymentProvider || '',
      category: bill.category,
      serviceId: bill.serviceId
    }
  });
}

function newInvoice(bill) {
  newBill.value = {
    name: bill.name,
    category: bill.category,
    paymentProvider: bill.paymentProvider,
    recurrence: bill.recurrence || 'none',
    amount: bill.amount,
    dueDate: bill.dueDate.substring(0, 10),
    status: 'pending',
    serviceId: bill.serviceId
  };
}

function closeNew() {
  newBill.value = null;
}

async function onCreated() {
  await fetchBills();
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
