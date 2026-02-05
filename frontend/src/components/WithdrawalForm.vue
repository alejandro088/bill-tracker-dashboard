<template>
  <v-dialog v-model="dialog" max-width="500px">
    <template v-slot:activator="{ props }">
      <v-btn color="error" v-bind="props" prepend-icon="mdi-cash-remove">
        Registrar Egreso
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <span class="text-h5">Registrar Egreso / Retiro</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" v-model="valid" @submit.prevent="submitWithdrawal">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="withdrawal.accountId"
                  :items="accounts"
                  item-title="name"
                  item-value="id"
                  label="Cuenta"
                  required
                  :rules="[v => !!v || 'La cuenta es requerida']"
                  density="compact"
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="withdrawal.amount"
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
                  v-model="withdrawal.currency"
                  :items="currencies"
                  label="Moneda"
                  required
                  :rules="[v => !!v || 'La moneda es requerida']"
                  density="compact"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="withdrawal.description"
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
                      v-model="withdrawal.date"
                      label="Fecha"
                      readonly
                      v-bind="props"
                      density="compact"
                      prepend-icon="mdi-calendar"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="withdrawal.date"
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
        <v-btn color="grey" @click="dialog = false">Cancelar</v-btn>
        <v-btn
          color="error"
          :disabled="!valid"
          @click="submitWithdrawal"
          :loading="loading"
        >
          Registrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, toRef } from 'vue';
import { CURRENCY_LIST } from '../constants';
import api from '../api';

const props = defineProps({ accounts: { type: Array, default: () => [] } });
const accounts = toRef(props, 'accounts');

const dialog = ref(false);
const valid = ref(false);
const loading = ref(false);
const dateMenu = ref(false);
const formRef = ref(null);
const currencies = CURRENCY_LIST;

const withdrawal = reactive({
  accountId: '',
  amount: '',
  description: '',
  currency: 'ARS',
  date: new Date().toISOString().substr(0, 10),
});

const submitWithdrawal = async () => {
  if (!valid.value) return;
  loading.value = true;
  try {
    await api.post('/accounts/withdraw', {
      accountId: withdrawal.accountId,
      amount: withdrawal.amount,
      description: withdrawal.description
    });
    dialog.value = false;
    formRef.value.reset();
    Object.assign(withdrawal, {
      accountId: '', amount: '', description: '', currency: 'ARS', date: new Date().toISOString().substr(0,10)
    });
    emit('withdrawal-made');
  } catch (err) {
    console.error('Error al registrar el retiro:', err);
  } finally {
    loading.value = false;
  }
};

const emit = defineEmits(['withdrawal-made']);
</script>

<style scoped>
.v-card-title { background-color: #f44336; color: white; }
</style>
