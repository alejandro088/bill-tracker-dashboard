<template>
  <v-row class="mb-4" dense>
    <v-col cols="12" md="4">
      <v-card class="summary-card paid" elevation="2">
        <div class="icon-box green">
          <v-icon size="32">mdi-cash-check</v-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">Pagadas</div>
          <div class="summary-value">{{ summary.paid.toFixed(2) }}</div>
          <div class="summary-caption">Últimos 30 días</div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" md="4">
      <v-card class="summary-card pending" elevation="2">
        <div class="icon-box orange">
          <v-icon size="32">mdi-timer-sand</v-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">Pendientes</div>
          <div class="summary-value">{{ summary.pending.toFixed(2) }}</div>
          <div class="summary-caption">Próximos vencimientos</div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" md="4">
      <v-card class="summary-card overdue" elevation="2">
        <div class="icon-box red">
          <v-icon size="32">mdi-alert-circle</v-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">Vencidas</div>
          <div class="summary-value">{{ summary.overdue.toFixed(2) }}</div>
          <div class="summary-caption">Facturas atrasadas</div>
        </div>
      </v-card>
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
import { ref, onMounted } from 'vue';
import api from '../api.js';

const summary = ref({ paid: 0, pending: 0, overdue: 0 });
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
.summary-card {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  min-height: 110px;
  position: relative;
}
.icon-box {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-right: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.icon-box.green {
  background: #43a047;
  color: #fff;
}
.icon-box.orange {
  background: #fb8c00;
  color: #fff;
}
.icon-box.red {
  background: #e53935;
  color: #fff;
}
.summary-content {
  flex: 1;
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


