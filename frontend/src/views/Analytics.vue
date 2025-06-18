<template>
  <v-container>
    <v-card class="mb-4">
      <v-card-title class="header-card pa-4">
        <div class="d-flex justify-space-between align-center w-100">
          <div>
            <h2 class="text-h5 font-weight-medium mb-1 text-white d-flex align-center">
              <v-icon icon="mdi-chart-box" class="mr-2" color="white" />
              Análisis de gastos
            </h2>
            <div class="text-subtitle-2 text-white text-opacity-75">
              Resumen gráfico de gastos por categoría y período
            </div>
          </div>
          <ExportButton
            :data="filteredPayments"
            filename="analisis-gastos"
            label="Exportar datos"
          />
        </div>
      </v-card-title>
    </v-card>

    <!-- Filtros -->
    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-select
          v-model="year"
          :items="availableYears"
          label="Año"
          density="compact"
          hide-details
          class="mb-2"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="currency"
          :items="['Todas', 'ARS', 'USD']"
          label="Moneda"
          density="compact"
          hide-details
          class="mb-2"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="category"
          :items="['Todas', ...categoryOptions]"
          label="Categoría"
          density="compact"
          hide-details
          class="mb-2"
        />
      </v-col>
    </v-row>

    <!-- Cards de Resumen -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <base-card type="default">
          <template #icon>
            <v-icon size="large">mdi-cash-multiple</v-icon>
          </template>
          <template #title>Total Pagado</template>
          <template #value>
            <div class="d-flex align-center">
              <span class="currency">$</span>
              <span class="amount">{{ formatAmount(totalPaid) }}</span>
            </div>
          </template>
          <template #footer>
            <div class="d-flex align-center">
              <v-icon size="small" :color="totalTrend > 0 ? 'success' : 'error'" class="me-1">
                {{ totalTrend > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
              </v-icon>
              {{ Math.abs(totalTrend) }}% vs período anterior
            </div>
          </template>
        </base-card>
      </v-col>

      <v-col cols="12" md="3">
        <base-card type="default">
          <template #icon>
            <v-icon size="large">mdi-chart-line</v-icon>
          </template>
          <template #title>Promedio Mensual</template>
          <template #value>
            <div class="d-flex align-center">
              <span class="currency">$</span>
              <span class="amount">{{ formatAmount(monthlyAverage) }}</span>
            </div>
          </template>
          <template #footer>
            <div class="d-flex align-center">
              <v-icon size="small" class="me-1">mdi-calendar</v-icon>
              Por mes
            </div>
          </template>
        </base-card>
      </v-col>

      <v-col cols="12" md="3">
        <base-card type="warning">
          <template #icon>
            <v-icon size="large">mdi-bank</v-icon>
          </template>
          <template #title>Mayor Gasto</template>
          <template #value>
            <div class="d-flex align-center">
              <span class="currency">$</span>
              <span class="amount">{{ formatAmount(highestExpense) }}</span>
            </div>
          </template>
          <template #footer>
            <div class="d-flex align-center text-caption">
              <v-icon size="small" class="me-1">mdi-tag</v-icon>
              {{ highestExpenseCategory }}
            </div>
          </template>
        </base-card>
      </v-col>

      <v-col cols="12" md="3">
        <base-card :type="savingsRateType">
          <template #icon>
            <v-icon size="large">mdi-trending-up</v-icon>
          </template>
          <template #title>Tasa de Ahorro</template>
          <template #value>
            <div class="d-flex align-center">
              <span class="amount">{{ savingsRate }}%</span>
            </div>
          </template>
          <template #footer>
            <div class="d-flex align-center">
              <v-icon size="small" class="me-1">mdi-piggy-bank</v-icon>
              {{ savingsRateLabel }}
            </div>
          </template>
        </base-card>
      </v-col>
    </v-row>

    <!-- Gráficos -->
    <v-row>
      <v-col cols="12" lg="8">
        <v-card class="mb-4">
          <v-card-title class="text-subtitle-1 font-weight-medium pa-4 pb-0">
            Tendencia de Gastos
          </v-card-title>
          <div class="pa-4">
            <canvas ref="monthChart"></canvas>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="mb-4">
          <v-card-title class="text-subtitle-1 font-weight-medium pa-4 pb-0">
            Distribución por Categoría
          </v-card-title>
          <div class="pa-4">
            <canvas ref="categoryChart"></canvas>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de Desglose -->
    <v-card class="mt-4">
      <v-card-title class="text-subtitle-1 font-weight-medium pa-4">
        Desglose de Gastos
      </v-card-title>
      <v-data-table
        :headers="tableHeaders"
        :items="expenseItems"
        :loading="loading"
        class="elevation-0"
      >
        <template #item.amount="{ item }">
          <v-chip
            :color="getCategoryColor(item.category)"
            size="small"
            variant="flat"
            class="font-weight-medium"
          >
            ${{ formatAmount(item.amount) }}
          </v-chip>
        </template>
        <template #item.percentage="{ item }">
          <v-progress-linear
            :model-value="item.percentage"
            :color="getCategoryColor(item.category)"
            height="20"
            rounded
          >
            <template #default>
              <span class="text-caption white--text">{{ item.percentage }}%</span>
            </template>
          </v-progress-linear>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Chart from 'chart.js/auto';
import BaseCard from '../components/BaseCard.vue';
import ExportButton from '../components/ExportButton.vue';
import api from '../api.js';

// Estado
const loading = ref(false);
const bills = ref([]);
const payments = ref([]);  // Agregamos el estado de payments
const year = ref(new Date().getFullYear());
const currency = ref('Todas');
const category = ref('Todas');
const monthChart = ref(null);
const categoryChart = ref(null);

let monthChartInstance = null;
let categoryChartInstance = null;

const categoryOptions = ['utilities', 'subscriptions', 'taxes', 'others'];
const availableYears = Array.from({ length: 5 }, (_, i) => year.value - i);

const categoryColors = {
  utilities: '#1976d2',
  subscriptions: '#9c27b0',
  taxes: '#e53935',
  others: '#fb8c00'
};

// Computed Properties
const filteredBills = computed(() => {
  return bills.value.filter(bill => {
    const billYear = new Date(bill.dueDate).getFullYear();
    const matchesYear = billYear === year.value;
    const matchesCurrency = currency.value === 'Todas' || bill.currency === currency.value;
    const matchesCategory = category.value === 'Todas' || bill.category === category.value;
    return matchesYear && matchesCurrency && matchesCategory;
  });
});

const filteredPayments = computed(() => {
  if (!payments.value) return []
  
  return payments.value.filter(payment => {
    // Filtrar por año
    if (year.value && new Date(payment.date).getFullYear() !== year.value) {
      return false
    }
    // Filtrar por moneda
    if (currency.value !== 'Todas' && payment.currency !== currency.value) {
      return false
    }
    // Filtrar por categoría
    if (category.value !== 'Todas' && payment.category !== category.value) {
      return false
    }
    return true
  })
})

const totalPaid = computed(() => {
  return filteredBills.value.reduce((sum, bill) => sum + bill.amount, 0);
});

const monthlyAverage = computed(() => {
  return totalPaid.value / 12;
});

const highestExpense = computed(() => {
  return Math.max(...filteredBills.value.map(bill => bill.amount));
});

const highestExpenseCategory = computed(() => {
  const bill = filteredBills.value.find(b => b.amount === highestExpense.value);
  return bill?.category || 'N/A';
});

const savingsRate = computed(() => {
  const totalIncome = 100000; // TODO: Obtener de la configuración
  return Math.round((1 - (totalPaid.value / totalIncome)) * 100);
});

const savingsRateType = computed(() => {
  if (savingsRate.value >= 30) return 'success';
  if (savingsRate.value >= 20) return 'warning';
  return 'error';
});

const savingsRateLabel = computed(() => {
  if (savingsRate.value >= 30) return 'Excelente';
  if (savingsRate.value >= 20) return 'Bueno';
  return 'Necesita mejorar';
});

const totalTrend = computed(() => {
  // Calcular tendencia vs mes anterior
  return 5; // TODO: Implementar cálculo real
});

const expenseItems = computed(() => {
  const grouped = {};
  filteredBills.value.forEach(bill => {
    if (!grouped[bill.category]) {
      grouped[bill.category] = { amount: 0, count: 0 };
    }
    grouped[bill.category].amount += bill.amount;
    grouped[bill.category].count++;
  });

  return Object.entries(grouped).map(([category, data]) => ({
    category,
    amount: data.amount,
    count: data.count,
    percentage: Math.round((data.amount / totalPaid.value) * 100)
  }));
});

const tableHeaders = [
  { title: 'Categoría', key: 'category', width: '200px' },
  { title: 'Cantidad', key: 'count', width: '100px' },
  { title: 'Monto Total', key: 'amount', width: '150px' },
  { title: '% del Total', key: 'percentage' }
];

// Methods
const formatAmount = (amount) => {
  return amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const getCategoryColor = (category) => {
  return categoryColors[category] || '#9e9e9e';
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [billsResponse, paymentsResponse] = await Promise.all([
      api.get('/bills', { 
        params: { 
          status: 'paid',
          limit: 1000,
          year: year.value
        }
      }),
      api.get('/payments', {
        params: {
          year: year.value
        }
      })
    ]);
    
    bills.value = billsResponse.data.data;
    payments.value = paymentsResponse.data.data;
    updateCharts();
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

const updateCharts = () => {
  if (monthChartInstance) monthChartInstance.destroy();
  if (categoryChartInstance) categoryChartInstance.destroy();

  const monthlyData = Array(12).fill(0);
  const categoryData = {};

  filteredBills.value.forEach(bill => {
    // Datos mensuales
    const month = new Date(bill.dueDate).getMonth();
    monthlyData[month] += bill.amount;

    // Datos por categoría
    if (!categoryData[bill.category]) categoryData[bill.category] = 0;
    categoryData[bill.category] += bill.amount;
  });

  // Gráfico de línea mensual
  monthChartInstance = new Chart(monthChart.value, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [{
        label: 'Gastos Mensuales',
        data: monthlyData,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
        fill: true
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
            label: (context) => `$${formatAmount(context.raw)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `$${formatAmount(value)}`
          }
        }
      }
    }
  });

  // Gráfico de torta por categoría
  categoryChartInstance = new Chart(categoryChart.value, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categoryData),
      datasets: [{
        data: Object.values(categoryData),
        backgroundColor: Object.keys(categoryData).map(cat => getCategoryColor(cat))
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const percentage = Math.round((context.raw / totalPaid.value) * 100);
              return `${context.label}: $${formatAmount(context.raw)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
};

// Watchers
watch([year, currency, category], fetchData);

// Lifecycle
onMounted(fetchData);
</script>

<style scoped>
.header-card {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%) !important;
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

.currency {
  font-size: 1rem;
  font-weight: 500;
  margin-right: 4px;
  opacity: 0.7;
}

.amount {
  font-size: 1.5rem;
  font-weight: 600;
}
</style>


