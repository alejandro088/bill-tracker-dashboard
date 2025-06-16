<template>
  <v-row class="mb-4" dense>
    <v-col cols="12" md="4">
      <base-card type="success">
        <template #icon>
          <v-icon size="large">mdi-cash-check</v-icon>
        </template>
        <template #title>Pagadas</template>
        <template #value>
          <div class="d-flex align-center">
            <span class="currency">$</span>
            <span class="amount">{{ formatAmount(summary.paid) }}</span>
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
            <span class="currency">$</span>
            <span class="amount">{{ formatAmount(summary.pending) }}</span>
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
            <span class="currency">$</span>
            <span class="amount">{{ formatAmount(summary.overdue) }}</span>
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

const summary = ref({ paid: 0, pending: 0, overdue: 0 });
const loading = ref(false);
const error = ref(null);

const formatAmount = (amount) => {
  return amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

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


