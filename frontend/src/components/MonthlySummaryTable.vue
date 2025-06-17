<template>
  <v-data-table
    :headers="headers"
    :items="groupedItems"
    :group-by="['month']"
    class="elevation-1 monthly-summary-table"
    :items-per-page="-1"
  >
    <!-- Template para la columna de estado -->
    <template #item.status="{ item }">
      <v-chip
        :color="getStatusColor(item.status)"
        size="small"
        class="text-capitalize status-chip"
      >
        <v-icon start size="small">{{ getStatusIcon(item.status) }}</v-icon>
        {{ item.status }}
      </v-chip>
    </template>

    <!-- Template para la columna de total -->
    <template #item.total="{ item }">
      <div class="d-flex align-center">
        <v-chip
          :color="item.currency === 'USD' ? 'success' : 'info'"
          size="x-small"
          variant="outlined"
          class="mr-2 currency-chip"
        >
          {{ item.currency }}
        </v-chip>
        <span :class="{
          'text-success': item.status === 'pagado',
          'text-error': item.status === 'vencido',
          'font-weight-medium': true
        }">
          {{ formatAmount(item.total, item.currency) }}
        </span>
      </div>
    </template>

    <!-- Template para la columna de cantidad -->
    <template #item.count="{ item }">
      <v-chip
        color="grey"
        size="small"
        variant="flat"
        class="count-chip"
      >
        {{ item.count }}
      </v-chip>
    </template>

    <!-- Template para el grupo (mes) -->
    <template #group.header="{ item, count, isGroup, toggle }">
      <td :colspan="headers.length">
        <v-hover v-slot="{ isHovering, props }">
          <v-row
            no-gutters
            align="center"
            class="pa-3 group-header"
            v-if="isGroup"
            v-bind="props"
            :class="{ 'group-header-hover': isHovering }"
            @click="toggle"
            style="cursor: pointer"
          >
            <v-col cols="auto" class="d-flex align-center">
              <v-icon
                :icon="isGroup.opened ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                class="mr-2"
              />
              <span class="text-h6">{{ formatMonth(item.value) }}</span>
            </v-col>
            <v-col cols="auto" class="ml-4">
              <v-chip color="primary" size="small" variant="flat" class="bills-count">
                <v-icon start size="small">mdi-file-document-outline</v-icon>
                {{ count }} facturas
              </v-chip>
            </v-col>
            <v-col cols="auto" class="ml-4">
              <div class="d-flex gap-2">
                <div
                  v-for="total in getMonthTotals(item.value)"
                  :key="total.currency"
                  class="currency-total"
                >
                  <v-chip
                    :color="total.currency === 'USD' ? 'success' : 'info'"
                    size="small"
                    variant="elevated"
                    class="total-chip"
                  >
                    <v-icon start size="small">
                      {{ total.currency === 'USD' ? 'mdi-currency-usd' : 'mdi-currency-ars' }}
                    </v-icon>
                    {{ total.currency }} {{ formatAmount(total.amount, total.currency) }}
                  </v-chip>
                </div>
              </div>
            </v-col>
            <v-col cols="auto" class="ml-auto" v-if="isHovering">
              <v-btn
                icon="mdi-chart-bar"
                variant="text"
                size="small"
                color="primary"
                @click.stop="$emit('show-details', item.value)"
              >
                <v-tooltip activator="parent" location="top">Ver detalles del mes</v-tooltip>
              </v-btn>
            </v-col>
          </v-row>
        </v-hover>
      </td>
    </template>
  </v-data-table>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
});

defineEmits(['show-details']);

const headers = [
  { title: 'Mes', key: 'month', width: '200px' },
  { title: 'Estado', key: 'status', sortable: true, width: '150px' },
  { title: 'Total', key: 'total', sortable: true, width: '200px' },
  { title: 'Cantidad', key: 'count', sortable: true, align: 'center', width: '100px' }
];

const groupedItems = computed(() => {
  return props.items.map(item => ({
    ...item,
    month: formatMonth(item.month)
  }));
});

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case 'pagado':
      return 'success';
    case 'pendiente':
      return 'warning';
    case 'vencido':
      return 'error';
    default:
      return 'grey';
  }
}

function getStatusIcon(status) {
  switch (status.toLowerCase()) {
    case 'pagado':
      return 'mdi-check-circle';
    case 'pendiente':
      return 'mdi-clock-outline';
    case 'vencido':
      return 'mdi-alert-circle';
    default:
      return 'mdi-help-circle';
  }
}

function formatMonth(month) {
  const [year, monthNum] = month.split('-');
  const date = new Date(year, monthNum - 1);
  return date.toLocaleString('es', { month: 'long', year: 'numeric' });
}

function formatAmount(amount, currency) {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function getMonthTotals(month) {
  const monthItems = props.items.filter(item => formatMonth(item.month) === month);
  const totals = {};
  
  monthItems.forEach(item => {
    const currency = item.currency || 'ARS';
    if (!totals[currency]) {
      totals[currency] = 0;
    }
    totals[currency] += item.total;
  });

  return Object.entries(totals).map(([currency, amount]) => ({
    currency,
    amount
  }));
}
</script>

<style scoped>
.monthly-summary-table :deep(.v-data-table-header) {
  background-color: var(--v-primary-lighten-5);
}

.group-header {
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.group-header-hover {
  background-color: var(--v-primary-lighten-5);
}

.status-chip {
  font-weight: 500;
}

.currency-chip {
  font-weight: 600;
}

.count-chip {
  min-width: 40px;
  justify-content: center;
}

.bills-count {
  font-weight: 500;
}

.total-chip {
  font-weight: 600;
}

.currency-total {
  transition: transform 0.2s ease;
}

.currency-total:hover {
  transform: translateY(-2px);
}
</style>
