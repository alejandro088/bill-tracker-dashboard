import prisma from './prismaClient.js';

export const addPayment = async (payment) => {
  return prisma.payment.create({ data: payment });
};

export const getPaymentsByName = async (name) => {
  return prisma.payment.findMany({
    where: { name },
    orderBy: { paidAt: 'desc' }
  });
};

export const getAllPayments = async () =>
  prisma.payment.findMany({ orderBy: { paidAt: 'desc' } });
