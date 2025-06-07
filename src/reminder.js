import cron from 'node-cron';
import { getBills } from './db/mockDB.js';

const checkUpcoming = () => {
  const now = new Date();
  const limit = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const upcoming = getBills().filter((bill) => {
    const due = new Date(bill.dueDate);
    return due >= now && due <= limit;
  });

  if (upcoming.length) {
    console.log('Upcoming bills:', upcoming);
  }
};

cron.schedule('* * * * *', checkUpcoming);
