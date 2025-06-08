import prisma from '../db/prismaClient.js';

export const listServices = async (query = {}) => {
  const { category, recurrence, paymentProvider } = query;
  const where = {};
  if (category) where.category = category;
  if (recurrence) where.recurrence = recurrence;
  if (paymentProvider) where.paymentProvider = paymentProvider;
  return prisma.service.findMany({ where, orderBy: { name: 'asc' } });
};

export const getServiceById = async (id) =>
  prisma.service.findUnique({
    where: { id },
    include: { bills: true }
  });
