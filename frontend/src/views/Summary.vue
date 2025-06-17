<template>
  <v-container>
    <v-row align="center" class="mb-4">
      <v-col cols="12" sm="6">
        <h2 class="text-h4 mb-1">Resumen Mensual</h2>
        <span class="text-subtitle-1 text-grey">Análisis de facturación por mes</span>
      </v-col>
      <v-col cols="12" sm="6" class="d-flex justify-end align-center gap-4">
        <v-select
          v-model="year"
          :items="years"
          label="Año"
          density="comfortable"
          variant="outlined"
          hide-details
          class="year-select"
          style="max-width: 150px"
        />
        <v-btn
          prepend-icon="mdi-refresh"
          variant="text"
          @click="fetchSummary"
          :loading="loading"
        >
          Actualizar
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card>
          <MonthlySummaryTable
            :items="summary"
            @show-details="showMonthDetails"
          />
        </v-card>
      </v-col>
      
      <v-col cols="12" lg="4">
        <v-card class="pa-4">
          <div class="d-flex align-center mb-4">
            <h3 class="text-h6">Resumen Anual</h3>
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="viewMode" mandatory density="comfortable">
              <v-btn value="cards" variant="text">
                <v-icon>mdi-view-grid-outline</v-icon>
              </v-btn>
              <v-btn value="list" variant="text">
                <v-icon>mdi-view-list-outline</v-icon>
              </v-btn>
            </v-btn-toggle>
          </div>
          
          <div v-if="viewMode === 'cards'">
            <v-card
              v-for="stat in yearStats"
              :key="stat.currency"
              :color="stat.currency === 'USD' ? 'success' : 'info'"
              class="mb-2 pa-4"
              variant="outlined"
            >
              <div class="d-flex justify-space-between align-center">
                <div>
                  <span class="text-subtitle-2">Total en {{ stat.currency }}</span>
                  <div class="text-h5 font-weight-bold">
                    {{ formatAmount(stat.total, stat.currency) }}
                  </div>
                </div>
                <v-icon size="large">
                  {{ stat.currency === 'USD' ? 'mdi-currency-usd' : 'mdi-currency-ars' }}
                </v-icon>
              </div>
              <v-divider class="my-2"></v-divider>
              <div class="d-flex justify-space-between text-caption">
                <span>Facturas: {{ stat.count }}</span>
                <span>Promedio: {{ formatAmount(stat.total / stat.count, stat.currency) }}</span>
              </div>
            </v-card>
          </div>
          
          <v-list v-else density="compact">
            <v-list-item
              v-for="stat in yearStats"
              :key="stat.currency"
              :subtitle="`${stat.count} facturas - Promedio: ${formatAmount(stat.total / stat.count, stat.currency)}`"
            >
              <template v-slot:prepend>
                <v-icon :color="stat.currency === 'USD' ? 'success' : 'info'">
                  {{ stat.currency === 'USD' ? 'mdi-currency-usd' : 'mdi-currency-ars' }}
                </v-icon>
              </template>
              <v-list-item-title>
                {{ stat.currency }}: {{ formatAmount(stat.total, stat.currency) }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card class="mt-4 pa-4">
          <h3 class="text-h6 mb-4">Estado General</h3>
          <v-progress-linear
            v-for="stat in statusStats"
            :key="stat.status"
            :model-value="stat.percentage"
            :color="getStatusColor(stat.status)"
            height="20"
            rounded
            class="mb-2"
          >
            <template v-slot:default="{ value }">
              <span class="status-progress-label">
                {{ stat.status }}: {{ Math.ceil(value) }}% ({{ stat.count }})
              </span>
            </template>
          </v-progress-linear>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal de detalles del mes -->
    <v-dialog v-model="showDetailsDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          {{ selectedMonth ? formatMonth(selectedMonth) : '' }}
        </v-card-title>
        
        <v-card-text>
          <v-row>
            <v-col v-for="total in selectedMonthTotals" :key="total.currency" cols="6">
              <v-card :color="total.currency === 'USD' ? 'success' : 'info'" variant="outlined">
                <v-card-text>
                  <div class="text-subtitle-1 mb-1">Total {{ total.currency }}</div>
                  <div class="text-h5">{{ formatAmount(total.amount, total.currency) }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          
          <v-divider class="my-4"></v-divider>
          
          <h3 class="text-h6 mb-2">Distribución por Estado</h3>
          <canvas ref="monthDetailsChart"></canvas>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="showDetailsDialog = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import Chart from 'chart.js/auto';
import api from '../api.js';
import MonthlySummaryTable from '../components/MonthlySummaryTable.vue';

const year = ref(new Date().getFullYear());
const years = Array.from({ length: 5 }, (_, i) => year.value - i);
const summary = ref([]);
const loading = ref(false);
const chartType = ref('stacked');
const viewMode = ref('cards');
let chart;
let monthDetailsChartInstance;

// Variables para el modal de detalles
const showDetailsDialog = ref(false);
const selectedMonth = ref(null);

// Computed properties
const yearStats = computed(() => {
  const stats = {};
  summary.value.forEach(item => {
    const currency = item.currency || 'ARS';
    if (!stats[currency]) {
      stats[currency] = { currency, total: 0, count: 0 };
    }
    stats[currency].total += item.total;
    stats[currency].count += item.count;
  });
  return Object.values(stats);
});

const statusStats = computed(() => {
  const stats = {};
  let total = 0;
  
  summary.value.forEach(item => {
    if (!stats[item.status]) {
      stats[item.status] = { status: item.status, count: 0 };
    }
    stats[item.status].count += item.count;
    total += item.count;
  });
  
  return Object.values(stats).map(stat => ({
    ...stat,
    percentage: (stat.count / total) * 100
  }));
});

const selectedMonthTotals = computed(() => {
  if (!selectedMonth.value) return [];
  return getMonthTotals(selectedMonth.value);
});

// Methods
function formatMonth(month) {
  const [year, monthNum] = month.split('-');
  const date = new Date(year, monthNum - 1);
  return date.toLocaleString('es', { month: 'long', year: 'numeric' });
}

function formatAmount(amount, currency) {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case 'pagado':
      return 'success';
    case 'pendiente':
      return 'warning';
    case 'vencido':
      return 'error';
    default:
      return 'grey';
  }
}

function showMonthDetails(month) {
  selectedMonth.value = month;
  showDetailsDialog.value = true;
  buildMonthDetailsChart();
}

function getMonthTotals(month) {
  const monthItems = summary.value.filter(item => item.month === month);
  const totals = {};
  
  monthItems.forEach(item => {
    const currency = item.currency || 'ARS';
    if (!totals[currency]) {
      totals[currency] = 0;
    }
    totals[currency] += item.total;
  });

  return Object.entries(totals).map(([currency, amount]) => ({
    currency,
    amount
  }));
}

async function fetchSummary() {
  loading.value = true;
  try {
    const { data } = await api.get('/summary/monthly', { params: { year: year.value } });
    summary.value = data;
  } catch (error) {
    console.error('Error al obtener el resumen:', error);
  } finally {
    loading.value = false;
  }
  buildChart();
}

function buildChart() {
  const ctx = document.getElementById('summary-chart');
  const months = [...new Set(summary.value.map(s => s.month))].map(m => formatMonth(m));
  const currencies = [...new Set(summary.value.map(s => s.currency || 'ARS'))];
  
  const datasets = currencies.map(currency => {
    const data = months.map(month => {
      const monthData = summary.value.find(s => formatMonth(s.month) === month && s.currency === currency);
      return monthData ? monthData.total : 0;
    });

    return {
      label: currency,
      data,
      backgroundColor: currency === 'USD' ? '#4CAF50' : '#2196F3',
      borderColor: currency === 'USD' ? '#388E3C' : '#1976D2',
      borderWidth: 1
    };
  });

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets
    },
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: chartType.value === 'stacked'
        },
        y: {
          stacked: chartType.value === 'stacked',
          beginAtZero: true
        }
      }
    }
  });
}

function buildMonthDetailsChart() {
  const ctx = monthDetailsChartInstance?.canvas || document.querySelector('#month-details-chart');
  if (!ctx || !selectedMonth.value) return;

  const monthData = summary.value.filter(item => item.month === selectedMonth.value);
  const statusData = {};
  const currencies = [...new Set(monthData.map(item => item.currency || 'ARS'))];

  monthData.forEach(item => {
    if (!statusData[item.status]) {
      statusData[item.status] = {};
      currencies.forEach(curr => statusData[item.status][curr] = 0);
    }
    statusData[item.status][item.currency || 'ARS'] = item.total;
  });

  const datasets = currencies.map(currency => ({
    label: currency,
    data: Object.values(statusData).map(totals => totals[currency] || 0),
    backgroundColor: currency === 'USD' ? '#4CAF50' : '#2196F3'
  }));

  if (monthDetailsChartInstance) {
    monthDetailsChartInstance.destroy();
  }

  monthDetailsChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(statusData),
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Watchers
watch(chartType, buildChart);
watch(year, fetchSummary);

// Lifecycle
onMounted(fetchSummary);

</script>

<style scoped>
.status-progress-label {
  color: white;
  font-weight: 500;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}
</style>
