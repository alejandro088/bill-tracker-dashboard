<template>
  <v-dialog v-model="dialog" max-width="500" @update:modelValue="val => !val && close()">
    <v-card>
      <v-form @submit.prevent="submit">
        <v-card-title>Nueva factura</v-card-title>
        <v-card-text class="pt-0">
          <v-text-field v-model="name" label="Name" density="compact" />
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
const serviceId = ref('');
const amount = ref(0);
const dueDate = ref('');
// Status is managed via payment actions; do not allow editing here
const loading = ref(false);
const error = ref(null);

watch(
  () => props.bill,
  (b) => {
    if (b) {
      name.value = b.name;
      paymentProvider.value = b.paymentProvider || '';
      serviceId.value = b.serviceId || '';
      amount.value = b.amount || 0;
      dueDate.value = (b.dueDate || '').substring(0, 10);
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
      amount: amount.value,
      dueDate: dueDate.value,
      serviceId: serviceId.value,
      status: 'pending'
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
