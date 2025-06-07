<template>
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
    <button type="submit" :disabled="loading">Add</button>
  </form>
  <div v-if="error" class="error">{{ error }}</div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const emit = defineEmits(['added']);

const name = ref('');
const description = ref('');
const amount = ref(0);
const dueDate = ref('');
const category = ref('utilities');
const loading = ref(false);
const error = ref(null);

const submit = async () => {
  loading.value = true;
  try {
    await axios.post('/bills', {
      name: name.value,
      description: description.value,
      amount: amount.value,
      dueDate: dueDate.value,
      category: category.value
    });
    name.value = '';
    description.value = '';
    amount.value = 0;
    dueDate.value = '';
    category.value = 'utilities';
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
