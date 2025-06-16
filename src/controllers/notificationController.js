const { prisma } = require('../db/prismaClient');

async function getNotifications(req, res) {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limitar a las 50 notificaciones más recientes
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
}

async function markAsRead(req, res) {
  const { id } = req.params;
  
  try {
    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ error: 'Error al marcar notificación como leída' });
  }
}

async function markAllAsRead(req, res) {
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
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
