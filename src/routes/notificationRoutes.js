import express from 'express';
import prisma from '../db/prismaClient.js';

const router = express.Router();

// Obtener todas las notificaciones
router.get('/', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50 // Limitar a las 50 notificaciones más recientes
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
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
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({ error: 'Error al marcar todas las notificaciones como leídas' });
  }
});

// Marcar como leída
router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;
  const notification = await prisma.notification.update({
    where: { id: Number(id) },
    data: { read: true }
  });
  res.json(notification);
});

// Eliminar notificación
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.notification.delete({ where: { id: Number(id) } });
  res.status(204).end();
});

export default router;