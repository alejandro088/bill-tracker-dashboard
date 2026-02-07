import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import billRoutes from './routes/billRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import paymentMethodRoutes from './routes/paymentMethodRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import authRoutes from './routes/authRoutes.js';
import logger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import './reminder.js';
import '../notifier/cron.js';
import prisma from './db/prismaClient.js';

dotenv.config();

// ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import logger, { logError, logInfo } from './utils/logger.js';

prisma.$connect().catch((e) => {
  logError('Failed to connect to DB', e);
  process.exit(1);
});

const app = express();
app.use(express.json());

// En producción, no necesitamos CORS ya que servimos el frontend desde el mismo origen
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: process.env.FRONTEND_URL }));
}

app.use(logger);

// API routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/accounts', accountRoutes);
// Autenticación
app.use('/api/auth', authRoutes);

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Manejar rutas SPA - todas las rutas no-API sirven index.html
app.get('*', (req, res) => {
  // No redirigir las rutas de API
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
});

app.use(errorHandler);
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logInfo(`Server listening on port ${PORT}`);
  });
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
