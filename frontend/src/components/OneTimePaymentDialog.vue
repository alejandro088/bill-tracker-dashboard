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
                  v-model="payment.paymentMethodId"
                  :items="paymentMethods"
                  item-title="title"
                  item-value="value"
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
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { 
  CURRENCIES,
  CURRENCY_LIST,
  ONE_TIME_PAYMENT_CATEGORY_LIST 
} from '../constants/index.js'
import api from '../api.js'

const emit = defineEmits(['payment-created'])

const dialog = ref(false)
const valid = ref(false)
const form = ref(null)
const paymentMethods = ref([])

const payment = reactive({
  amount: '',
  currency: CURRENCIES.ARS,
  category: '',
  description: '',
  paymentMethodId: ''
})

const currencies = CURRENCY_LIST
const categories = ONE_TIME_PAYMENT_CATEGORY_LIST

// Cargar los métodos de pago desde la API
const fetchPaymentMethods = async () => {
  try {
    const { data } = await api.get('/payment-methods')
    paymentMethods.value = data.map(method => ({
      title: method.name,
      value: method.id,
      description: method.description,
      icon: method.icon
    }))
  } catch (error) {
    console.error('Error al cargar métodos de pago:', error)
    // Valores por defecto en caso de error
    paymentMethods.value = [
      { title: 'Visa', value: '1' },
      { title: 'Mastercard', value: '2' },
      { title: 'MercadoPago', value: '3' }
    ]
  }
}

const close = () => {
  dialog.value = false
  form.value?.reset()
  // Resetear el objeto de pago
  Object.assign(payment, {
    amount: '',
    currency: CURRENCIES.ARS,
    category: '',
    description: '',
    paymentMethodId: ''
  })
}

const save = async () => {
  if (!form.value?.validate()) return

  try {
    await api.post('/payments/one-time', payment)
    close()
    emit('payment-created')
  } catch (error) {
    console.error('Error al crear el pago:', error)
  }
}

// Cargar los métodos de pago al montar el componente
onMounted(fetchPaymentMethods)
</script>
