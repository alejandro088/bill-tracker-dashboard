<template>
  <v-dialog v-model="dialog" max-width="500" @update:modelValue="val => !val && close()">
    <v-card>
      <v-form @submit.prevent="submit">
        <v-card-title>Nueva factura</v-card-title>
        <v-card-text class="pt-0">
          <v-text-field
            v-model="name"
            label="Name"
            density="compact"
            :error-messages="validationErrors.name || []"
            :error="validationErrors.name && validationErrors.name.length > 0"
          />
          <v-text-field
            v-model.number="amount"
            label="Amount"
            type="number"
            density="compact"
            required
            :error-messages="validationErrors.amount || []"
            :error="validationErrors.amount && validationErrors.amount.length > 0"
          />
          <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition">
            <template #activator="{ props }">
              <v-text-field
                v-model="dueDate"
                label="Due Date"
                readonly
                v-bind="props"
                density="compact"
                :error-messages="validationErrors.dueDate || []"
                :error="validationErrors.dueDate && validationErrors.dueDate.length > 0"
              />
            </template>
            <v-date-picker v-model="dueDate" @update:modelValue="menu = false" />
          </v-menu>
        </v-card-text>
        <v-card-actions class="pt-0">
          <v-spacer />
          <v-btn text @click="close">Cancel</v-btn>
          <v-btn type="submit" :loading="loading" color="primary">Save</v-btn>
          <v-alert v-if="generalError" type="error" dense class="mt-2">{{ generalError }}</v-alert>
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
const generalError = ref(null);
const validationErrors = ref({});

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
    generalError.value = null;
    validationErrors.value = {};
    close();
  } catch (err) {
    // Handle backend validation errors
    generalError.value = null;
    validationErrors.value = {};
    if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
      const map = {};
      err.response.data.details.forEach(d => {
        if (d.field) {
          map[d.field] = map[d.field] || [];
          map[d.field].push(d.message);
        }
      });
      validationErrors.value = map;
      generalError.value = err.response.data.error || 'Datos de entrada inválidos';
    } else if (err.response?.data?.error) {
      generalError.value = err.response.data.error;
    } else {
      generalError.value = err.message;
    }
  } finally {
    loading.value = false;
  }
};
</script>
