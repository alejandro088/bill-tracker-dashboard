<template>
  <v-container>
    <h2>Payment History<span v-if="name"> - {{ name }}</span></h2>
    <v-btn variant="text" to="/">Back</v-btn>
    <v-row class="mb-2" v-if="!name" align="center">
      <v-col cols="12" sm="3">
        <v-select
          v-model="category"
          :items="categories"
          label="Category"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="3">
        <v-select
          v-model="provider"
          :items="providers"
          label="Provider"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="3">
        <v-menu v-model="menuStart" :close-on-content-click="false" transition="scale-transition">
          <template #activator="{ props }">
            <v-text-field
              v-model="startDate"
              label="Start"
              readonly
              v-bind="props"
              density="compact"
            />
          </template>
          <v-date-picker v-model="startDate" @update:modelValue="menuStart = false" />
        </v-menu>
      </v-col>
      <v-col cols="12" sm="3">
        <v-menu v-model="menuEnd" :close-on-content-click="false" transition="scale-transition">
          <template #activator="{ props }">
            <v-text-field
              v-model="endDate"
              label="End"
              readonly
              v-bind="props"
              density="compact"
            />
          </template>
          <v-date-picker v-model="endDate" @update:modelValue="menuEnd = false" />
        </v-menu>
      </v-col>
    </v-row>
    <v-progress-linear v-if="loading" indeterminate />
    <v-alert v-else-if="error" type="error" dense>{{ error }}</v-alert>
    <v-data-table
      v-else
      :headers="headers"
      :items="filteredPayments"
      class="elevation-1"
      hide-default-footer
    >
      <template #item.dueDate="{ item }">{{ format(item.dueDate) }}</template>
      <template #item.paidAt="{ item }">{{ format(item.paidAt) }}</template>
      <template #item.amount="{ item }">{{ item.amount.toFixed(2) }}</template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api.js';

const props = defineProps({ name: String });
const route = useRoute();
const name = computed(() => route.query.name || props.name || '');
const payments = ref([]);
const loading = ref(false);
const error = ref(null);
const category = ref('');
const provider = ref('');
const startDate = ref('');
const endDate = ref('');
const menuStart = ref(false);
const menuEnd = ref(false);

const categories = [
  { title: 'Utilities', value: 'utilities' },
  { title: 'Subscriptions', value: 'subscriptions' },
  { title: 'Taxes', value: 'taxes' },
  { title: 'Others', value: 'others' }
];
const providers = ['Visa', 'Mastercard', 'MercadoPago', 'Google Play', 'MODO', 'PayPal'];

const headers = [
  { title: 'Bill Name', key: 'name' },
  { title: 'Amount', key: 'amount' },
  { title: 'Due Date', key: 'dueDate' },
  { title: 'Paid Date', key: 'paidAt' },
  { title: 'Provider', key: 'paymentProvider' },
  { title: 'Recurrence', key: 'recurrence' }
];

function format(d) {
  return new Date(d).toLocaleDateString();
}

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/payments');
    payments.value = data;
    error.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
watch(
  () => route.query,
  fetchData,
  { deep: true }
);

const filteredPayments = computed(() => {
  let data = [...payments.value];
  if (name.value) data = data.filter((p) => p.name === name.value);
  if (route.query.provider)
    data = data.filter((p) => p.paymentProvider === route.query.provider);
  if (route.query.category)
    data = data.filter((p) => p.category === route.query.category);

  if (category.value)
    data = data.filter((p) => p.category === category.value);
  if (provider.value)
    data = data.filter(
      (p) => p.paymentProvider && p.paymentProvider === provider.value
    );
  if (startDate.value)
    data = data.filter((p) => new Date(p.paidAt) >= new Date(startDate.value));
  if (endDate.value)
    data = data.filter((p) => new Date(p.paidAt) <= new Date(endDate.value));
  return data.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
});
</script>


