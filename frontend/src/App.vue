<template>
  <div class="container">
    <h1>Bill Tracker Dashboard</h1>
    <nav class="nav">
      <router-link to="/">Dashboard</router-link>
      <router-link to="/analytics">Analytics</router-link>
    </nav>
    <router-view @notify="showToast"></router-view>
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const toast = ref('');
let timer;

function showToast(msg) {
  toast.value = msg;
  clearTimeout(timer);
  timer = setTimeout(() => (toast.value = ''), 3000);
}
</script>

<style>
.container {
  max-width: 900px;
  margin: auto;
  padding: 20px;
  font-family: Arial, Helvetica, sans-serif;
}
.nav {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #333;
  color: #fff;
  padding: 10px 15px;
  border-radius: 4px;
}
</style>
