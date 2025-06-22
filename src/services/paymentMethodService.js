import prisma from '../db/prismaClient.js';

export const getAllPaymentMethods = async () => {
  return prisma.paymentMethods.findMany();
};

export const createPaymentMethod = async (data) => {
  return prisma.paymentMethods.create({ data });
};

export const updatePaymentMethod = async (id, data) => {
  return prisma.paymentMethods.update({
    where: { id },
    data,
  });
};

export const deletePaymentMethod = async (id) => {
  return prisma.paymentMethods.delete({
    where: { id },
  });
};
