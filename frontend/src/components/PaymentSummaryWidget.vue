<template>
  <v-row class="mb-4" dense>
    <v-col cols="12" md="3">
      <div class="summary-card-style">
        <div class="icon-float blue">
          <v-icon size="32">mdi-cash-multiple</v-icon>
        </div>
        <div class="summary-content-style">
          <div class="summary-label">Total Pagado</div>
          <div class="summary-value">{{ summary.totalPaid.toFixed(2) }}</div>
          <div class="summary-caption">Período actual</div>
        </div>
      </div>
    </v-col>
    <v-col cols="12" md="3">
      <div class="summary-card-style">
        <div class="icon-float purple">
          <v-icon size="32">mdi-calendar-month</v-icon>
        </div>
        <div class="summary-content-style">
          <div class="summary-label">Promedio Mensual</div>
          <div class="summary-value">{{ summary.monthlyAverage.toFixed(2) }}</div>
          <div class="summary-caption">Por mes</div>
        </div>
      </div>
    </v-col>
    <v-col cols="12" md="3">
      <div class="summary-card-style">
        <div class="icon-float" :class="comparisonColor">
          <v-icon size="32">{{ comparisonIcon }}</v-icon>
        </div>
        <div class="summary-content-style">
          <div class="summary-label">Comparación</div>
          <div class="summary-value">{{ summary.previousPeriodComparison.toFixed(2) }}%</div>
          <div class="summary-caption">vs período anterior</div>
        </div>
      </div>
    </v-col>
    <v-col cols="12" md="3">
      <div class="summary-card-style">
        <div class="icon-float teal">
          <v-icon size="32">mdi-credit-card</v-icon>
        </div>
        <div class="summary-content-style">
          <div class="summary-label">Método Preferido</div>
          <div class="summary-value">{{ summary.mostUsedProvider }}</div>
          <div class="summary-caption">Más utilizado</div>
        </div>
      </div>
    </v-col>
    <v-col cols="12" v-if="loading">
      <v-progress-linear indeterminate />
    </v-col>
    <v-col cols="12" v-else-if="error">
      <v-alert type="error" dense>{{ error }}</v-alert>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '../api.js';

const props = defineProps({
  startDate: String,
  endDate: String
});

const summary = ref({
  totalPaid: 0,
  monthlyAverage: 0,
  mostUsedProvider: 'None',
  previousPeriodComparison: 0,
  paymentCount: 0
});
const loading = ref(false);
const error = ref(null);

const comparisonColor = computed(() => {
  const value = summary.value.previousPeriodComparison;
  if (value > 0) return 'green';
  if (value < 0) return 'red';
  return 'orange';
});

const comparisonIcon = computed(() => {
  const value = summary.value.previousPeriodComparison;
  if (value > 0) return 'mdi-arrow-up-bold';
  if (value < 0) return 'mdi-arrow-down-bold';
  return 'mdi-equal';
});

const fetchSummary = async () => {
  loading.value = true;
  try {
    const params = {};
    if (props.startDate) params.startDate = props.startDate;
    if (props.endDate) params.endDate = props.endDate;
    
    const { data } = await api.get('/payments/summary', { params });
    summary.value = data;
    error.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchSummary);

watch(() => [props.startDate, props.endDate], fetchSummary);
</script>

<style scoped>
.summary-card-style {
  position: relative;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 28px 24px 18px 24px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  transition: box-shadow 0.2s;
  border: 1px solid #eee;
}
.icon-float {
  position: absolute;
  top: -22px;
  left: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  z-index: 2;
}
.icon-float.blue {
  background: #1976d2;
  color: #fff;
}
.icon-float.purple {
  background: #9c27b0;
  color: #fff;
}
.icon-float.green {
  background: #43a047;
  color: #fff;
}
.icon-float.orange {
  background: #fb8c00;
  color: #fff;
}
.icon-float.red {
  background: #e53935;
  color: #fff;
}
.icon-float.teal {
  background: #00897b;
  color: #fff;
}
.summary-content-style {
  width: 100%;
  margin-top: 18px;
  text-align: right;
}
.summary-label {
  font-size: 1.1rem;
  color: #888;
  font-weight: 500;
}
.summary-value {
  font-size: 2rem;
  font-weight: bold;
  color: #222d32;
  margin-bottom: 2px;
}
.summary-caption {
  font-size: 0.95rem;
  color: #aaa;
}
</style>
