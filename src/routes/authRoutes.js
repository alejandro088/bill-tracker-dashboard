import express from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Registro y login de usuarios
router.post('/register', authController.register);
router.post('/login', authController.login);

// Devuelve info del usuario autenticado
router.get('/me', requireAuth, authController.me);

export default router;
