import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import billRoutes from './routes/billRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import logger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import './reminder.js';
import prisma from './db/prismaClient.js';

dotenv.config();

prisma.$connect().catch((e) => {
  console.error('Failed to connect to DB', e);
  process.exit(1);
});

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(logger);

app.use('/bills', billRoutes);
app.use('/payments', paymentRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
