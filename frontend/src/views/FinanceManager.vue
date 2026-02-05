<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 mb-4">Gestión de Finanzas</h1>
        </v-col>
      </v-row>
      
      <v-row>
        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-title class="bg-success text-white">
              <v-icon class="mr-2">mdi-cash-plus</v-icon>
              Ingresos
            </v-card-title>
              <v-card-text>
              <p>Registra ingresos de dinero en tus cuentas</p>
              <income-form :accounts="accounts" @income-added="refreshData" />
              <div class="mt-3">
                <withdrawal-form :accounts="accounts" @withdrawal-made="refreshData" />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-title class="bg-info text-white">
              <v-icon class="mr-2">mdi-bank-transfer</v-icon>
              Transferencias
            </v-card-title>
              <v-card-text>
              <p>Mueve dinero entre tus cuentas</p>
              <transfer-form :accounts="accounts" @transfer-completed="refreshData" />
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-title class="bg-primary text-white">
              <v-icon class="mr-2">mdi-bank</v-icon>
              Cuentas
            </v-card-title>
            <v-card-text>
              <p>Administra tus cuentas bancarias y efectivo</p>
              <v-btn color="primary" prepend-icon="mdi-eye" @click="goToAccountManager">
                Ver Cuentas
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Historial de movimientos recientes -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <v-icon class="mr-2">mdi-history</v-icon>
              Movimientos Recientes
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Buscar"
                single-line
                hide-details
                density="compact"
              ></v-text-field>
            </v-card-title>
            
            <v-data-table
              :headers="headers"
              :items="transactions"
              :search="search"
              :loading="loading"
              class="elevation-1"
            >
              <template v-slot:item.type="{ item }">
                <v-chip
                  :color="getTypeColor(item.type)"
                  text-color="white"
                  size="small"
                >
                  {{ item.type }}
                </v-chip>
              </template>
              
              <template v-slot:item.amount="{ item }">
                <span :class="getAmountClass(item)">
                  {{ formatCurrency(item.amount, item.currency) }}
                </span>
              </template>
              
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import IncomeForm from '../components/IncomeForm.vue';
import TransferForm from '../components/TransferForm.vue';
import WithdrawalForm from '../components/WithdrawalForm.vue';
import api from '../api';

// Router
const router = useRouter();

// Variables reactivas
const search = ref('');
const loading = ref(false);
const transactions = ref([]);
const accounts = ref([]);

// Definición de columnas de la tabla
const headers = [
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Fecha', key: 'date', sortable: true },
  { title: 'Cuenta Origen', key: 'fromAccount', sortable: true },
  { title: 'Cuenta Destino', key: 'toAccount', sortable: true },
  { title: 'Monto', key: 'amount', sortable: true },
  { title: 'Descripción', key: 'description', sortable: true }
];

// Métodos
const goToAccountManager = () => {
  router.push('/settings');
};

const fetchAccounts = async () => {
  try {
    const resp = await api.get('/accounts');
    accounts.value = resp.data;
  } catch (err) {
    console.error('Error al cargar cuentas:', err);
  }
};

const refreshData = async () => {
  loading.value = true;
  try {
    // Obtener ingresos
    const incomesResponse = await api.get('/accounts/incomes');
    const incomes = incomesResponse.data;
    
    // Obtener transferencias
    const transfersResponse = await api.get('/accounts/transfers');
    const transfers = transfersResponse.data;
    
    // Combinar y formatear datos para la tabla
    transactions.value = [
      ...incomes.map(income => ({
        id: `income-${income.id}`,
        type: (Number(income.amount) < 0) ? 'Egreso' : 'Ingreso',
        date: new Date(income.createdAt),
        fromAccount: 'Externo',
        toAccount: income.account.name,
        amount: Math.abs(Number(income.amount)),
        currency: income.currency || 'ARS',
        description: income.description
      })),
      ...transfers.map(transfer => ({
        id: `transfer-${transfer.id}`,
        type: 'Transferencia',
        date: new Date(transfer.transferDate),
        fromAccount: transfer.fromAccount.name,
        toAccount: transfer.toAccount.name,
        amount: transfer.amount,
        currency: transfer.currency,
        description: transfer.description
      }))
    ].sort((a, b) => b.date - a.date);
  } catch (error) {
    console.error('Error al cargar los datos:', error);
  } finally {
    loading.value = false;
  }
};
const getTypeColor = (type) => {
  switch (type) {
    case 'Ingreso':
      return 'success';
    case 'Transferencia':
      return 'info';
    default:
      return 'grey';
  }
};

const getAmountClass = (item) => {
  return {
    'text-success': item.type === 'Ingreso',
    'text-info': item.type === 'Transferencia'
  };
};

const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: currency || 'ARS'
  }).format(amount);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Cargar datos al montar el componente
onMounted(async () => {
  await fetchAccounts();
  await refreshData();
});
</script>

<style scoped>
.text-success {
  color: #4caf50;
}
.text-info {
  color: #2196f3;
}
.bg-success {
  background-color: #4caf50 !important;
}
.bg-info {
  background-color: #2196f3 !important;
}
.bg-primary {
  background-color: #1976d2 !important;
}
</style>
