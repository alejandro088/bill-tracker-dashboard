<template>
  <div>
    <h2>Analytics</h2>
    <canvas id="categoryChart" width="400" height="200"></canvas>
    <canvas id="monthChart" width="400" height="200"></canvas>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Chart from 'chart.js/auto';
import api from '../api.js';

const buildCharts = async () => {
  const { data } = await api.get('/bills', { params: { status: 'paid', limit: 1000 } });
  const bills = data.data;

  const byCategory = {};
  const byMonth = {};

  bills.forEach((b) => {
    byCategory[b.category] = (byCategory[b.category] || 0) + b.amount;
    const month = new Date(b.dueDate).getMonth() + 1;
    byMonth[month] = (byMonth[month] || 0) + b.amount;
  });

  new Chart(document.getElementById('categoryChart'), {
    type: 'pie',
    data: {
      labels: Object.keys(byCategory),
      datasets: [{ data: Object.values(byCategory) }]
    }
  });

  new Chart(document.getElementById('monthChart'), {
    type: 'bar',
    data: {
      labels: Object.keys(byMonth),
      datasets: [{ data: Object.values(byMonth) }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
};

onMounted(buildCharts);
</script>

<style scoped>
canvas {
  max-width: 400px;
  margin-bottom: 20px;
}
</style>
