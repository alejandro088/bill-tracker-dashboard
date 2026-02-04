import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'change-me';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
  } catch (err) {
    // ignore invalid token for optional auth
  }
  next();
}

export default { requireAuth, optionalAuth };
