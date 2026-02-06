import prisma from '../db/prismaClient.js';

export const listNotifications = async (query = {}, userId = null) => {
  const {
    page = 1,
    pageSize = 10,
    read,
    type,
    search = '',
    dateFrom,
    dateTo
  } = query;

  const skip = (parseInt(page) - 1) * parseInt(pageSize);
  const take = parseInt(pageSize);

  let where = {};
  if (read !== undefined) where.read = read === 'true' || read === true;
  if (type) {
    const types = Array.isArray(type) ? type : [type];
    where.type = { in: types };
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { message: { contains: search } }
    ];
  }
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  if (userId) where.userId = userId;

  const total = await prisma.notification.count({ where });

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take
  });

  return {
    data: notifications,
    pagination: {
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / parseInt(pageSize))
    }
  };
};

export const getUnreadNotifications = async (limit = 100, userId = null) => {
  const take = parseInt(limit);
  const where = { read: false, ...(userId && { userId }) };
  return await prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take });
};

export const createNotification = async (data, userId = null) => {
  const { type, title, message, actionUrl } = data;
  const payload = { type, title, message, actionUrl, read: false, ...(userId && { userId }) };
  return await prisma.notification.create({ data: payload });
};

export const markAsRead = async (id, userId = null) => {
  const where = { id: Number(id), ...(userId && { userId }) };
  const result = await prisma.notification.updateMany({ where, data: { read: true } });
  return result;
};

export const markAllAsRead = async (type, userId = null) => {
  const where = { read: false };
  if (type) {
    const types = Array.isArray(type) ? type : [type];
    where.type = { in: types };
  }
  if (userId) where.userId = userId;
  return await prisma.notification.updateMany({ where, data: { read: true } });
};

export const patchMarkAsRead = async (id, userId = null) => {
  const where = { id: Number(id), ...(userId && { userId }) };
  const existing = await prisma.notification.findFirst({ where });
  if (!existing) return null;
  return await prisma.notification.update({ where: { id: Number(id) }, data: { read: true } });
};

export const deleteNotification = async (id, userId = null) => {
  const where = { id: Number(id), ...(userId && { userId }) };
  return await prisma.notification.deleteMany({ where });
};

export const clearReadNotifications = async (userId = null) => {
  const where = { read: true, ...(userId && { userId }) };
  return await prisma.notification.deleteMany({ where });
};

export const getUnreadCount = async (userId = null) => {
  const where = { read: false, ...(userId && { userId }) };
  const count = await prisma.notification.count({ where });
  return { count };
};

export async function getAllNotifications() {
  return await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' }
  });
}
