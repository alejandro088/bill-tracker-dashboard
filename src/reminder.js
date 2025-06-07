import cron from 'node-cron';
import prisma from './db/prismaClient.js';

const checkUpcoming = async () => {
  const now = new Date();
  const limit = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const upcoming = await prisma.bill.findMany({
    where: { dueDate: { gte: now, lte: limit } }
  });
  if (upcoming.length) {
    console.log('Upcoming bills:', upcoming);
  }
};

cron.schedule('* * * * *', checkUpcoming);
