<template>
  <v-dialog v-model="dialog" max-width="500" @update:modelValue="val => !val && close()">
    <v-card>
      <v-card-title class="text-h5 pb-2">
        <v-icon icon="mdi-cash-multiple" class="mr-2" color="success"></v-icon>
        Pagar factura
      </v-card-title>
      <v-divider></v-divider>
      
      <v-card-text class="pt-4">
        <!-- Información de la factura -->
        <v-alert
          v-if="props.bill"
          density="compact"
          type="info"
          variant="tonal"
          class="mb-4"
        >
          <div class="d-flex justify-space-between">
            <div>
              <strong>Servicio:</strong> {{ props.bill.name }}
            </div>
            <div>
              <strong>Monto:</strong> {{ formatAmount(props.bill.amount, props.bill.currency) }}
            </div>
          </div>
        </v-alert>
        
        <!-- Selector de fecha -->
        <v-menu v-model="showDatePicker" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-text-field
              v-model="paymentDate"
              label="Fecha de pago"
              prepend-icon="mdi-calendar"
              readonly
              v-bind="props"
              density="compact"
              variant="outlined"
              class="mb-4"
            />
          </template>
          <v-date-picker
            v-model="paymentDate"
            @update:model-value="showDatePicker = false"
          />
        </v-menu>
        
        <div v-for="(p, i) in payments" :key="i" class="d-flex align-center mb-2">
          <v-text-field
            v-model.number="p.amount"
            type="number"
            :label="`Monto ${getMethodCurrency(p.paymentMethodId)}`"
            density="compact"
            variant="outlined"
            class="mr-2"
            style="max-width:150px"
            :prefix="getMethodCurrency(p.paymentMethodId) === 'USD' ? 'USD ' : '$'"
          />
          <v-select
            v-model="p.paymentMethodId"
            :items="providers"
            item-title="title"
            item-value="value"
            label="Medio de pago"
            density="compact"
            variant="outlined"
            class="flex-grow-1"
            @update:model-value="updatePaymentMethodInfo(i)"
          >
            <template v-slot:append-inner v-if="getPaymentMethodAccount(p.paymentMethodId)">
              <div class="pa-2 text-right">
                <span class="text-caption">Saldo disponible: </span>
                <span class="font-weight-bold">
                  {{ formatCurrency(getPaymentMethodAccount(p.paymentMethodId)?.balance, getPaymentMethodAccount(p.paymentMethodId)?.currency) }}
                </span>
              </div>
            </template>
          </v-select>
          <v-btn icon size="small" @click="remove(i)" v-if="payments.length > 1" color="error" variant="text">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        
        <!-- Botones de acción para líneas de pago -->
        <div class="d-flex gap-2 mb-4 mt-2">
          <v-btn 
            prepend-icon="mdi-plus" 
            variant="tonal" 
            color="primary" 
            size="small" 
            @click="addLine"
          >
            Agregar forma de pago
          </v-btn>
          
          <v-btn
            prepend-icon="mdi-auto-fix"
            variant="tonal"
            color="info"
            size="small"
            @click="suggestPaymentMethod"
            :disabled="!hasInsufficientFunds"
          >
            Optimizar métodos
          </v-btn>
        </div>
        
        <!-- Resumen de pago -->
        <v-card class="pa-3 mb-2" variant="outlined" color="surface">
          <div class="d-flex justify-space-between align-center">
            <div class="text-subtitle-2">Total a pagar:</div>
            <div class="text-h6 font-weight-bold">
              {{ formatAmount(props.bill?.amount, props.bill?.currency) }}
            </div>
          </div>
          
          <div class="d-flex justify-space-between align-center mt-2">
            <div class="text-subtitle-2">Total actual:</div>
            <div :class="{'text-success': isValidTotal, 'text-error': !isValidTotal}" class="font-weight-bold">
              {{ formatAmount(totalInBillCurrency, props.bill?.currency) }}
              <v-icon v-if="isValidTotal" icon="mdi-check-circle" color="success" size="small"></v-icon>
              <v-icon v-else icon="mdi-alert-circle" color="error" size="small"></v-icon>
            </div>
          </div>
        </v-card>
        
        <!-- Información de tasa de cambio -->
        <v-expand-transition>
          <div v-if="hasMultipleCurrencies">
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="mb-2"
            >
              <div class="d-flex justify-space-between align-center">
                <div>
                  <strong>Tasa de cambio USD/ARS:</strong> {{ exchangeRate.toFixed(2) }}
                </div>
                <v-tooltip location="top" text="Actualizar tasa">
                  <template v-slot:activator="{ props }">
                    <v-btn 
                      v-bind="props"
                      icon="mdi-refresh" 
                      size="x-small" 
                      variant="text" 
                      @click="fetchExchangeRate"
                    ></v-btn>
                  </template>
                </v-tooltip>
              </div>
              <div class="text-caption" v-if="lastUpdate">
                Última actualización: {{ new Date(lastUpdate).toLocaleString() }}
              </div>
            </v-alert>
          </div>
        </v-expand-transition>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="outlined" @click="close">Cancelar</v-btn>
        <v-btn 
          variant="elevated" 
          color="success" 
          @click="confirm" 
          :disabled="!isValidTotal" 
          :loading="loading"
          prepend-icon="mdi-check-circle"
        >
          Confirmar pago
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import api from '../api.js';

const props = defineProps({ bill: Object });
const emit = defineEmits(['paid', 'close', 'notify']);

const dialog = ref(false);
const providers = ref([]);
const payments = ref([]);
const exchangeRate = ref(0);
const lastUpdate = ref(null);
const paymentDate = ref(new Date().toISOString().split('T')[0]);
const showDatePicker = ref(false);
const loading = ref(false);

// Obtener tasa de cambio actual desde dolarapi.com
async function fetchExchangeRate() {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
    if (!response.ok) {
      throw new Error('Error al obtener el tipo de cambio');
    }
    const data = await response.json();
    // Usamos el valor de venta para las conversiones
    exchangeRate.value = data.venta;
    
    // Guardar la última actualización
    lastUpdate.value = new Date(data.fechaActualizacion);
  } catch (error) {
    console.error('Error al obtener tipo de cambio:', error);
    // En caso de error, usar un valor de respaldo
    exchangeRate.value = 500;
    emit('notify', {
      type: 'warning',
      message: 'No se pudo obtener el tipo de cambio actualizado. Usando valor de respaldo.'
    });
  }
}



// Obtener proveedores desde la API
async function fetchProviders() {
  try {
    const response = await api.get('/payment-methods');
    if (response.status === 200) {
      // Obtener las cuentas para mostrar información adicional
      const accountsResponse = await api.get('/accounts');
      const accounts = accountsResponse.data;
      
      providers.value = response.data.map(method => {
        // Buscar la cuenta asociada si existe
        const account = accounts.find(acc => acc.id === method.accountId);
        
        return {
          title: method.name + (account ? ` (${account.name})` : ''),
          value: method.id,
          description: method.description,
          icon: method.icon,
          account: account || null
        };
      });
    } else {
      emit('notify', {
        type: 'error',
        message: 'Error al obtener métodos de pago'
      });
    }
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    emit('notify', {
      type: 'error',
      message: 'Error al obtener métodos de pago'
    });
    // Valores por defecto en caso de error
    providers.value = [
      { title: 'Visa', value: '1' },
      { title: 'Mastercard', value: '2' },
      { title: 'MercadoPago', value: '3' },
      { title: 'Google Play', value: '4' },
      { title: 'MODO', value: '5' },
      { title: 'PayPal', value: '6' }
    ];
  }
}

watch(
  () => props.bill,
  async (b) => {
    dialog.value = !!b;
    if (b) {
      await fetchExchangeRate();
      await fetchProviders();
      paymentDate.value = new Date().toISOString().split('T')[0];
      
      // Intentar encontrar un método de pago preferido (el del servicio o uno con saldo suficiente)
      let preferredMethodId = '';
      
      if (b.Service?.paymentMethodId) {
        // Si el servicio tiene un método de pago configurado, usarlo como preferido
        preferredMethodId = b.Service.paymentMethodId;
      } else {
        // Buscar un método con saldo suficiente y en la misma moneda
        const methodWithSufficientBalance = providers.value.find(p => 
          p.account && 
          p.account.currency === b.currency && 
          p.account.balance >= b.amount
        );
        
        if (methodWithSufficientBalance) {
          preferredMethodId = methodWithSufficientBalance.value;
        }
      }
      
      payments.value = [{ 
        amount: b.amount, 
        currency: b.currency, // Se actualizará cuando se seleccione un método de pago
        paymentMethodId: preferredMethodId,
        exchangeRate: exchangeRate.value
      }];
      
      // Si se seleccionó un método, actualizar la moneda
      if (preferredMethodId) {
        updatePaymentMethodInfo(0);
      }
    } else {
      payments.value = [];
    }
  },
  { immediate: true }
);

const hasMultipleCurrencies = computed(() => {
  const currencies = new Set(payments.value.map(p => p.currency));
  return currencies.size > 1;
});

async function updateExchangeRate(index) {
  await fetchExchangeRate();
  payments.value[index].exchangeRate = exchangeRate.value;
}

const totalInBillCurrency = computed(() => {
  return payments.value.reduce((sum, p) => {
    if (p.currency === props.bill.currency) {
      return sum + Number(p.amount || 0);
    } else if (p.currency === 'USD' && props.bill.currency === 'ARS') {
      return sum + (Number(p.amount || 0) * p.exchangeRate);
    } else if (p.currency === 'ARS' && props.bill.currency === 'USD') {
      return sum + (Number(p.amount || 0) / p.exchangeRate);
    }
    return sum;
  }, 0);
});

const isValidTotal = computed(() => {
  return Math.abs(totalInBillCurrency.value - props.bill.amount) < 0.01;
});

const hasInsufficientFunds = computed(() => {
  return payments.value.some(payment => {
    if (!payment.paymentMethodId || payment.amount <= 0) return false;
    
    const paymentMethod = providers.value.find(p => p.value === payment.paymentMethodId);
    if (!paymentMethod?.account) return false;
    
    return !checkSufficientBalance(paymentMethod.account, payment);
  });
});

function addLine() {
  payments.value.push({ 
    amount: 0, 
    currency: props.bill.currency, // Se actualizará cuando se seleccione un método de pago
    paymentMethodId: '',
    exchangeRate: exchangeRate.value
  });
}

function remove(i) {
  payments.value.splice(i, 1);
}

function close() {
  dialog.value = false;
  emit('close');
}

function formatAmount(amount, currency) {
  return currency === 'USD' ? `USD ${Number(amount).toFixed(2)}` : `$${Number(amount).toFixed(2)}`;
}

function formatCurrency(amount, currency) {
  if (amount === null || amount === undefined) return 'No disponible';
  return currency === 'USD' ? `USD ${Number(amount).toFixed(2)}` : `$${Number(amount).toFixed(2)}`;
}

function getPaymentMethodAccount(paymentMethodId) {
  if (!paymentMethodId) return null;
  const method = providers.value.find(p => p.value === paymentMethodId);
  return method?.account || null;
}

function checkSufficientBalance(account, payment) {
  if (!account || account.balance === null || !payment?.amount) return true;
  
  // La moneda del pago debe ser la misma que la de la cuenta
  // Si el pago viene con una moneda diferente, necesitamos convertirla
  if (payment.currency && payment.currency !== account.currency) {
    // Monedas diferentes, necesitamos convertir
    if (payment.currency === 'USD' && account.currency === 'ARS') {
      // Calcular cuántos ARS necesitamos
      const amountInARS = payment.amount * exchangeRate.value;
      return account.balance >= amountInARS;
    } else if (payment.currency === 'ARS' && account.currency === 'USD') {
      // Calcular cuántos USD necesitamos
      const amountInUSD = payment.amount / exchangeRate.value;
      return account.balance >= amountInUSD;
    }
  } else {
    // Monedas iguales o no especificada, comparación directa
    return account.balance >= payment.amount;
  }
  return true;
}

function updatePaymentMethodInfo(index) {
  // Verificar si el método de pago seleccionado tiene una cuenta asociada
  const paymentMethodId = payments.value[index].paymentMethodId;
  const paymentMethod = providers.value.find(p => p.value === paymentMethodId);
  const payment = payments.value[index];
  
  // Actualizar la moneda según la cuenta asociada al método de pago
  if (paymentMethod?.account) {
    // Asignar la moneda de la cuenta al pago
    payments.value[index].currency = paymentMethod.account.currency;
  } else {
    // Si no hay cuenta asociada, usar la moneda de la factura
    payments.value[index].currency = props.bill?.currency || 'ARS';
  }
  
  // Actualizar la tasa de cambio si es necesario
  if (hasMultipleCurrencies.value) {
    updateExchangeRate(index);
  }
  
  // Sugerimos un método de pago con saldo suficiente si es posible
  if (paymentMethodId && payment.amount > 0) {
    const availableMethods = providers.value
      .filter(p => p.account && p.account.balance !== null)
      .sort((a, b) => {
        return b.account.balance - a.account.balance;
      });
    
    const bestMethod = availableMethods.find(p => 
      checkSufficientBalance(p.account, payment)
    );
    
    // Si el método seleccionado no tiene saldo suficiente pero hay otros que sí, sugerirlo
    if (paymentMethod?.account && !checkSufficientBalance(paymentMethod.account, payment) && bestMethod) {
      emit('notify', {
        type: 'info',
        message: `Sugerencia: El método ${bestMethod.title} tiene saldo suficiente para este pago.`
      });
    }
  }
  
  // Si la cuenta tiene saldo insuficiente, mostrar una advertencia
  if (paymentMethod?.account && paymentMethod.account.balance !== null) {
    const account = paymentMethod.account;
    
    if (!checkSufficientBalance(account, payment)) {
      emit('notify', {
        type: 'warning',
        message: `La cuenta ${account.name} no tiene saldo suficiente para este pago.`
      });
    }
  }
}

function suggestPaymentMethod() {
  // Solo actuamos si no hay suficiente saldo en los métodos de pago seleccionados
  const hasSufficientFunds = payments.value.every(payment => {
    if (!payment.paymentMethodId) return true; // No ha seleccionado método aún
    
    const paymentMethod = providers.value.find(p => p.value === payment.paymentMethodId);
    if (!paymentMethod?.account) return true; // No tiene cuenta asociada
    
    return checkSufficientBalance(paymentMethod.account, payment);
  });
  
  if (hasSufficientFunds) return;
  
  // Para cada pago que no tiene suficiente saldo, sugerir un método alternativo
  for (let i = 0; i < payments.value.length; i++) {
    const payment = payments.value[i];
    if (!payment.paymentMethodId || payment.amount <= 0) continue;
    
    const currentMethod = providers.value.find(p => p.value === payment.paymentMethodId);
    if (!currentMethod?.account || checkSufficientBalance(currentMethod.account, payment)) continue;
    
    // Buscar un método de pago alternativo con saldo suficiente
    const alternativeMethods = providers.value
      .filter(p => p.account && p.account.balance !== null)
      .filter(p => p.value !== payment.paymentMethodId)
      .filter(p => checkSufficientBalance(p.account, { ...payment, currency: p.account.currency }));
    
    if (alternativeMethods.length > 0) {
      // Ordenar por saldo disponible
      alternativeMethods.sort((a, b) => b.account.balance - a.account.balance);
      
      // Seleccionar el mejor método automáticamente
      payments.value[i].paymentMethodId = alternativeMethods[0].value;
      // Actualizar la moneda al cambiar el método de pago
      payments.value[i].currency = alternativeMethods[0].account.currency;
      
      emit('notify', {
        type: 'info',
        message: `Se ha seleccionado automáticamente ${alternativeMethods[0].title} para el pago ${i+1}`,
        timeout: 4000
      });
    }
  }
}

async function confirm() {
  if (!isValidTotal.value) return;
  
  loading.value = true;
  
  try {
    // Verificar si alguna cuenta no tiene saldo suficiente
    let insufficientFunds = false;
    let accountWithoutFunds = null;
    
    for (let i = 0; i < payments.value.length; i++) {
      const payment = payments.value[i];
      const paymentMethod = providers.value.find(p => p.value === payment.paymentMethodId);
      
      if (paymentMethod?.account && paymentMethod.account.balance !== null) {
        const account = paymentMethod.account;
        
        // Verificar si hay suficiente saldo
        if (!checkSufficientBalance(account, payment)) {
          insufficientFunds = true;
          accountWithoutFunds = account;
          break;
        }
      }
    }
    
    if (insufficientFunds) {
      emit('notify', {
        type: 'error',
        message: `La cuenta ${accountWithoutFunds.name} no tiene saldo suficiente para este pago.`,
        timeout: 5000
      });
      return;
    }
    
    // Validar que todos los pagos tengan un método de pago seleccionado
    const missingPaymentMethod = payments.value.some(p => !p.paymentMethodId);
    if (missingPaymentMethod) {
      emit('notify', {
        type: 'error',
        message: 'Selecciona un método de pago para cada línea de pago',
        timeout: 5000
      });
      return;
    }
    
    // Convertir la fecha seleccionada a ISO string
    const paidAt = new Date(paymentDate.value + 'T00:00:00').toISOString();
    
    const response = await api.put(`/bills/${props.bill.id}`, {
      status: 'paid',
      paidAt,
      payments: payments.value.map(p => ({
        ...p,
        paidAt
      }))
    });
    
    emit('notify', {
      type: 'success',
      message: `Factura pagada: ${props.bill?.name || ''} (${formatAmount(props.bill?.amount, props.bill?.currency)})`,
      timeout: 3000
    });
    emit('paid');
    close();
  } catch (error) {
    console.error('Error al registrar el pago:', error);
    emit('notify', {
      type: 'error',
      message: `Error al registrar el pago: ${error.response?.data?.message || error.message}`,
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
}

function getMethodCurrency(paymentMethodId) {
  if (!paymentMethodId) return props.bill?.currency || 'ARS';
  
  const method = providers.value.find(p => p.value === paymentMethodId);
  if (!method?.account) return props.bill?.currency || 'ARS';
  
  return method.account.currency;
}
</script>

