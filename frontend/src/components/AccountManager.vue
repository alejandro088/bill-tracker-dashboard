<template>
  <div>
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Cuentas</span>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openNewAccountDialog"
        >
          Nueva Cuenta
        </v-btn>
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <!-- Tarjetas de resumen de cuentas -->
          <v-col cols="12" md="6" lg="4" v-for="account in accounts" :key="account.id">
            <v-card
              :color="account.color || 'grey-lighten-3'"
              :class="{ 'text-white': isColorDark(account.color) }"
              variant="flat"
              class="account-card"
            >
              <v-card-text>
                <div class="d-flex justify-space-between align-center">
                  <div class="d-flex align-center">
                    <v-icon :icon="account.icon || 'mdi-bank'" size="large" class="mr-2"></v-icon>
                    <div>
                      <div class="text-h6">{{ account.name }}</div>
                      <div class="text-caption">{{ account.type }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-h5">
                      {{ formatAmount(account.balance, account.currency) }}
                    </div>
                    <div class="text-caption">Saldo Actual</div>
                  </div>
                </div>
                
                <div class="mt-3">
                  <v-chip v-for="method in account.paymentMethods" :key="method.id" size="small" class="mr-1 mb-1">
                    <v-icon start size="small">{{ method.icon || 'mdi-credit-card' }}</v-icon>
                    {{ method.name }}
                  </v-chip>
                </div>
              </v-card-text>
              
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="editAccount(account)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn variant="text" @click="confirmDelete(account)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn variant="text" @click="openLinkMethodDialog(account)">
                  <v-icon>mdi-link</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <!-- Diálogo para crear/editar cuentas -->
    <v-dialog v-model="accountDialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editedAccount.id ? 'Editar Cuenta' : 'Nueva Cuenta' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedAccount.name"
                  label="Nombre"
                  required
                  :rules="[v => !!v || 'El nombre es requerido']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedAccount.description"
                  label="Descripción"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editedAccount.type"
                  :items="accountTypes"
                  label="Tipo de Cuenta"
                  required
                  :rules="[v => !!v || 'El tipo es requerido']"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editedAccount.currency"
                  :items="['ARS', 'USD']"
                  label="Moneda"
                  required
                  :rules="[v => !!v || 'La moneda es requerida']"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedAccount.balance"
                  label="Saldo"
                  type="number"
                  prefix="$"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedAccount.icon"
                  label="Ícono (mdi-*)"
                  hint="Ej: mdi-bank, mdi-cash, mdi-credit-card"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-color-picker
                  v-model="editedAccount.color"
                  hide-inputs
                  hide-canvas
                  show-swatches
                  swatches-max-height="200px"
                ></v-color-picker>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="accountDialog = false">Cancelar</v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="saveAccount" :disabled="!valid">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Diálogo para vincular métodos de pago -->
    <v-dialog v-model="linkMethodDialog" max-width="500px">
      <v-card>
        <v-card-title>
          Vincular Métodos de Pago a {{ selectedAccount?.name }}
        </v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="selectedMethods"
            :items="availableMethods"
            item-title="name"
            item-value="id"
            return-object
            multiple
            chips
            label="Métodos de Pago"
            :loading="loadingMethods"
          >
            <template v-slot:selection="{ item }">
              <v-chip>
                <v-icon start size="small">{{ item.raw.icon || 'mdi-credit-card' }}</v-icon>
                {{ item.raw.name }}
              </v-chip>
            </template>
            <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-icon>{{ item.raw.icon || 'mdi-credit-card' }}</v-icon>
                </template>
                <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="linkMethodDialog = false">Cancelar</v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="saveLinkedMethods">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">¿Estás seguro que quieres eliminar esta cuenta?</v-card-title>
        <v-card-text>
          Esta acción no se puede deshacer. No podrás eliminar la cuenta si tiene métodos de pago vinculados.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="red-darken-1" variant="text" @click="deleteAccount">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api';

// Estados
const accounts = ref([]);
const paymentMethods = ref([]);
const accountDialog = ref(false);
const linkMethodDialog = ref(false);
const deleteDialog = ref(false);
const valid = ref(false);
const loadingAccounts = ref(false);
const loadingMethods = ref(false);
const form = ref(null);

// Cuenta seleccionada para editar/eliminar
const editedAccount = ref({
  name: '',
  description: '',
  type: 'Banco',
  balance: null,
  currency: 'ARS',
  icon: 'mdi-bank',
  color: '#1867C0'
});

const selectedAccount = ref(null);
const selectedMethods = ref([]);

// Tipos de cuenta disponibles
const accountTypes = [
  'Banco',
  'Efectivo',
  'Tarjeta de Crédito',
  'Billetera Digital',
  'Inversión',
  'Otro'
];

// Métodos de pago disponibles para vincular
const availableMethods = computed(() => {
  return paymentMethods.value.filter(method => {
    // Si el método ya está vinculado a otra cuenta, no mostrarlo
    if (method.accountId && method.accountId !== selectedAccount.value?.id) {
      return false;
    }
    return true;
  });
});

// Cargar cuentas desde el backend
const fetchAccounts = async () => {
  loadingAccounts.value = true;
  try {
    const response = await api.get('/accounts');
    accounts.value = response.data;
  } catch (error) {
    console.error('Error al cargar las cuentas:', error);
    // Aquí podrías mostrar una notificación de error
  } finally {
    loadingAccounts.value = false;
  }
};

// Cargar métodos de pago desde el backend
const fetchPaymentMethods = async () => {
  loadingMethods.value = true;
  try {
    const response = await api.get('/payment-methods');
    paymentMethods.value = response.data;
  } catch (error) {
    console.error('Error al cargar los métodos de pago:', error);
    // Aquí podrías mostrar una notificación de error
  } finally {
    loadingMethods.value = false;
  }
};

// Abrir diálogo para nueva cuenta
const openNewAccountDialog = () => {
  editedAccount.value = {
    name: '',
    description: '',
    type: 'Banco',
    balance: null,
    currency: 'ARS',
    icon: 'mdi-bank',
    color: '#1867C0'
  };
  accountDialog.value = true;
};

// Abrir diálogo para editar cuenta
const editAccount = (account) => {
  editedAccount.value = { ...account };
  accountDialog.value = true;
};

// Abrir diálogo para vincular métodos de pago
const openLinkMethodDialog = (account) => {
  selectedAccount.value = account;
  
  // Preseleccionar los métodos ya vinculados
  selectedMethods.value = account.paymentMethods || [];
  
  linkMethodDialog.value = true;
};

// Guardar cuenta (crear o actualizar)
const saveAccount = async () => {
  if (!valid.value) return;
  
  try {
    if (editedAccount.value.id) {
      // Actualizar cuenta existente
      await api.put(`/accounts/${editedAccount.value.id}`, editedAccount.value);
    } else {
      // Crear nueva cuenta
      await api.post('/accounts', editedAccount.value);
    }
    
    await fetchAccounts();
    accountDialog.value = false;
  } catch (error) {
    console.error('Error al guardar la cuenta:', error);
    // Aquí podrías mostrar una notificación de error
  }
};

// Guardar los métodos de pago vinculados
const saveLinkedMethods = async () => {
  if (!selectedAccount.value) return;
  
  try {
    const currentMethods = selectedAccount.value.paymentMethods || [];
    
    // Métodos a desvincular (estaban antes pero ya no están)
    const methodsToUnlink = currentMethods.filter(
      method => !selectedMethods.value.some(m => m.id === method.id)
    );
    
    // Métodos a vincular (no estaban antes)
    const methodsToLink = selectedMethods.value.filter(
      method => !currentMethods.some(m => m.id === method.id)
    );
    
    // Desvincular métodos
    for (const method of methodsToUnlink) {
      await api.delete(`/accounts/unlink-payment-method/${method.id}`);
    }
    
    // Vincular métodos
    for (const method of methodsToLink) {
      await api.post('/accounts/link-payment-method', {
        paymentMethodId: method.id,
        accountId: selectedAccount.value.id
      });
    }
    
    await fetchAccounts();
    linkMethodDialog.value = false;
  } catch (error) {
    console.error('Error al guardar los métodos vinculados:', error);
    // Aquí podrías mostrar una notificación de error
  }
};

// Confirmar eliminación de cuenta
const confirmDelete = (account) => {
  selectedAccount.value = account;
  deleteDialog.value = true;
};

// Eliminar cuenta
const deleteAccount = async () => {
  if (!selectedAccount.value) return;
  
  try {
    await api.delete(`/accounts/${selectedAccount.value.id}`);
    await fetchAccounts();
    deleteDialog.value = false;
    selectedAccount.value = null;
  } catch (error) {
    console.error('Error al eliminar la cuenta:', error);
    // Aquí podrías mostrar una notificación de error
  }
};

// Formatear montos con el símbolo de la moneda
const formatAmount = (amount, currency) => {
  if (amount === null || amount === undefined) return '-';
  
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

// Determinar si un color es oscuro (para aplicar texto blanco)
const isColorDark = (color) => {
  if (!color) return false;
  
  // Convertir a formato RGB
  let hex = color.replace('#', '');
  let r = parseInt(hex.substr(0, 2), 16);
  let g = parseInt(hex.substr(2, 2), 16);
  let b = parseInt(hex.substr(4, 2), 16);
  
  // Calcular luminosidad
  let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Si luminance < 0.5, el color es oscuro
  return luminance < 0.5;
};

// Cargar datos al montar el componente
onMounted(() => {
  fetchAccounts();
  fetchPaymentMethods();
});
</script>

<style scoped>
.account-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.account-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
</style>
