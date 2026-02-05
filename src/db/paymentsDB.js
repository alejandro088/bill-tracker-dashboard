import prisma from './prismaClient.js';

export const addPayment = async (payment, userId = null) => {
  const { 
    billId, 
    amount, 
    currency, 
    exchangeRate, 
    paidAt, 
    paymentMethodId,
    category,
    description
  } = payment;

  const data = {
    amount: parseFloat(amount),
    currency,
    paymentMethodId,
    paidAt: paidAt || new Date(),
    category: category || null,
    description: description || null
  };

  if (exchangeRate) {
    data.exchangeRate = parseFloat(exchangeRate);
  }

  if (billId) {
    data.billId = billId; // ✅ corregido
  }

  if (userId) {
    data.userId = userId;
  } else if (payment.userId) {
    data.userId = payment.userId;
  }

  console.log('Adding payment with billId:', billId);
  console.log('🧾 Data to be created:', data);


  return prisma.payment.create({ data });
};


export const getPaymentsByName = async (name, userId = null) => {
  const where = {
    Bill: { Service: { name } },
    ...(userId && { userId })
  };

  const payments = await prisma.payment.findMany({
    where,
    include: { 
      Bill: { include: { Service: true } },
      PaymentMethods: true
    },
    orderBy: { paidAt: 'desc' }
  });

  // Aplicar la misma transformación que en getAllPayments
  return payments.map(payment => ({
    ...payment,
    category: payment.Bill?.Service?.category || payment.category,
    month: payment.paidAt.toISOString().substring(0, 7)
  }));
};

export const getAllPayments = async (userId = null) => {
  const where = {
    ...(userId && { userId })
  };

  const payments = await prisma.payment.findMany({
    where,
    include: { 
      Bill: { include: { Service: true } },
      PaymentMethods: true
    },
    orderBy: { paidAt: 'desc' }
  });

  // Transformar los pagos para que tengan una estructura consistente
  return payments.map(payment => {
    const isPaidBill = payment.Bill !== null;
    
    return {
      ...payment,
      // Para pagos sin factura, usar la categoría directa
      category: isPaidBill ? payment.Bill.Service.category : payment.category,
      // Generar un status basado en si es un pago único o de factura
      status: isPaidBill ? 'paid' : 'one-time',
      // Para la vista mensual necesitamos un formato consistente
      month: payment.paidAt.toISOString().substring(0, 7), // YYYY-MM
      // Agregar metadatos para la UI
      type: isPaidBill ? 'bill' : 'one-time',
      description: payment.description || (isPaidBill ? payment.Bill.Service.name : ''),
      serviceCategory: isPaidBill ? payment.Bill.Service.category : null,
      // Incluir información del método de pago
      paymentMethodName: payment.PaymentMethods?.name || 'Desconocido'
    };
  });
};

export const updatePayment = async (id, payment) => {
  const { amount, currency, exchangeRate, paidAt, paymentMethodId } = payment;
  return prisma.payment.update({
    where: { id },
    data: {
      amount,
      currency,
      exchangeRate,
      paidAt,
      paymentMethodId
    }
  });
};

export const deletePayment = async (id) => {
  return prisma.payment.delete({
    where: { id },
  });
};

// Obtener pagos por moneda
export const getPaymentsByCurrency = async (currency, userId = null) => {
  const where = { currency, ...(userId && { userId }) };
  return prisma.payment.findMany({
    where,
    include: { Bill: { include: { Service: true } } },
    orderBy: { paidAt: 'desc' }
  });
};

// Obtener el total de pagos por moneda en un rango de fechas
export const getTotalByDateRangeAndCurrency = async (startDate, endDate, currency, userId = null) => {
  const where = { currency, paidAt: { gte: startDate, lte: endDate }, ...(userId && { userId }) };
  const payments = await prisma.payment.findMany({ where });
  return payments.reduce((total, payment) => total + payment.amount, 0);
};
