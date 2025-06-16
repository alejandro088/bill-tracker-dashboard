<template>
  <v-btn class="add-btn" color="primary" @click="dialog = true">
    <v-icon start>mdi-plus</v-icon>
    Add Bill
  </v-btn>

  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-form @submit.prevent="submit">
        <v-card-title>Add Bill</v-card-title>
        <v-card-text class="pt-0">
          <v-text-field v-model="name" label="Name" density="compact" required />
          <v-text-field v-model="description" label="Description" density="compact" />
          <div class="d-flex">
            <v-text-field
              v-model.number="amount"
              :label="'Amount ' + (currency === 'USD' ? 'USD' : 'ARS')"
              type="number"
              density="compact"
              class="flex-grow-1 mr-2"
              required
            />
            <v-select
              v-model="currency"
              :items="['ARS', 'USD']"
              label="Currency"
              density="compact"
              style="min-width: 100px"
            />
          </div>
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
          <v-select
            v-model="recurrence"
            :items="recurrenceOptions"
            label="Recurrence"
            density="compact"
          />
          <v-switch
            v-if="category === 'subscriptions'"
            v-model="autoRenew"
            label="Auto Renew"
          />
          <v-alert v-if="error" type="error" dense class="mt-2">{{ error }}</v-alert>
        </v-card-text>
        <v-card-actions class="pt-0">
          <v-spacer />
          <v-btn text @click="close">Cancel</v-btn>
          <v-btn type="submit" :loading="loading" color="primary">Add</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import api from '../api.js';

const emit = defineEmits(['added', 'notify']);

const name = ref('');
const description = ref('');
const amount = ref(0);
const currency = ref('ARS');
const dueDate = ref('');
const menu = ref(false);
const providers = [
  'Visa',
  'Mastercard',
  'MercadoPago',
  'Google Play',
  'MODO',
  'PayPal'
];
const paymentProvider = ref(providers[0]);
const categories = ['utilities', 'subscriptions', 'taxes', 'others'];
const category = ref('utilities');
const recurrenceOptions = ['none', 'weekly', 'monthly', 'bimonthly', 'yearly'];
const recurrence = ref('none');
const autoRenew = ref(false);
const loading = ref(false);
const error = ref(null);
const dialog = ref(false);

function close() {
  dialog.value = false;
  resetForm();
}

function resetForm() {
  name.value = '';
  description.value = '';
  amount.value = 0;
  currency.value = 'ARS';
  dueDate.value = '';
  paymentProvider.value = providers[0];
  category.value = 'utilities';
  recurrence.value = 'none';
  autoRenew.value = false;
  error.value = null;
}

const submit = async () => {
  loading.value = true;
  try {
    const due = new Date(dueDate.value);
    const bill = {
      name: name.value,
      description: description.value,
      amount: Number(amount.value),
      currency: currency.value,
      dueDate: due.toISOString(),
      paymentProvider: paymentProvider.value,
      category: category.value,
      recurrence: recurrence.value,
      autoRenew: category.value === 'subscriptions' ? autoRenew.value : false,
    };

    await api.post('/bills', bill);
    emit('notify', `Bill added: ${name.value} (${currency.value} ${amount.value})`);
    emit('added');
    close();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>
