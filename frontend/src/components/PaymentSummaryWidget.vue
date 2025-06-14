<template>
  <v-row class="mb-4" dense>
    <v-col cols="12" md="3">
      <base-card type="default">
        <template #icon>
          <v-icon size="large" class="text-primary">mdi-cash-multiple</v-icon>
        </template>
        <template #title>Total Pagado</template>
        <template #value>
          <div class="d-flex align-center">
            <span class="currency">$</span>
            <span class="amount">{{ formatAmount(summary.totalPaid) }}</span>
          </div>
        </template>
        <template #footer>
          <div class="d-flex align-center">
            <v-icon size="small" class="me-1">mdi-calendar</v-icon>
            Período actual
          </div>
        </template>
      </base-card>
    </v-col>

    <v-col cols="12" md="3">
      <base-card type="default">
        <template #icon>
          <v-icon size="large" class="text-secondary">mdi-calendar-month</v-icon>
        </template>
        <template #title>Promedio Mensual</template>
        <template #value>
          <div class="d-flex align-center">
            <span class="currency">$</span>
            <span class="amount">{{ formatAmount(summary.monthlyAverage) }}</span>
          </div>
        </template>
        <template #footer>
          <div class="d-flex align-center">
            <v-icon size="small" class="me-1">mdi-chart-timeline-variant</v-icon>
            Por mes
          </div>
        </template>
      </base-card>
    </v-col>

    <v-col cols="12" md="3">
      <base-card :type="comparisonType">
        <template #icon>
          <v-icon size="large">{{ comparisonIcon }}</v-icon>
        </template>
        <template #title>Comparación</template>
        <template #value>
          <div class="d-flex align-center">
            <span class="amount">{{ summary.previousPeriodComparison.toFixed(2) }}%</span>
          </div>
        </template>
        <template #footer>
          <div class="d-flex align-center">
            <v-icon size="small" class="me-1">mdi-calendar-compare</v-icon>
            vs período anterior
          </div>
        </template>
      </base-card>
    </v-col>

    <v-col cols="12" md="3">
      <base-card type="default">
        <template #icon>
          <v-icon size="large" class="text-info">mdi-credit-card</v-icon>
        </template>
        <template #title>Método Preferido</template>
        <template #value>
          <div class="provider-value">{{ summary.mostUsedProvider }}</div>
        </template>
        <template #footer>
          <div class="d-flex align-center">
            <v-icon size="small" class="me-1">mdi-check-decagram</v-icon>
            Más utilizado
          </div>
        </template>
      </base-card>
    </v-col>

    <v-col cols="12" v-if="loading">
      <v-progress-linear indeterminate color="primary" />
    </v-col>
    <v-col cols="12" v-else-if="error">
      <v-alert type="error" density="compact" variant="tonal">
        {{ error }}
      </v-alert>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import BaseCard from './BaseCard.vue';
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

const comparisonType = computed(() => {
  const value = summary.value.previousPeriodComparison;
  if (value > 0) return 'success';
  if (value < 0) return 'danger';
  return 'warning';
});

const comparisonIcon = computed(() => {
  const value = summary.value.previousPeriodComparison;
  if (value > 0) return 'mdi-arrow-up-bold';
  if (value < 0) return 'mdi-arrow-down-bold';
  return 'mdi-equal';
});

const formatAmount = (amount) => {
  return amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

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

// Watch for date changes
watch(() => [props.startDate, props.endDate], () => {
  fetchSummary();
});
</script>

<style scoped>
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

.provider-value {
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.2;
}

:deep(.card-value) {
  margin: 8px 0;
}

.text-primary {
  color: var(--v-primary-base);
}

.text-secondary {
  color: var(--v-secondary-base);
}

.text-info {
  color: var(--v-info-base);
}
</style>
