<template>
  <v-btn class="add-btn" color="primary" @click="dialog = true">
    <v-icon start>mdi-plus</v-icon>
    Add Service
  </v-btn>

  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-form @submit.prevent="submit">
        <v-card-title>Add Service</v-card-title>
        <v-card-text class="pt-0">
          <v-text-field
            v-model="name"
            label="Name"
            density="compact"
            required
            :error-messages="validationErrors.name || []"
            :error="validationErrors.name && validationErrors.name.length > 0"
          />
          <v-text-field v-model="description" label="Description" density="compact" />
          <div class="d-flex">
            <v-text-field
              v-model.number="amount"
              :label="`Amount ${currency}`"
              type="number"
              density="compact"
              class="flex-grow-1 mr-2"
              required
            />
            <v-select
              v-model="currency"
              :items="CURRENCY_LIST"
              label="Currency"
              density="compact"
              style="min-width: 100px"
            />
          </div>
          <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition">
            <template #activator="{ props }">
              <v-text-field
                v-model="dueDate"
                label="Due Date"
                readonly
                v-bind="props"
                density="compact"
              />
            </template>
            <v-date-picker v-model="dueDate" @update:modelValue="menu = false" />
          </v-menu>
          <v-select
            v-model="category"
            :items="categories"
            item-title="name"
            item-value="id"
            label="Categoría"
            density="compact"
            :error-messages="validationErrors.categoryId || validationErrors.category || []"
            :error="(validationErrors.categoryId && validationErrors.categoryId.length > 0) || (validationErrors.category && validationErrors.category.length > 0)"
          />
          <v-btn
            variant="text"
            color="primary"
            @click="fetchCategories"
            prepend-icon="mdi-refresh"
          >
            Actualizar Categorías
          </v-btn>
          <v-select
            v-model="recurrence"
            :items="recurrenceOptions"
            label="Recurrence"
            density="compact"
          />
          <v-switch
            v-if="category === 'subscriptions'"
            v-model="autoRenew"
            label="Auto Renew"
          />
          <v-alert v-if="generalError" type="error" dense class="mt-2">{{ generalError }}</v-alert>
        </v-card-text>
        <v-card-actions class="pt-0">
          <v-spacer />
          <v-btn text @click="close">Cancel</v-btn>
          <v-btn type="submit" :loading="loading" color="primary">Add</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api.js'
import { 
  CURRENCIES, 
  CURRENCY_LIST, 
  DEFAULT_CURRENCY
} from '../constants'

const emit = defineEmits(['added', 'notify'])

const name = ref('')
const description = ref('')
const amount = ref(0)
const currency = ref(DEFAULT_CURRENCY)
const dueDate = ref('')
const menu = ref(false)
const category = ref('')
const recurrenceOptions = ['none', 'weekly', 'monthly', 'bimonthly', 'yearly']
const recurrence = ref('none')
const autoRenew = ref(false)
const loading = ref(false)
const generalError = ref(null)
const validationErrors = ref({})
const dialog = ref(false)
const categories = ref([])

function close() {
  dialog.value = false
  resetForm()
}

function resetForm() {
  name.value = ''
  description.value = ''
  amount.value = 0
  currency.value = DEFAULT_CURRENCY
  dueDate.value = ''
  category.value = ''
  recurrence.value = 'none'
  autoRenew.value = false
  generalError.value = null
  validationErrors.value = {}
}

  const submit = async () => {
  loading.value = true
  try {
      // Build service payload. We create the Service and optionally a nested Bill
      const servicePayload = {
        name: name.value,
        description: description.value,
        categoryId: category.value || undefined,
        recurrence: recurrence.value,
        autoRenew: autoRenew.value,
        defaultCurrency: currency.value
      }

      // If an amount is provided, include amount/currency/dueDate in payload
      if (amount.value && Number(amount.value) > 0) {
        servicePayload.amount = Number(amount.value)
        servicePayload.currency = currency.value
        servicePayload.dueDate = dueDate.value || undefined
      }

      const resp = await api.post('/services', servicePayload)
      emit('notify', `Servicio creado: ${resp.data.name}`)
      emit('added')
      close()
  } catch (e) {
    // Manejar errores de validación del backend
    generalError.value = null
    validationErrors.value = {}
    if (e.response?.data?.details && Array.isArray(e.response.data.details)) {
      // Mapeamos detalles a un objeto { field: [messages] }
      const map = {}
      e.response.data.details.forEach(d => {
        if (d.field) {
          map[d.field] = map[d.field] || []
          map[d.field].push(d.message)
        }
      })
      validationErrors.value = map
      generalError.value = e.response.data.error || 'Datos de entrada inválidos'
    } else if (e.response?.data?.error) {
      generalError.value = e.response.data.error
    } else {
      generalError.value = e.message
    }
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const response = await api.get('/categories')
    // Usamos name como value para mantener compatibilidad con el backend
    categories.value = response.data.map(c => ({ id: c.id, name: c.name, color: c.color }))
  } catch (e) {
    generalError.value = e.message
  } finally {
    loading.value = false
  }
}

// Fetch categories on component mount
fetchCategories()
</script>
