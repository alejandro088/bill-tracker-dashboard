import {
  addPayment as addPaymentToDb,
  getPaymentsByName,
  getAllPayments,
  updatePayment,
  deletePayment as removePayment
} from '../db/paymentsDB.js';
import prisma from '../db/prismaClient.js';

// Nueva función para actualizar el saldo de la cuenta al realizar un pago
const updateAccountBalance = async (paymentMethodId, amount, currency) => {
  if (!paymentMethodId) return;
  
  // Buscar el método de pago y la cuenta asociada
  const paymentMethod = await prisma.paymentMethods.findUnique({
    where: { id: paymentMethodId },
    include: { Account: true }
  });
  
  // Si el método de pago no tiene cuenta asociada, no hacemos nada
  if (!paymentMethod || !paymentMethod.Account) return;
  
  const account = paymentMethod.Account;
  
  // Si la cuenta no tiene saldo registrado, no podemos actualizar
  if (account.balance === null) return;
  
  // Si las monedas coinciden, simplemente restamos
  if (account.currency === currency) {
    await prisma.account.update({
      where: { id: account.id },
      data: { balance: account.balance - amount }
    });
  } else {
    // Si las monedas son diferentes, necesitamos una tasa de cambio
    // Por ahora, para simplificar, usaremos una tasa fija si no se proporciona
    // Idealmente, esto debería obtenerse de una API externa o configuración
    let exchangeRate = 500; // Tasa por defecto ARS/USD
    
    let newBalance;
    if (currency === 'USD' && account.currency === 'ARS') {
      // Convertir USD a ARS y restar
      newBalance = account.balance - (amount * exchangeRate);
    } else if (currency === 'ARS' && account.currency === 'USD') {
      // Convertir ARS a USD y restar
      newBalance = account.balance - (amount / exchangeRate);
    }
    
    await prisma.account.update({
      where: { id: account.id },
      data: { balance: newBalance }
    });
  }
};

export const addPayment = async (payment) => {
  const result = await addPaymentToDb(payment);
  
  // Si el pago tiene un método de pago asociado, actualizamos el saldo de la cuenta
  if (payment.paymentMethodId) {
    await updateAccountBalance(
      payment.paymentMethodId, 
      payment.amount, 
      payment.currency
    );
  }
  
  return result;
};

export const addOneTimePayment = async (paymentData) => {
  const { amount, currency, paymentMethodId, category, description } = paymentData;
  
  const payment = {
    amount,
    currency,
    paymentMethodId,
    category,
    description,
    paidAt: new Date(),
  };
  
  const result = await addPaymentToDb(payment);
  
  // Actualizar el saldo de la cuenta asociada al método de pago
  if (paymentMethodId) {
    await updateAccountBalance(paymentMethodId, amount, currency);
  }
  
  return result;
};

export const listPayments = async (filters = {}) => {
  const { name, year, currency, category, paymentMethodId } = filters;
  
  // Obtener pagos base (por nombre o todos)
  const payments = name ? await getPaymentsByName(name) : await getAllPayments();
  
  // Aplicar filtros
  return payments.filter(payment => {
    // Filtro por año
    if (year) {
      const paymentYear = new Date(payment.paidAt).getFullYear();
      if (paymentYear !== parseInt(year)) return false;
    }
    
    // Filtro por moneda
    if (currency && currency !== 'Todas') {
      if (payment.currency !== currency) return false;
    }
    
    // Filtro por categoría
    if (category && category !== 'Todas') {
      // Para pagos únicos, usar la categoría directa del pago
      const paymentCategory = payment.Bill?.Service?.category || payment.category;
      if (paymentCategory !== category) return false;
    }
    
    // Filtro por método de pago
    if (paymentMethodId && paymentMethodId !== 'Todas') {
      if (payment.paymentMethodId !== paymentMethodId) return false;
    }
    
    return true;
  });
};

export const getPaymentSummary = async (startDate, endDate) => {
  const payments = await getAllPayments();

  // Filter by date range if provided
  const filteredPayments = payments.filter(payment => {
    const paidAt = new Date(payment.paidAt);
    if (startDate && paidAt < startDate) return false;
    if (endDate && paidAt > endDate) return false;
    return true;
  });

  // Calculate total paid by currency
  const totalARS = filteredPayments
    .filter(payment => payment.currency === 'ARS')
    .reduce((sum, payment) => sum + payment.amount, 0);
    
  const totalUSD = filteredPayments
    .filter(payment => payment.currency === 'USD')
    .reduce((sum, payment) => sum + payment.amount, 0);
    
  // Calculate total paid (all currencies)
  const totalPaid = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  // Calculate monthly average
  let monthlyAverage = 0;
  if (filteredPayments.length > 0) {
    // Get the date range
    const dates = filteredPayments.map(p => new Date(p.paidAt));
    const minDate = startDate || new Date(Math.min(...dates));
    const maxDate = endDate || new Date(Math.max(...dates));

    // Calculate months difference
    const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
      (maxDate.getMonth() - minDate.getMonth()) + 1;

    monthlyAverage = totalPaid / (monthsDiff || 1); // Avoid division by zero
  }

  // Get most used payment method
  const methodCounts = {};
  filteredPayments.forEach(payment => {
    const methodId = payment.paymentMethodId || 'Unknown';
    methodCounts[methodId] = (methodCounts[methodId] || 0) + 1;
  });

  let mostUsedMethodId = 'None';
  let maxCount = 0;

  Object.entries(methodCounts).forEach(([methodId, count]) => {
    if (count > maxCount) {
      mostUsedMethodId = methodId;
      maxCount = count;
    }
  });

  // Calculate previous period comparison
  let previousPeriodComparison = 0;
  if (startDate && endDate) {
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(endDate.getTime() - periodLength);

    const previousPeriodPayments = payments.filter(payment => {
      const paidAt = new Date(payment.paidAt);
      return paidAt >= previousStartDate && paidAt <= previousEndDate;
    });

    const previousTotal = previousPeriodPayments.reduce((sum, payment) => sum + payment.amount, 0);

    if (previousTotal > 0) {
      previousPeriodComparison = ((totalPaid - previousTotal) / previousTotal) * 100;
    }
  }

  return {
    totalPaid,
    totalARS,
    totalUSD,
    monthlyAverage,
    mostUsedMethodId,
    previousPeriodComparison,
    paymentCount: filteredPayments.length
  };
};

export const editPayment = async (id, payment) => {
  return await updatePayment(id, payment);
};

export const deletePayment = async (id) => {
  return await removePayment(id);
};

export const getPaymentTrends = async (startDate, endDate) => {
  const payments = await getAllPayments();

  // Filter by date range if provided
  const filteredPayments = payments.filter(payment => {
    const paidAt = new Date(payment.paidAt);
    if (startDate && paidAt < startDate) return false;
    if (endDate && paidAt > endDate) return false;
    return true;
  });

  // Group payments by month for timeline chart
  const byMonth = {};
  filteredPayments.forEach(payment => {
    const date = new Date(payment.paidAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    byMonth[monthKey] = (byMonth[monthKey] || 0) + payment.amount;
  });

  // Sort months chronologically
  const sortedMonths = Object.keys(byMonth).sort();

  // Group payments by category
  const byCategory = {};
  filteredPayments.forEach(payment => {
    const category = payment.Bill?.Service?.category || payment.category || 'Unknown';
    byCategory[category] = (byCategory[category] || 0) + payment.amount;
  });

  // Group payments by payment method
  const byMethod = {};
  filteredPayments.forEach(payment => {
    const methodName = payment.PaymentMethods?.name || 'Unknown';
    byMethod[methodName] = (byMethod[methodName] || 0) + payment.amount;
  });

  return {
    timeline: {
      labels: sortedMonths,
      data: sortedMonths.map(month => byMonth[month])
    },
    categories: {
      labels: Object.keys(byCategory),
      data: Object.values(byCategory)
    },
    methods: {
      labels: Object.keys(byMethod),
      data: Object.values(byMethod)
    }
  };
};
