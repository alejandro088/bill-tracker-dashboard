import express from 'express';
import prisma from '../db/prismaClient.js';

const router = express.Router();

// Obtener notificaciones con paginación y filtros
router.get('/', async (req, res) => {
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
    
    // Construir filtros
    let where = {};
    
    // Filtro por estado de lectura
    if (read !== undefined) {
      where.read = read === 'true';
    }
    
    // Filtro por tipo
    if (type) {
      const types = Array.isArray(type) ? type : [type];
      where.type = { in: types };
    }
    
    // Filtro por búsqueda en título o mensaje
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { message: { contains: search } }
      ];
    }
    
    // Filtro por rango de fechas
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    
    // Contar total para la paginación
    const total = await prisma.notification.count({ where });
    
    // Obtener notificaciones
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
});

// Obtener solo notificaciones no leídas
router.get('/unread', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const take = parseInt(limit);
    
    const notifications = await prisma.notification.findMany({
      where: { read: false },
      orderBy: { createdAt: 'desc' },
      take
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones no leídas' });
  }
});

// Crear una notificación
router.post('/', async (req, res) => {
  try {
    const { type, title, message, actionUrl } = req.body;
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        actionUrl,
        read: false
      }
    });
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({ error: 'Error al crear notificación' });
  }
});

// Marcar una notificación como leída
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ error: 'Error al marcar notificación como leída' });
  }
});

// Marcar todas las notificaciones como leídas
router.post('/read-all', async (req, res) => {
  try {
    // Opcionalmente filtrar por tipo
    const { type } = req.query;
    const where = { read: false };
    
    if (type) {
      const types = Array.isArray(type) ? type : [type];
      where.type = { in: types };
    }
    
    await prisma.notification.updateMany({
      where,
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({ error: 'Error al marcar todas las notificaciones como leídas' });
  }
});

// Marcar como leída (alternativa con PATCH)
router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await prisma.notification.update({
      where: { id: Number(id) },
      data: { read: true }
    });
    res.json(notification);
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ error: 'Error al marcar notificación como leída' });
  }
});

// Eliminar notificación
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.notification.delete({ where: { id: Number(id) } });
    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
});

// Eliminar todas las notificaciones leídas
router.delete('/clear-read', async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { read: true }
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar notificaciones leídas:', error);
    res.status(500).json({ error: 'Error al eliminar notificaciones leídas' });
  }
});

// Obtener conteo de notificaciones no leídas
router.get('/unread-count', async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { read: false }
    });
    res.json({ count });
  } catch (error) {
    console.error('Error al obtener conteo de notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener conteo de notificaciones' });
  }
});

export default router;