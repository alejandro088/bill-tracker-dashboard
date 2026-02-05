import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from '../db/prismaClient.js';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'change-me';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const payload = jwt.verify(token, jwtSecret);
    // Verificar que el usuario exista en la base de datos
    const user = await prisma.user.findUnique({ where: { id: payload.userId } }).catch(() => null);
    if (!user) return res.status(401).json({ message: 'Invalid token: user not found' });
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } }).catch(() => null);
    if (user) req.user = payload;
  } catch (err) {
    // ignore invalid token for optional auth
  }
  next();
}

export default { requireAuth, optionalAuth };
