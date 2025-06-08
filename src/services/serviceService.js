import prisma from '../db/prismaClient.js';

export const listServices = async (query = {}) => {
  const { category, recurrence, paymentProvider } = query;
  const where = {};
  if (category) where.category = category;
  if (recurrence) where.recurrence = recurrence;
  if (paymentProvider) where.paymentProvider = paymentProvider;
  const services = await prisma.service.findMany({
    where,
    orderBy: { name: 'asc' },
    include: { bills: { orderBy: { dueDate: 'desc' }, take: 1 } }
  });
  return services.map((s) => ({ ...s, lastBill: s.bills[0] || null, bills: undefined }));
};

export const getServiceById = async (id) =>
  prisma.service.findUnique({
    where: { id },
    include: { bills: true }
  });

export const updateService = async (id, data) => {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) return null;
  return prisma.service.update({ where: { id }, data });
};
