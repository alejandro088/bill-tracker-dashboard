&lt;script setup>
import { ref, reactive, defineEmits } from 'vue'
import axios from 'axios'
import { 
  CURRENCIES,
  CURRENCY_LIST,
  PAYMENT_METHOD_LIST,
  ONE_TIME_PAYMENT_CATEGORY_LIST 
} from '../constants/index.js'

const emit = defineEmits(['payment-created'])

const dialog = ref(false)
const valid = ref(false)
const form = ref(null)

const payment = reactive({
  amount: '',
  currency: CURRENCIES.ARS,
  category: '',
  description: '',
  paymentProvider: ''
})

const currencies = CURRENCY_LIST
const categories = ONE_TIME_PAYMENT_CATEGORY_LIST
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
    emit('payment-created')
  } catch (error) {
    console.error('Error al crear el pago:', error)
  }
}
&lt;/script>
