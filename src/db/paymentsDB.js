import prisma from './prismaClient.js';

export const addPayment = async (payment) => {
  const { billId, amount, currency, exchangeRate, paidAt, paymentProvider } = payment;
  return prisma.payment.create({
    data: {
      Bill: { connect: { id: billId } },
      amount,
      currency,
      exchangeRate,
      paidAt,
      paymentProvider
    }
  });
};

export const getPaymentsByName = async (name) => {
  return prisma.payment.findMany({
    where: {
      Bill: {
        Service: { name }
      }
    },
    include: { Bill: { include: { Service: true } } },
    orderBy: { paidAt: 'desc' }
  });
};

export const getAllPayments = async () =>
  prisma.payment.findMany({
    include: { Bill: { include: { Service: true } } },
    orderBy: { paidAt: 'desc' }
  });

export const updatePayment = async (id, payment) => {
  const { amount, currency, exchangeRate, paidAt, paymentProvider } = payment;
  return prisma.payment.update({
    where: { id },
    data: {
      amount,
      currency,
      exchangeRate,
      paidAt,
      paymentProvider
    }
  });
};

export const deletePayment = async (id) => {
  return prisma.payment.delete({
    where: { id },
  });
};

// Obtener pagos por moneda
export const getPaymentsByCurrency = async (currency) => {
  return prisma.payment.findMany({
    where: { currency },
    include: { Bill: { include: { Service: true } } },
    orderBy: { paidAt: 'desc' }
  });
};

// Obtener el total de pagos por moneda en un rango de fechas
export const getTotalByDateRangeAndCurrency = async (startDate, endDate, currency) => {
  const payments = await prisma.payment.findMany({
    where: {
      currency,
      paidAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });
  
  return payments.reduce((total, payment) => total + payment.amount, 0);
};
