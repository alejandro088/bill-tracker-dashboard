<template>
  <v-row class="mb-4" dense>
    <v-col cols="12" md="4">
      <div class="summary-card-style">
        <div class="icon-float green">
          <v-icon size="32">mdi-cash-check</v-icon>
        </div>
        <div class="summary-content-style">
          <div class="summary-label">Pagadas</div>
          <div class="summary-value">{{ summary.paid.toFixed(2) }}</div>
          <div class="summary-caption">Últimos 30 días</div>
        </div>
      </div>
    </v-col>
    <v-col cols="12" md="4">
      <div class="summary-card-style">
        <div class="icon-float orange">
          <v-icon size="32">mdi-timer-sand</v-icon>
        </div>
        <div class="summary-content-style">
          <div class="summary-label">Pendientes</div>
          <div class="summary-value">{{ summary.pending.toFixed(2) }}</div>
          <div class="summary-caption">Próximos vencimientos</div>
        </div>
      </div>
    </v-col>
    <v-col cols="12" md="4">
      <div class="summary-card-style">
        <div class="icon-float red">
          <v-icon size="32">mdi-alert-circle</v-icon>
        </div>
        <div class="summary-content-style">
          <div class="summary-label">Vencidas</div>
          <div class="summary-value">{{ summary.overdue.toFixed(2) }}</div>
          <div class="summary-caption">Facturas atrasadas</div>
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


