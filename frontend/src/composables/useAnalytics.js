import { ref, computed, watch } from 'vue'
import api from '../api'

// Funciones de validación
const isValidPayment = (payment) => {
  return (
    payment &&
    typeof payment === 'object' &&
    payment.date instanceof Date &&
    !isNaN(payment.date) &&
    typeof payment.amount === 'number' &&
    !isNaN(payment.amount) &&
    typeof payment.currency === 'string' &&
    ['ARS', 'USD'].includes(payment.currency) &&
    typeof payment.category === 'string'
  )
}

const parsePayment = (payment) => {
  try {
    if (!payment || typeof payment !== 'object') {
      console.warn('Invalid payment object:', payment)
      return null
    }

    // Asegurarse de usar paidAt o date, y obtener la categoría del servicio
    const date = payment.paidAt || payment.date
    const category = payment.Bill?.Service?.category || 'others'

    return {
      ...payment,
      date: date ? new Date(date) : null,
      category
    }
  } catch (error) {
    console.error('Error parsing payment:', error)
    return null
  }
}

export function useAnalytics() {
  // Estado
  const loading = ref(false)
  const bills = ref([])
  const payments = ref([])
  const error = ref(null)
  const year = ref(new Date().getFullYear())
  const currency = ref('Todas')
  const category = ref('Todas')

  const categoryColors = {
    utilities: '#1976d2',
    subscriptions: '#9c27b0',
    taxes: '#e53935',
    others: '#fb8c00'
  }

  // Computed
  const filteredBills = computed(() => {
    return bills.value.filter(bill => {
      const billYear = new Date(bill.dueDate).getFullYear()
      const matchesYear = billYear === year.value
      const matchesCurrency = currency.value === 'Todas' || bill.currency === currency.value
      const matchesCategory = category.value === 'Todas' || bill.category === category.value
      return matchesYear && matchesCurrency && matchesCategory
    })
  })

  const filteredPayments = computed(() => {
    if (!payments.value || !Array.isArray(payments.value)) {
      console.warn('Invalid payments value:', payments.value)
      return []
    }

    // Como los filtros ya se aplican en el backend, solo necesitamos validar y parsear
    return payments.value
      .map(payment => {
        const parsed = parsePayment(payment)
        return parsed && isValidPayment(parsed) ? parsed : null
      })
      .filter(Boolean)
  })

  // Debug info
  console.log('Total payments:', payments.value?.length)
  console.log('Filtered payments:', filteredPayments.value?.length)
  console.log('Current filters:', { year: year.value, currency: currency.value, category: category.value })

  const totalPaid = computed(() => {
    const totals = { ARS: 0, USD: 0 }
    filteredBills.value.forEach(bill => {
      totals[bill.currency] += bill.amount
    })
    return totals
  })

  const monthlyAverage = computed(() => {
    return {
      ARS: totalPaid.value.ARS / 12,
      USD: totalPaid.value.USD / 12
    }
  })

  const highestExpense = computed(() => {
    let highest = { amount: 0, currency: 'ARS', category: '' }
    filteredBills.value.forEach(bill => {
      if (bill.amount > highest.amount) {
        highest = {
          amount: bill.amount,
          currency: bill.currency,
          category: bill.category
        }
      }
    })
    return highest
  })

  const expensesByCategory = computed(() => {
    const grouped = {}
    filteredBills.value.forEach(bill => {
      if (!grouped[bill.category]) {
        grouped[bill.category] = { ARS: 0, USD: 0, count: 0 }
      }
      grouped[bill.category][bill.currency] += bill.amount
      grouped[bill.category].count++
    })
    return grouped
  })

  // Métodos
  const fetchData = async () => {
    loading.value = true
    error.value = null
    
    try {
      const [billsResponse, paymentsResponse] = await Promise.all([
        api.get('/bills', { 
          params: { 
            status: 'paid',
            limit: 1000,
            year: year.value
          }
        }),
        api.get('/payments', {
          params: {
            year: year.value,
            currency: currency.value !== 'Todas' ? currency.value : undefined,
            category: category.value !== 'Todas' ? category.value : undefined
          }
        })
      ])
      
      // Validar que la respuesta contenga los datos esperados
      if (!billsResponse?.data?.data || !Array.isArray(billsResponse.data.data)) {
        throw new Error('Invalid bills data received from server')
      }
      
      if (!paymentsResponse?.data || !Array.isArray(paymentsResponse.data)) {
        throw new Error('Invalid payments data received from server')
      }

      // Log para debug
      console.log('Raw payments from server:', paymentsResponse.data)

      // Procesar y validar los pagos
      const validPayments = paymentsResponse.data
        .map(parsePayment)
        .filter(payment => payment !== null && isValidPayment(payment))

      console.log('Valid payments after processing:', validPayments)

      if (validPayments.length === 0 && paymentsResponse.data.length > 0) {
        throw new Error('No se encontraron pagos válidos en la respuesta del servidor')
      }

      bills.value = billsResponse.data.data
      payments.value = validPayments
    } catch (error) {
      console.error('Error fetching data:', error)
      error.value = error.message
      bills.value = []
      payments.value = []
    } finally {
      loading.value = false
    }
  }

  const formatAmount = (amount, currency) => {
    return amount.toLocaleString('es-AR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    })
  }

  const getCategoryColor = (category) => {
    return categoryColors[category] || '#9e9e9e'
  }

  // Recargar datos cuando cambien los filtros
  watch([year, currency, category], () => {
    fetchData()
  })

  return {
    // Estado
    loading,
    year,
    currency,
    category,
    error,
    // Computed
    filteredBills,
    filteredPayments,
    totalPaid,
    monthlyAverage,
    highestExpense,
    expensesByCategory,
    // Métodos
    fetchData,
    formatAmount,
    getCategoryColor,
    // Constantes
    categoryColors
  }
}
