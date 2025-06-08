<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <v-alert v-else-if="error" type="error" dense>{{ error }}</v-alert>
    <v-data-table
      v-else
      :headers="headers"
      :items="services"
      class="elevation-1"
      hide-default-footer
    >
      <template #item.actions="{ item }">
        <v-btn :to="`/services/${item.id}`" variant="text" color="primary">
          Ver facturas
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';

const services = ref([]);
const loading = ref(false);
const error = ref(null);
const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Categoría', key: 'category' },
  { title: 'Proveedor', key: 'paymentProvider' },
  { title: 'Recurrencia', key: 'recurrence' },
  { title: 'Acciones', key: 'actions', sortable: false }
];

const fetchServices = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/services');
    services.value = data;
    error.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchServices);
</script>

