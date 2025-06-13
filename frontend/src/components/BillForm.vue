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
}

const submit = async () => {
  loading.value = true;
  try {
    const due = new Date(dueDate.value);
    if (isNaN(due)) throw new Error('Invalid due date');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (due < today) throw new Error('Due date cannot be in the past');
    await api.post('/bills', {
      name: name.value,
      description: description.value,
      amount: amount.value,
      dueDate: due.toISOString(),
      paymentProvider: paymentProvider.value,
      category: category.value,
      autoRenew: autoRenew.value,
      recurrence: recurrence.value
    });
    name.value = '';
    description.value = '';
    amount.value = 0;
    dueDate.value = '';
    paymentProvider.value = providers[0];
    category.value = 'utilities';
    recurrence.value = 'none';
    autoRenew.value = false;
    emit('added');
    emit('notify', 'Bill added');
    error.value = null;
    close();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>
