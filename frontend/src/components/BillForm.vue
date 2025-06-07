<template>
  <form @submit.prevent="submit">
    <input v-model="name" placeholder="Name" required />
    <input v-model="description" placeholder="Description" />
    <input type="number" v-model.number="amount" placeholder="Amount" required />
    <input type="date" v-model="dueDate" required />
    <select v-model="paymentProvider">
      <option disabled value="">Payment Provider</option>
      <option v-for="p in providers" :key="p" :value="p">{{ p }}</option>
    </select>
    <select v-model="category">
      <option value="utilities">Utilities</option>
      <option value="subscriptions">Subscriptions</option>
      <option value="taxes">Taxes</option>
      <option value="others">Others</option>
    </select>
    <label v-if="category === 'subscriptions'">
      <input type="checkbox" v-model="autoRenew" /> Auto Renew
    </label>
    <button type="submit" :disabled="loading">Add</button>
  </form>
  <div v-if="error" class="error">{{ error }}</div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../api.js';

const emit = defineEmits(['added']);

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
const paymentProvider = ref(providers[0]);
const category = ref('utilities');
const autoRenew = ref(false);
const loading = ref(false);
const error = ref(null);

const submit = async () => {
  loading.value = true;
  try {
    await api.post('/bills', {
      name: name.value,
      description: description.value,
      amount: amount.value,
      dueDate: dueDate.value,
      paymentProvider: paymentProvider.value,
      category: category.value,
      autoRenew: autoRenew.value
    });
    name.value = '';
    description.value = '';
    amount.value = 0;
    dueDate.value = '';
    paymentProvider.value = providers[0];
    category.value = 'utilities';
    autoRenew.value = false;
    emit('added');
    error.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
form {
  margin-bottom: 20px;
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
