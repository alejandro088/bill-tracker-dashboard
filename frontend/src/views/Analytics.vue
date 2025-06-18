<template>
  <v-container>
    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      title="Error"
      :text="error"
      class="mb-4"
      closable
      @click:close="error = null"
    />

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
            <div class="d-flex flex-column gap-1">
              <div class="d-flex align-center">
                <span class="amount">{{ formatAmount(totalPaid.ARS, 'ARS') }}</span>
              </div>
              <div class="d-flex align-center">
                <span class="amount">{{ formatAmount(totalPaid.USD, 'USD') }}</span>
              </div>
            </div>
          </template>
          <template #footer>
            <div class="d-flex align-center">
              <v-icon size="small" :color="totalTrend > 0 ? 'error' : 'success'" class="me-1">
                {{ totalTrend > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
              </v-icon>
              {{ Math.abs(totalTrend) }}% vs mes anterior
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
            <div class="d-flex flex-column gap-1">
              <div class="d-flex align-center">
                {{ formatAmount(monthlyAverage.ARS, 'ARS') }}
              </div>
              <div class="d-flex align-center">
                {{ formatAmount(monthlyAverage.USD, 'USD') }}
              </div>
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
              {{ formatAmount(highestExpense.amount, highestExpense.currency) }}
            </div>
          </template>
          <template #footer>
            <div class="d-flex align-center text-caption">
              <v-icon size="small" class="me-1">mdi-tag</v-icon>
              {{ highestExpense.category }}
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
import { ref, onMounted, watch, computed } from 'vue'
import Chart from 'chart.js/auto'
import BaseCard from '../components/BaseCard.vue'
import ExportButton from '../components/ExportButton.vue'
import { useAnalytics } from '../composables/useAnalytics'

const {
  loading,
  error,
  year,
  currency,
  category,
  filteredBills,
  filteredPayments,
  totalPaid,
  monthlyAverage,
  highestExpense,
  expensesByCategory,
  fetchData,
  formatAmount,
  getCategoryColor,
  initFromCache
} = useAnalytics()

console.log('filteredPayments', filteredPayments.value)

const monthChart = ref(null)
const categoryChart = ref(null)
let monthChartInstance = null
let categoryChartInstance = null

const categoryOptions = ['utilities', 'subscriptions', 'taxes', 'others']
const availableYears = Array.from({ length: 5 }, (_, i) => year.value - i)

// Computed para la interfaz
const savingsRate = computed(() => {
  const totalInARS = totalPaid.value.ARS + (totalPaid.value.USD * 850) // TODO: Obtener tasa de conversión real
  const totalIncome = 100000 // TODO: Obtener de la configuración
  return Math.round((1 - (totalInARS / totalIncome)) * 100)
})

const savingsRateType = computed(() => {
  if (savingsRate.value >= 30) return 'success'
  if (savingsRate.value >= 20) return 'warning'
  return 'error'
})

const savingsRateLabel = computed(() => {
  if (savingsRate.value >= 30) return 'Excelente'
  if (savingsRate.value >= 20) return 'Bueno'
  return 'Necesita mejorar'
})

const totalTrend = computed(() => {
  // Calcular la tendencia como el cambio porcentual en el total de gastos
  // entre el mes actual y el mes anterior
  const currentMonth = new Date().getMonth()
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1

  let currentMonthTotal = { ARS: 0, USD: 0 }
  let previousMonthTotal = { ARS: 0, USD: 0 }

  filteredBills.value.forEach(bill => {
    const billMonth = new Date(bill.dueDate).getMonth()
    if (billMonth === currentMonth) {
      currentMonthTotal[bill.currency] += bill.amount
    } else if (billMonth === previousMonth) {
      previousMonthTotal[bill.currency] += bill.amount
    }
  })

  // Convertir todo a ARS para el cálculo (usando una tasa fija por ahora)
  const currentTotalARS = currentMonthTotal.ARS + (currentMonthTotal.USD * 850)
  const previousTotalARS = previousMonthTotal.ARS + (previousMonthTotal.USD * 850)

  if (previousTotalARS === 0) return 0

  return Math.round(((currentTotalARS - previousTotalARS) / previousTotalARS) * 100)
})

const tableHeaders = [
  { title: 'Categoría', key: 'category', width: '200px' },
  { title: 'Cantidad', key: 'count', width: '100px' },
  { title: 'ARS', key: 'amountARS', width: '150px' },
  { title: 'USD', key: 'amountUSD', width: '150px' },
  { title: '% del Total', key: 'percentage' }
]

const expenseItems = computed(() => {
  const items = []
  const totalARS = totalPaid.value.ARS
  const totalUSD = totalPaid.value.USD

  Object.entries(expensesByCategory.value).forEach(([category, data]) => {
    items.push({
      category,
      count: data.count,
      amountARS: formatAmount(data.ARS, 'ARS'),
      amountUSD: formatAmount(data.USD, 'USD'),
      percentage: Math.round(((data.ARS / totalARS) + (data.USD / totalUSD)) * 50) // Promedio de porcentajes
    })
  })

  return items
})

const updateCharts = () => {
  if (monthChartInstance) monthChartInstance.destroy()
  if (categoryChartInstance) categoryChartInstance.destroy()

  const monthlyDataARS = Array(12).fill(0)
  const monthlyDataUSD = Array(12).fill(0)

  filteredBills.value.forEach(bill => {
    const month = new Date(bill.dueDate).getMonth()
    if (bill.currency === 'ARS') {
      monthlyDataARS[month] += bill.amount
    } else {
      monthlyDataUSD[month] += bill.amount
    }
  })

  // Gráfico de línea mensual
  monthChartInstance = new Chart(monthChart.value, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [
        {
          label: 'ARS',
          data: monthlyDataARS,
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'USD',
          data: monthlyDataUSD,
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const currency = context.dataset.label
              return `${currency} ${formatAmount(context.raw, currency)}`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => formatAmount(value, 'ARS')
          }
        }
      }
    }
  })

  // Gráfico de torta por categoría
  const categoryDataARS = {}
  const categoryDataUSD = {}

  Object.entries(expensesByCategory.value).forEach(([category, data]) => {
    categoryDataARS[category] = data.ARS
    categoryDataUSD[category] = data.USD
  })

  categoryChartInstance = new Chart(categoryChart.value, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categoryDataARS),
      datasets: [
        {
          label: 'ARS',
          data: Object.values(categoryDataARS),
          backgroundColor: Object.keys(categoryDataARS).map(cat => getCategoryColor(cat))
        },
        {
          label: 'USD',
          data: Object.values(categoryDataUSD),
          backgroundColor: Object.keys(categoryDataUSD).map(cat => getCategoryColor(cat))
        }
      ]
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
              const currency = context.dataset.label
              const total = currency === 'ARS' ? totalPaid.value.ARS : totalPaid.value.USD
              const percentage = Math.round((context.raw / total) * 100)
              return `${context.label}: ${formatAmount(context.raw, currency)} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

// Watchers
watch([year, currency, category], () => {
  fetchData().then(updateCharts)
})

// Lifecycle
onMounted(async () => {
  await fetchData()
  updateCharts()
})
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


