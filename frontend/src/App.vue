<template>
  <div class="container">
    <h1>Bill Tracker Dashboard</h1>
    <SummaryWidget />
    <BillForm @added="refresh" />
    <BillTable :key="refreshKey" />
  </div>
</template>

<script setup>
import BillTable from './components/BillTable.vue';
import BillForm from './components/BillForm.vue';
import SummaryWidget from './components/SummaryWidget.vue';
import { ref } from 'vue';

const refreshKey = ref(0);

function refresh() {
  refreshKey.value++;
}
</script>

<style>
.container {
  max-width: 900px;
  margin: auto;
  padding: 20px;
  font-family: Arial, Helvetica, sans-serif;
}
</style>
