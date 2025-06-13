<template>
  <v-container fluid class="dashboard-container">
    <v-row dense>
      <!-- Formulario para agregar factura -->
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4 mb-4 elevation-2">
          
        </v-card>
      </v-col>
      <!-- Espacio para futuras tarjetas o KPIs -->
      <v-col cols="12" lg="4">
        <v-card class="pa-4 mb-4 elevation-2 d-flex align-center justify-center" style="min-height:120px;">
          <span class="text-grey">(Espacio para KPIs o gráficas)</span>
        </v-card>
      </v-col>
    </v-row>
    <!-- Fila separada para el resumen -->
    <v-row class="mb-2">
      <v-col cols="12">
        <SummaryWidget />
      </v-col>
    </v-row>
    <v-row>
      <!-- Tabla de servicios -->
      <v-col cols="12">
        <v-card class="pa-4 elevation-2">
          <ServiceList :key="refreshKey" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import ServiceList from '../components/ServiceList.vue';
import BillForm from '../components/BillForm.vue';
import SummaryWidget from '../components/SummaryWidget.vue';
import { ref } from 'vue';

const emit = defineEmits(['notify']);
const refreshKey = ref(0);

function refresh() {
  refreshKey.value++;
}

function notify(msg) {
  emit('notify', msg);
}
</script>

<style>
.dashboard-container {
  max-width: 1200px;
  margin: auto;
  padding-top: 32px;
}
</style>
