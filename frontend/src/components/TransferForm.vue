<template>
  <v-dialog v-model="dialog" max-width="500px">
    <template v-slot:activator="{ props }">
      <v-btn
        color="info"
        v-bind="props"
        prepend-icon="mdi-bank-transfer"
      >
        Transferencia
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <span class="text-h5">Transferencia entre Cuentas</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" v-model="valid" @submit.prevent="submitTransfer">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="transfer.fromAccountId"
                  :items="accounts"
                  item-title="name"
                  item-value="id"
                  label="Cuenta de Origen"
                  required
                  :rules="[
                    v => !!v || 'La cuenta de origen es requerida',
                    v => v !== transfer.toAccountId || 'Las cuentas de origen y destino deben ser diferentes'
                  ]"
                  density="compact"
                  prepend-icon="mdi-bank-outline"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="transfer.toAccountId"
                  :items="accounts"
                  item-title="name"
                  item-value="id"
                  label="Cuenta de Destino"
                  required
                  :rules="[
                    v => !!v || 'La cuenta de destino es requerida',
                    v => v !== transfer.fromAccountId || 'Las cuentas de origen y destino deben ser diferentes'
                  ]"
                  density="compact"
                  prepend-icon="mdi-bank"
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="transfer.amount"
                  label="Monto"
                  type="number"
                  required
                  :rules="[v => !!v || 'El monto es requerido']"
                  density="compact"
                  prefix="$"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-select
                  v-model="transfer.currency"
                  :items="currencies"
                  label="Moneda"
                  required
                  :rules="[v => !!v || 'La moneda es requerida']"
                  density="compact"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="transfer.description"
                  label="Descripción"
                  density="compact"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-menu
                  v-model="dateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="transfer.date"
                      label="Fecha"
                      readonly
                      v-bind="props"
                      density="compact"
                      prepend-icon="mdi-calendar"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="transfer.date"
                    @update:model-value="dateMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="dialog = false">Cancelar</v-btn>
        <v-btn
          color="info"
          :disabled="!valid"
          @click="submitTransfer"
          :loading="loading"
        >
          Transferir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, toRef } from 'vue';
import { CURRENCY_LIST } from '../constants';
import api from '../api';

// Variables reactivas
const dialog = ref(false);
const valid = ref(false);
const loading = ref(false);
const dateMenu = ref(false);
const formRef = ref(null);
const props = defineProps({ accounts: { type: Array, default: () => [] } });
const accounts = toRef(props, 'accounts');
const currencies = CURRENCY_LIST;

// Datos del formulario
const transfer = reactive({
  fromAccountId: '',
  toAccountId: '',
  amount: '',
  description: '',
  currency: 'ARS',
  date: new Date().toISOString().substr(0, 10),
});

// Métodos

const submitTransfer = async () => {
  if (!valid.value) return;
  
  loading.value = true;
  try {
    await api.post('/transfers', transfer);
    
    // Cerrar el diálogo y resetear el formulario
    dialog.value = false;
    formRef.value.reset();
    Object.assign(transfer, {
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      description: '',
      currency: 'ARS',
      date: new Date().toISOString().substr(0, 10),
    });
    
    // Emitir evento de éxito
    emit('transfer-completed');
  } catch (error) {
    console.error('Error al realizar la transferencia:', error);
  } finally {
    loading.value = false;
  }
};

// Definir emisión de eventos
const emit = defineEmits(['transfer-completed']);

// `accounts` ahora se recibe desde el componente padre como prop
</script>

<style scoped>
.v-card-title {
  background-color: #2196f3;
  color: white;
}
</style>
