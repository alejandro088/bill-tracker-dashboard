import prisma from '../db/prismaClient.js';

export const getAllPaymentMethods = async (userId = null) => {
  const where = { ...(userId && { userId }) };
  return prisma.paymentMethods.findMany({ where });
};

export const createPaymentMethod = async (data, userId = null) => {
  const createData = { ...data, ...(userId && { userId }) };
  return prisma.paymentMethods.create({ data: createData });
};

export const updatePaymentMethod = async (id, data, userId = null) => {
  if (userId) {
    const existing = await prisma.paymentMethods.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new Error('Payment method not found');
    }
  }
  return prisma.paymentMethods.update({
    where: { id },
    data,
  });
};

export const deletePaymentMethod = async (id, userId = null) => {
  if (userId) {
    const existing = await prisma.paymentMethods.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new Error('Payment method not found');
    }
  }
  return prisma.paymentMethods.delete({
    where: { id },
  });
};
