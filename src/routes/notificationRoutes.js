import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listNotifications,
  getUnreadNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  patchMarkAsRead,
  deleteNotification,
  clearReadNotifications,
  getUnreadCount
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', requireAuth, listNotifications);
router.get('/unread', requireAuth, getUnreadNotifications);
router.post('/', requireAuth, createNotification);
router.post('/:id/read', requireAuth, markAsRead);
router.post('/read-all', requireAuth, markAllAsRead);
router.patch('/:id/read', requireAuth, patchMarkAsRead);
router.delete('/:id', requireAuth, deleteNotification);
router.delete('/clear-read', requireAuth, clearReadNotifications);
router.get('/unread-count', requireAuth, getUnreadCount);

export default router;
