import prisma from '../db/prismaClient.js';
import { createNotification } from './notificationService.js';

export const listServices = async (query = {}) => {
  const { category, recurrence, paymentProvider, dueSoon } = query;
  const where = { archived: false };
  if (category) where.category = category;
  if (recurrence) where.recurrence = recurrence;
  if (paymentProvider) where.paymentProvider = paymentProvider;
  if (dueSoon) {
    const soon = new Date();
    soon.setDate(soon.getDate() + Number(dueSoon));
    where.bills = {
      some: {
        status: { not: 'paid' },
        dueDate: { lte: soon }
      }
    };
  }
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
    include: { bills: { include: { payments: true } } }
  });

export const updateService = async (id, data) => {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) return null;
  return prisma.service.update({ where: { id }, data });
};

export const createService = async (data) => {
  const service = await prisma.service.create({ data });
  await createNotification(`Nuevo servicio registrado: ${service.name}`);
  return service;
};
