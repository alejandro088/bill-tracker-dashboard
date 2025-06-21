<template>
  <v-dialog v-model="dialog" max-width="500px">
    <template v-slot:activator="{ props }">
      <v-btn
        color="primary"
        v-bind="props"
        prepend-icon="mdi-plus"
      >
        Pago Único
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <span class="text-h5">Crear Pago Único</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="payment.amount"
                  label="Monto"
                  type="number"
                  required
                  :rules="[v => !!v || 'El monto es requerido']"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-select
                  v-model="payment.currency"
                  :items="currencies"
                  label="Moneda"
                  required
                  :rules="[v => !!v || 'La moneda es requerida']"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="payment.category"
                  :items="categories"
                  label="Categoría"
                  required
                  :rules="[v => !!v || 'La categoría es requerida']"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="payment.description"
                  label="Descripción"
                  required
                  :rules="[v => !!v || 'La descripción es requerida']"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="payment.paymentProvider"
                  :items="paymentProviders"
                  label="Método de pago"
                  required
                  :rules="[v => !!v || 'El método de pago es requerido']"
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :disabled="!valid" @click="save">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, defineEmits } from 'vue'
import axios from 'axios'

const emit = defineEmits(['payment-created'])

const dialog = ref(false)
const valid = ref(false)
const form = ref(null)

const payment = reactive({
  amount: '',
  currency: 'ARS',
  category: '',
  description: '',
  paymentProvider: ''
})

import { CURRENCIES, CURRENCY_LIST, PAYMENT_METHODS, PAYMENT_METHOD_LIST } from '../constants/index.js'

// One-time payment categories
export const ONE_TIME_PAYMENT_CATEGORIES = {
  GROCERIES: 'Supermercado',
  BAKERY: 'Panadería',
  VEGETABLES: 'Verdulería',
  PHARMACY: 'Farmacia',
  TRANSPORT: 'Transporte',
  OTHERS: 'Otros'
};

const currencies = CURRENCY_LIST
const categories = Object.values(ONE_TIME_PAYMENT_CATEGORIES)
const paymentProviders = PAYMENT_METHOD_LIST

const close = () => {
  dialog.value = false
  form.value?.reset()
}

const save = async () => {
  if (!form.value?.validate()) return

  try {
    await axios.post('/api/payments/one-time', payment)
    close()
    // Emitir evento para actualizar la lista de pagos
    emit('payment-created')
  } catch (error) {
    console.error('Error al crear el pago:', error)
  }
}
</script>
