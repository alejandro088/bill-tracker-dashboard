import express from 'express';
import prisma from '../db/prismaClient.js';

const router = express.Router();

// Obtener todas las notificaciones
router.get('/', async (req, res) => {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(notifications);
});

// Crear una notificación
router.post('/', async (req, res) => {
  const { message } = req.body;
  const notification = await prisma.notification.create({
    data: { message }
  });
  res.status(201).json(notification);
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