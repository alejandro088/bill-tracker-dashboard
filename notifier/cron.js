import cron from 'node-cron';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import prisma from '../src/db/prismaClient.js';
import { getUpcomingBills } from '../src/services/billService.js';
import { logInfo, logError, logDebug } from '../src/utils/logger.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS
  }
});

// TTL to avoid sending multiple reminders for the same bill within X hours
const REMINDER_TTL_HOURS = Number(process.env.REMINDER_TTL_HOURS || 24);

export const notifyUpcomingBills = async () => {
  try {
    // Fetch users with reminders enabled
    const users = await prisma.user.findMany({ where: { reminderEnabled: true, email: { not: null } } });
    if (!users.length) {
      logInfo('No users with reminders enabled.');
      return;
    }

    const now = new Date();
    for (const user of users) {
      try {
        const windowDays = user.reminderWindowDays || 3;
        const bills = await getUpcomingBills(user.id, windowDays);
        if (!bills.length) {
          logDebug('No upcoming bills for user', { userId: user.id });
          continue;
        }

        // Filter out bills that were notified recently
        const recentCutoff = new Date(now.getTime() - REMINDER_TTL_HOURS * 60 * 60 * 1000);
        const billsToNotify = [];
        for (const b of bills) {
          const already = await prisma.reminderLog.findFirst({
            where: { billId: b.id, userId: user.id, sentAt: { gte: recentCutoff } }
          });
          if (!already) billsToNotify.push(b);
        }

        if (!billsToNotify.length) {
          logDebug('No new bills to notify for user after filtering recent logs', { userId: user.id });
          continue;
        }

        // Build mail content grouped for the user
        const list = billsToNotify
          .map((b) => {
            logDebug('Processing bill for notification', { billId: b.id, service: b.Service?.name });
            const url = `${process.env.FRONTEND_URL}/services/${b.serviceId}`;
            const amount = `$${Number(b.amount).toLocaleString('es-AR')}`;
            const due = new Date(b.dueDate).toLocaleDateString('es-AR');
            return `Servicio: ${b.Service?.name || 'Servicio'}<br/>Monto: ${amount}<br/>Vence: ${due}<br/><a href="${url}">🔗 Ver factura → ${url}</a>`;
          })
          .join('<br/><br/>');

        const subject = `📬 Recordatorio: ${billsToNotify.length} factura(s) próximas a vencer`;

        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject,
          html: list
        });

        // Log reminder entries
        const createLogs = billsToNotify.map(b => ({ billId: b.id, userId: user.id, channel: user.reminderChannel || 'email' }));
        for (const entry of createLogs) {
          await prisma.reminderLog.create({ data: entry });
        }

        logInfo('Upcoming bills notification sent to user.', { userId: user.id, billsCount: billsToNotify.length });
      } catch (errUser) {
        logError('Error notifying user about upcoming bills', errUser, { userId: user.id });
      }
    }
  } catch (err) {
    logError('Error sending notifications', err);
  }
};

cron.schedule('0 9 * * *', notifyUpcomingBills);

if (process.argv[1] === new URL('', import.meta.url).pathname) {
  notifyUpcomingBills().then(() => process.exit(0)).catch(() => process.exit(1));
}
