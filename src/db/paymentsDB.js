import prisma from './prismaClient.js';

export const addPayment = async (payment) => {
  console.log(payment);
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

export const updatePayment = async (id, payment) => {
  console.log(id, payment);
  return prisma.payment.update({
    where: { id },
    data: payment,
  });
};

export const deletePayment = async (id) => {
  return prisma.payment.delete({
    where: { id },
  });
};
