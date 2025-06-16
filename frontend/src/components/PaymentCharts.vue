<template>
  <div>
    <v-card class="mb-4 pa-4">
      <h3 class="text-h6 mb-2">Tendencia de Pagos</h3>
      <canvas ref="timelineChart"></canvas>
    </v-card>
    
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <h3 class="text-h6 mb-2">Distribución por Categoría</h3>
          <canvas ref="categoryChart"></canvas>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <h3 class="text-h6 mb-2">Métodos de Pago</h3>
          <canvas ref="providerChart"></canvas>
        </v-card>
      </v-col>
    </v-row>
    
    <v-progress-linear v-if="loading" indeterminate class="mt-4" />
    <v-alert v-else-if="error" type="error" dense class="mt-4">{{ error }}</v-alert>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import api from '../api.js';

const props = defineProps({
  startDate: String,
  endDate: String
});

const timelineChart = ref(null);
const categoryChart = ref(null);
const providerChart = ref(null);
const loading = ref(false);
const error = ref(null);

// Chart instances
let timelineChartInstance = null;
let categoryChartInstance = null;
let providerChartInstance = null;

const fetchChartData = async () => {
  loading.value = true;
  try {
    const params = {};
    if (props.startDate) params.startDate = props.startDate;
    if (props.endDate) params.endDate = props.endDate;
    
    const { data } = await api.get('/payments/trends', { params });
    
    // Destroy previous chart instances if they exist
    if (timelineChartInstance) timelineChartInstance.destroy();
    if (categoryChartInstance) categoryChartInstance.destroy();
    if (providerChartInstance) providerChartInstance.destroy();
    
    // Create timeline chart
    timelineChartInstance = new Chart(timelineChart.value, {
      type: 'line',
      data: {
        labels: formatMonthLabels(data.timeline.labels),
        datasets: [{
          label: 'Monto Total',
          data: data.timeline.data,
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `$${context.raw.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(2);
              }
            }
          }
        }
      }
    });
    
    // Create category chart
    categoryChartInstance = new Chart(categoryChart.value, {
      type: 'doughnut',
      data: {
        labels: data.categories.labels,
        datasets: [{
          data: data.categories.data,
          backgroundColor: [
            '#1976d2', // blue
            '#9c27b0', // purple
            '#43a047', // green
            '#fb8c00', // orange
            '#e53935', // red
            '#00897b', // teal
            '#3949ab', // indigo
            '#8e24aa', // deep purple
            '#d81b60', // pink
            '#00acc1'  // cyan
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    
    // Create provider chart
    providerChartInstance = new Chart(providerChart.value, {
      type: 'bar',
      data: {
        labels: data.providers.labels,
        datasets: [{
          label: 'Monto Total',
          data: data.providers.data,
          backgroundColor: '#9c27b0'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `$${context.raw.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(2);
              }
            }
          }
        }
      }
    });
    
    error.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Format month labels from YYYY-MM to readable format
const formatMonthLabels = (labels) => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return labels.map(label => {
    const [year, month] = label.split('-');
    return `${months[parseInt(month) - 1]} ${year}`;
  });
};

onMounted(fetchChartData);

watch(() => [props.startDate, props.endDate], fetchChartData);
</script>
