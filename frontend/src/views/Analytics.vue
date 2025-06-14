<template>
  <v-container>
    <v-card class="mb-4">
      <v-card-title class="header-card pa-4">
        <div>
          <h2 class="text-h5 font-weight-medium mb-1 text-white">Análisis de gastos</h2>
          <div class="text-subtitle-2 text-white text-opacity-75">
            Resumen gráfico de gastos por categoría y período
          </div>
        </div>
      </v-card-title>
    </v-card>
    <v-card class="mb-4 pa-4">
      <canvas id="categoryChart"></canvas>
    </v-card>
    <v-card class="pa-4">
      <canvas id="monthChart"></canvas>
    </v-card>
  </v-container>
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
.header-card {
  background: linear-gradient(135deg, #ff9f43 0%, #ff7b1e 100%) !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-card :deep(.v-btn) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.header-card :deep(.v-btn:hover) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}
</style>


