import prisma from '../db/prismaClient.js';

export async function createNotification(message, userId) {
  if (!userId) throw new Error('userId is required to create notification');
  return await prisma.notification.create({
      data: {
          message,
          read: false,
          title: 'New Invoice',
          userId
      },
  });
}

export async function markAsRead(id) {
  return await prisma.notification.update({
    where: { id },
    data: { read: true }
  });
}

export async function getUnreadNotifications() {
  return await prisma.notification.findMany({
    where: { read: false },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getAllNotifications() {
  return await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' }
  });
}
