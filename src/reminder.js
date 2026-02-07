import cron from 'node-cron';
import prisma from './db/prismaClient.js';
import { logInfo } from './utils/logger.js';

const checkUpcoming = async () => {
  const now = new Date();
  const limit = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const upcoming = await prisma.bill.findMany({
    where: { dueDate: { gte: now, lte: limit } }
  });
  if (upcoming.length) {
    logInfo(`Found ${upcoming.length} upcoming bills`, { count: upcoming.length });
  }
};

cron.schedule('* * * * *', checkUpcoming);
