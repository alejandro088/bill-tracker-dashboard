<template>
  <v-data-table
    :headers="headers"
    :items="services"
    :loading="loading"
    class="elevation-1"
  >
    <template #item.name="{ item }">
      <v-tooltip :text="item.description || 'Sin descripción'">
        <template #activator="{ props }">
          <div v-bind="props" class="d-flex align-center">
            <span class="font-weight-medium">{{ item.name }}</span>
            <v-icon 
              v-if="item.autoRenew" 
              size="small" 
              color="primary" 
              class="ml-2"
            >
              mdi-autorenew
            </v-icon>
          </div>
        </template>
      </v-tooltip>
    </template>

    <template #item.lastBill="{ item }">
      <v-chip
        v-if="item.lastBill"
        :color="statusColor(item.lastBill.status)"
        class="status-chip"
        size="small"
      >
        <v-icon start size="18">{{ statusIcon(item.lastBill.status) }}</v-icon>
        {{ formatAmount(item.lastBill.amount) }}
      </v-chip>
      <v-chip v-else color="grey" size="small">Sin facturas</v-chip>
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex gap-1">
        <ServiceActions 
          :service="item"
          @edit="$emit('edit', item)"
          @delete="$emit('delete', item)"
          @new-invoice="$emit('new-invoice', item)"
        />
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import ServiceActions from './ServiceActions.vue';
import { statusColor, statusIcon, formatAmount } from '../utils/formatters';

const props = defineProps({
  services: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit', 'delete', 'add-bill']);

const headers = [
  { title: 'Servicio', align: 'start', key: 'name' },
  { title: 'Categoría', align: 'center', key: 'category' },
  { title: 'Última Factura', align: 'center', key: 'lastBill' },
  { title: 'Acciones', align: 'end', key: 'actions', sortable: false }
];
</script>