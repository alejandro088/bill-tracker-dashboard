import prisma from './prismaClient.js';

export const addPayment = async (payment) => {
  return prisma.payment.create({ data: payment });
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
