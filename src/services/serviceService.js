import prisma from '../db/prismaClient.js';

export const listServices = async () =>
  prisma.service.findMany({ orderBy: { name: 'asc' } });

export const getServiceById = async (id) =>
  prisma.service.findUnique({
    where: { id },
    include: { bills: true }
  });
