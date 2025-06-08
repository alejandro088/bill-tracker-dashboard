<template>
  <v-container>
    <h2>Resumen Mensual</h2>
    <v-select class="mb-4" v-model="year" :items="years" label="Año" density="compact" />
    <v-data-table :headers="headers" :items="summary" class="elevation-1 mb-4" hide-default-footer />
    <v-card class="pa-4">
      <canvas id="stacked" />
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import api from '../api.js';
import Chart from 'chart.js/auto';

const year = ref(new Date().getFullYear());
const years = Array.from({ length: 5 }, (_, i) => year.value - i);
const summary = ref([]);
let chart;

const headers = [
  { title: 'Mes', key: 'month' },
  { title: 'Estado', key: 'status' },
  { title: 'Total', key: 'total' },
  { title: 'Cantidad', key: 'count' }
];

async function fetchSummary() {
  const { data } = await api.get('/summary/monthly', { params: { year: year.value } });
  summary.value = data;
  buildChart();
}

function buildChart() {
  const months = [...new Set(summary.value.map(s => s.month))].sort();
  const statuses = [...new Set(summary.value.map(s => s.status))];
  const datasets = statuses.map(status => ({
    label: status,
    data: months.map(m => {
      const found = summary.value.find(s => s.month === m && s.status === status);
      return found ? found.total : 0;
    })
  }));
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById('stacked'), {
    type: 'bar',
    data: { labels: months, datasets },
    options: { scales: { x: { stacked: true }, y: { stacked: true } } }
  });
}

onMounted(fetchSummary);
watch(year, fetchSummary);
</script>
