<template>
  <v-row class="mb-4" dense>
    <!-- ARS Summary -->
    <v-col cols="12">
      <div class="text-h6 mb-2">Pesos Argentinos (ARS)</div>
    </v-col>
    <v-col cols="12" md="4">
      <base-card type="success">
        <template #icon>
          <v-icon size="large">mdi-cash-check</v-icon>
        </template>
        <template #title>Pagadas</template>
        <template #value>
          <div class="d-flex align-center">
            {{ formatAmountWithCurrency(summary.ars.paid, 'ARS') }}
          </div>
        </template>
        <template #footer>
          <div class="d-flex align-center">
            <v-icon size="small" class="me-1">mdi-calendar-clock</v-icon>
            Últimos 30 días
          </div>
        </template>
      </base-card>
    </v-col>

    <v-col cols="12" md="4">
      <base-card type="warning">
        <template #icon>
          <v-icon size="large">mdi-timer-sand</v-icon>
        </template>
        <template #title>Pendientes</template>
        <template #value>
          <div class="d-flex align-center">
            {{ formatAmountWithCurrency(summary.ars.pending, 'ARS') }}
          </div>
        </template>
        <template #footer>
          <div class="d-flex align-center">
            <v-icon size="small" class="me-1">mdi-clock-alert</v-icon>
            Próximos vencimientos
          </div>
        </template>
      </base-card>
    </v-col>

    <v-col cols="12" md="4">
      <base-card type="danger">
        <template #icon>
          <v-icon size="large">mdi-alert-circle</v-icon>
        </template>
        <template #title>Vencidas</template>
        <template #value>
          <div class="d-flex align-center">
            {{ formatAmountWithCurrency(summary.ars.overdue, 'ARS') }}
          </div>
        </template>
        <template #footer>
          <div class="d-flex align-center">
            <v-icon size="small" class="me-1">mdi-alert</v-icon>
            Facturas atrasadas
          </div>
        </template>
      </base-card>
    </v-col>

    <!-- USD Summary -->
    <v-col cols="12">
      <div class="text-h6 mb-2">Dólares (USD)</div>
    </v-col>
    <v-col cols="12" md="4">
      <base-card type="success">
        <template #icon>
          <v-icon size="large">mdi-cash-check</v-icon>
        </template>
        <template #title>Pagadas</template>
        <template #value>
          <div class="d-flex align-center">
            {{ formatAmountWithCurrency(summary.usd.paid, 'USD') }}
          </div>
        </template>
        <template #footer>
          <div class="d-flex align-center">
            <v-icon size="small" class="me-1">mdi-calendar-clock</v-icon>
            Últimos 30 días
          </div>
        </template>
      </base-card>
    </v-col>

    <v-col cols="12" md="4">
      <base-card type="warning">
        <template #icon>
          <v-icon size="large">mdi-timer-sand</v-icon>
        </template>
        <template #title>Pendientes</template>
        <template #value>
          <div class="d-flex align-center">
            {{ formatAmountWithCurrency(summary.usd.pending, 'USD') }}
          </div>
        </template>
        <template #footer>
          <div class="d-flex align-center">
            <v-icon size="small" class="me-1">mdi-clock-alert</v-icon>
            Próximos vencimientos
          </div>
        </template>
      </base-card>
    </v-col>

    <v-col cols="12" md="4">
      <base-card type="danger">
        <template #icon>
          <v-icon size="large">mdi-alert-circle</v-icon>
        </template>
        <template #title>Vencidas</template>
        <template #value>
          <div class="d-flex align-center">
            {{ formatAmountWithCurrency(summary.usd.overdue, 'USD') }}
          </div>
        </template>
        <template #footer>
          <div class="d-flex align-center">
            <v-icon size="small" class="me-1">mdi-alert</v-icon>
            Facturas atrasadas
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
import { ref, onMounted } from 'vue';
import BaseCard from './BaseCard.vue';
import api from '../api.js';
import { formatAmountWithCurrency } from '../utils/formatters';

const summary = ref({
  ars: { paid: 0, pending: 0, overdue: 0 },
  usd: { paid: 0, pending: 0, overdue: 0 }
});
const loading = ref(false);
const error = ref(null);

const fetchSummary = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/bills/summary');
    summary.value = data;
    error.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchSummary);
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

:deep(.card-value) {
  margin: 8px 0;
}
</style>


