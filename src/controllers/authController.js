import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import prisma from '../db/prismaClient.js';
import handleControllerError from '../utils/handleControllerError.js';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'change-me';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

export async function register(req, res) {
  const { username, email, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'username and password required' });

  const existing = await prisma.user.findUnique({ where: { username } }).catch(() => null);
  if (existing) return res.status(409).json({ message: 'username already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { username, email, passwordHash } });
  return res.status(201).json({ id: user.id, username: user.username, email: user.email });
}

export async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'username and password required' });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });
  return res.json({ token, expiresIn: jwtExpiresIn });
}

export default { register, login };

export async function me(req, res) {
  // `requireAuth` middleware sets `req.user` when token is valid
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  // Optionally, fetch fresh user data from DB
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (e) {
    return handleControllerError(res, e);
  }
}

