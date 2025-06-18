import { ref, computed } from 'vue'
import api from '../api'

export function useAnalytics() {
  // Estado
  const loading = ref(false)
  const bills = ref([])
  const payments = ref([])
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
    if (!payments.value) return []
    
    return payments.value.filter(payment => {
      if (year.value && new Date(payment.date).getFullYear() !== year.value) {
        return false
      }
      if (currency.value !== 'Todas' && payment.currency !== currency.value) {
        return false
      }
      if (category.value !== 'Todas' && payment.category !== category.value) {
        return false
      }
      return true
    })
  })

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
            year: year.value
          }
        })
      ])
      
      bills.value = billsResponse.data.data
      payments.value = paymentsResponse.data.data

      // Implementar caché
      sessionStorage.setItem('analytics_bills', JSON.stringify(bills.value))
      sessionStorage.setItem('analytics_payments', JSON.stringify(payments.value))
      sessionStorage.setItem('analytics_last_fetch', Date.now().toString())
    } catch (error) {
      console.error('Error fetching data:', error)
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

  // Cargar datos en caché al iniciar
  const initFromCache = () => {
    const cachedBills = sessionStorage.getItem('analytics_bills')
    const cachedPayments = sessionStorage.getItem('analytics_payments')
    const lastFetch = sessionStorage.getItem('analytics_last_fetch')

    if (cachedBills && cachedPayments && lastFetch) {
      const cacheAge = Date.now() - Number(lastFetch)
      // Usar caché si tiene menos de 5 minutos
      if (cacheAge < 5 * 60 * 1000) {
        bills.value = JSON.parse(cachedBills)
        payments.value = JSON.parse(cachedPayments)
        return true
      }
    }
    return false
  }

  return {
    // Estado
    loading,
    year,
    currency,
    category,
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
    initFromCache,
    // Constantes
    categoryColors
  }
}
