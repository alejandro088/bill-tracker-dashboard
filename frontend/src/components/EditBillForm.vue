<template>
  <div class="edit-form">
    <form @submit.prevent="submit">
      <input v-model="name" placeholder="Name" required />
      <input v-model="description" placeholder="Description" />
      <input type="number" v-model.number="amount" placeholder="Amount" required />
      <input type="date" v-model="dueDate" required />
      <select v-model="category">
        <option value="utilities">Utilities</option>
        <option value="subscriptions">Subscriptions</option>
        <option value="taxes">Taxes</option>
        <option value="others">Others</option>
      </select>
      <select v-model="status">
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="overdue">Overdue</option>
      </select>
      <label v-if="category === 'subscriptions'">
        <input type="checkbox" v-model="autoRenew" /> Auto Renew
      </label>
      <button type="submit" :disabled="loading">Save</button>
      <button type="button" @click="emit('close')">Cancel</button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from '../api.js';

const props = defineProps({ bill: Object });
const emit = defineEmits(['updated', 'close']);

const name = ref('');
const description = ref('');
const amount = ref(0);
const dueDate = ref('');
const category = ref('utilities');
const status = ref('pending');
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
  autoRenew.value = b.autoRenew || false;
};

watch(
  () => props.bill,
  (b) => setFields(b),
  { immediate: true }
);

const submit = async () => {
  loading.value = true;
  try {
    await api.put(`/bills/${props.bill.id}`, {
      name: name.value,
      description: description.value,
      amount: amount.value,
      dueDate: dueDate.value,
      category: category.value,
      status: status.value,
      autoRenew: autoRenew.value
    });
    emit('updated');
    emit('close');
    error.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.edit-form {
  margin-top: 10px;
}
form {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
input,
select,
button {
  padding: 5px;
}
.error {
  color: red;
  margin-top: 5px;
}
</style>
