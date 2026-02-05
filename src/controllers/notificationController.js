import prisma from '../db/prismaClient.js';

export const listNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      read,
      type,
      search = '',
      dateFrom,
      dateTo
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    let where = {};
    if (read !== undefined) where.read = read === 'true';
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

    if (req.user?.userId) where.userId = req.user.userId;

    const total = await prisma.notification.count({ where });

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    res.json({
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / parseInt(pageSize))
      }
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

export const getUnreadNotifications = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const take = parseInt(limit);
    const where = { read: false };
    if (req.user?.userId) where.userId = req.user.userId;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones no leídas' });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { type, title, message, actionUrl } = req.body;
    const data = { type, title, message, actionUrl, read: false };
    if (req.user?.userId) data.userId = req.user.userId;

    const notification = await prisma.notification.create({ data });
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({ error: 'Error al crear notificación' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const where = { id: Number(id) };
    if (req.user?.userId) where.userId = req.user.userId;

    const result = await prisma.notification.updateMany({ where, data: { read: true } });
    if (result.count === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ error: 'Error al marcar notificación como leída' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const { type } = req.query;
    const where = { read: false };
    if (type) {
      const types = Array.isArray(type) ? type : [type];
      where.type = { in: types };
    }
    if (req.user?.userId) where.userId = req.user.userId;

    await prisma.notification.updateMany({ where, data: { read: true } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({ error: 'Error al marcar todas las notificaciones como leídas' });
  }
};

export const patchMarkAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const where = { id: Number(id) };
    if (req.user?.userId) where.userId = req.user.userId;

    const existing = await prisma.notification.findFirst({ where });
    if (!existing) return res.status(404).json({ error: 'Notification not found' });

    const notification = await prisma.notification.update({ where: { id: Number(id) }, data: { read: true } });
    res.json(notification);
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ error: 'Error al marcar notificación como leída' });
  }
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    const where = { id: Number(id) };
    if (req.user?.userId) where.userId = req.user.userId;

    const result = await prisma.notification.deleteMany({ where });
    if (result.count === 0) return res.status(404).json({ error: 'Notification not found' });
    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
};

export const clearReadNotifications = async (req, res) => {
  try {
    const where = { read: true };
    if (req.user?.userId) where.userId = req.user.userId;

    await prisma.notification.deleteMany({ where });
    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar notificaciones leídas:', error);
    res.status(500).json({ error: 'Error al eliminar notificaciones leídas' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const where = { read: false };
    if (req.user?.userId) where.userId = req.user.userId;

    const count = await prisma.notification.count({ where });
    res.json({ count });
  } catch (error) {
    console.error('Error al obtener conteo de notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener conteo de notificaciones' });
  }
};
