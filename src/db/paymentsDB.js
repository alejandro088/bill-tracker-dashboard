import prisma from './prismaClient.js';

export const addPayment = async (payment) => {
  const { billId, amount, paidAt, paymentProvider } = payment;
  return prisma.payment.create({
    data: {
      Bill: { connect: { id: billId } },
      amount,
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
  const { amount, paidAt, paymentProvider } = payment;
  return prisma.payment.update({
    where: { id },
    data: {
      amount,
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
