import * as notificationService from '../services/notificationService.js';
import handleControllerError from '../utils/handleControllerError.js';

export const listNotifications = async (req, res) => {
  try {
    const result = await notificationService.listNotifications(req.query, req.user?.userId);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return handleControllerError(res, error);
  }
};

export const getUnreadNotifications = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const notifications = await notificationService.getUnreadNotifications(limit, req.user?.userId);
    res.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    return handleControllerError(res, error);
  }
};

export const createNotification = async (req, res) => {
  try {
    const notification = await notificationService.createNotification(req.body, req.user?.userId);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return handleControllerError(res, error);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notificationService.markAsRead(id, req.user?.userId);
    if (result.count === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return handleControllerError(res, error);
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const { type } = req.query;
    await notificationService.markAllAsRead(type, req.user?.userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    return handleControllerError(res, error);
  }
};

export const patchMarkAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.patchMarkAsRead(id, req.user?.userId);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return handleControllerError(res, error);
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notificationService.deleteNotification(id, req.user?.userId);
    if (result.count === 0) return res.status(404).json({ error: 'Notification not found' });
    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    return handleControllerError(res, error);
  }
};

export const clearReadNotifications = async (req, res) => {
  try {
    await notificationService.clearReadNotifications(req.user?.userId);
    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar notificaciones leídas:', error);
    return handleControllerError(res, error);
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const result = await notificationService.getUnreadCount(req.user?.userId);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener conteo de notificaciones:', error);
    return handleControllerError(res, error);
  }
};
