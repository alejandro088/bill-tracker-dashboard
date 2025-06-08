<template>
  <v-dialog v-model="dialog" max-width="500" @update:modelValue="val => !val && close()">
    <v-card>
      <v-form @submit.prevent="submit">
        <v-card-title>\u2795 Nueva factura</v-card-title>
        <v-card-text class="pt-0">
          <v-text-field v-model="name" label="Name" density="compact" disabled />
          <v-text-field v-model="category" label="Category" density="compact" disabled />
          <v-text-field v-model="paymentProvider" label="Payment Provider" density="compact" disabled />
          <v-select
            v-model="recurrence"
            :items="recurrenceOptions"
            label="Recurrence"
            density="compact"
            disabled
          />
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
            v-model="status"
            :items="statusOptions"
            label="Status"
            density="compact"
          />
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
const emit = defineEmits(['created', 'close']);

const dialog = ref(false);
const menu = ref(false);

const name = ref('');
const category = ref('');
const paymentProvider = ref('');
const recurrenceOptions = ['none', 'weekly', 'monthly', 'bimonthly', 'yearly'];
const recurrence = ref('none');
const serviceId = ref('');
const amount = ref(0);
const dueDate = ref('');
const statusOptions = ['pending', 'paid', 'overdue'];
const status = ref('pending');
const loading = ref(false);
const error = ref(null);

watch(
  () => props.bill,
  (b) => {
    if (b) {
      name.value = b.name;
      category.value = b.category;
      paymentProvider.value = b.paymentProvider || '';
      recurrence.value = b.recurrence || 'none';
      serviceId.value = b.serviceId || '';
      amount.value = b.amount || 0;
      dueDate.value = (b.dueDate || '').substring(0, 10);
      status.value = b.status || 'pending';
      dialog.value = true;
    } else {
      dialog.value = false;
    }
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
    await api.post('/bills', {
      name: name.value,
      category: category.value,
      paymentProvider: paymentProvider.value,
      recurrence: recurrence.value,
      amount: amount.value,
      dueDate: dueDate.value,
      status: status.value,
      autoRenew: false,
      serviceId: serviceId.value
    });
    emit('created');
    error.value = null;
    close();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>
