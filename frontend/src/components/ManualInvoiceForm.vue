<template>
  <v-dialog v-model="dialog" max-width="500" @update:modelValue="val => !val && close()">
    <v-card>
      <FormWrapper urlOnSubmit="/bills" v-slot="{ loading, generalError, fieldErrors, hasFieldErrors, submit }">
        <v-form @submit.prevent="handleSubmit(submit)">
          <v-card-title>Nueva factura</v-card-title>
          <v-card-text class="pt-0">
            <v-text-field
              v-model="name"
              label="Name"
              density="compact"
              :error-messages="fieldErrors('name')"
              :error="hasFieldErrors('name')"
            />
            <v-text-field
              v-model.number="amount"
              label="Amount"
              type="number"
              density="compact"
              required
              :error-messages="fieldErrors('amount')"
              :error="hasFieldErrors('amount')"
            />
            <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition">
              <template #activator="{ props }">
                <v-text-field
                  v-model="dueDate"
                  label="Due Date"
                  readonly
                  v-bind="props"
                  density="compact"
                  :error-messages="fieldErrors('dueDate')"
                  :error="hasFieldErrors('dueDate')"
                />
              </template>
              <v-date-picker v-model="dueDate" @update:modelValue="menu = false" />
            </v-menu>
            <v-alert v-if="generalError" type="error" dense class="mt-2">{{ generalError }}</v-alert>
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-spacer />
            <v-btn text @click="close">Cancel</v-btn>
            <v-btn type="submit" :loading="loading" color="primary">Save</v-btn>
          </v-card-actions>
        </v-form>
      </FormWrapper>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import FormWrapper from './FormWrapper.vue';

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

const handleSubmit = async (submit) => {
  const payload = {
    name: name.value,
    amount: amount.value,
    dueDate: dueDate.value,
    serviceId: serviceId.value,
    status: 'pending'
  };

  try {
    await submit(payload);
    emit('created');
    close();
  } catch (err) {
    // FormWrapper handles setting validation errors
  }
};
</script>
