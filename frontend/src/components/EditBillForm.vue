<template>
  <v-dialog v-model="dialog" max-width="500" @update:modelValue="val => !val && close()">
    <v-card>
      <v-form @submit.prevent="submit">
        <v-card-title>Edit Bill</v-card-title>
        <v-card-text class="pt-0">
          <v-text-field v-model="name" label="Name" density="compact" required />
          <v-text-field v-model="description" label="Description" density="compact" />
          <v-text-field
            v-model.number="amount"
            label="Amount"
            type="number"
            density="compact"
            required
          />
          <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition">
            <template #activator="{ props }">
              <v-text-field
                v-model="dueDate"
                label="Due Date"
                readonly
                v-bind="props"
                density="compact"
              />
            </template>
            <v-date-picker v-model="dueDate" @update:modelValue="menu = false" />
          </v-menu>
          <v-select
            v-model="paymentProvider"
            :items="providers"
            label="Payment Provider"
            density="compact"
          />
          <v-select v-model="category" :items="categories" label="Category" density="compact" />
          <v-select v-model="status" :items="statusOptions" label="Status" density="compact" />
          <v-switch v-if="category === 'subscriptions'" v-model="autoRenew" label="Auto Renew" />
          <v-alert v-if="error" type="error" dense class="mt-2">{{ error }}</v-alert>
        </v-card-text>
        <v-card-actions class="pt-0">
          <v-spacer />
          <v-btn text @click="close">Cancel</v-btn>
          <v-btn type="submit" :loading="loading" color="primary">Save</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from '../api.js';

const props = defineProps({ bill: Object });
const emit = defineEmits(['updated', 'close']);

const menu = ref(false);
const dialog = ref(false);
const name = ref('');
const description = ref('');
const amount = ref(0);
const dueDate = ref('');
const providers = [
  'Visa',
  'Mastercard',
  'MercadoPago',
  'Google Play',
  'MODO',
  'PayPal'
];
const categories = ['utilities', 'subscriptions', 'taxes', 'others'];
const statusOptions = ['pending', 'paid', 'overdue'];
const category = ref('utilities');
const status = ref('pending');
const paymentProvider = ref(providers[0]);
const autoRenew = ref(false);
const loading = ref(false);
const error = ref(null);

const setFields = (b) => {
  if (!b) return;
  name.value = b.name;
  description.value = b.description;
  amount.value = b.amount;
  dueDate.value = b.dueDate.substring(0,10);
  category.value = b.category;
  status.value = b.status;
  paymentProvider.value = b.paymentProvider || providers[0];
  autoRenew.value = b.autoRenew || false;
};

watch(
  () => props.bill,
  (b) => {
    setFields(b);
    dialog.value = !!b;
  },
  { immediate: true }
);

function close() {
  dialog.value = false;
  emit('close');
}

const submit = async () => {
  loading.value = true;
  try {
    await api.put(`/bills/${props.bill.id}`, {
      name: name.value,
      description: description.value,
      amount: amount.value,
      dueDate: dueDate.value,
      paymentProvider: paymentProvider.value,
      category: category.value,
      status: status.value,
      autoRenew: autoRenew.value
    });
    emit('updated');
    error.value = null;
    close();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>


