import cron from 'node-cron';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getUpcomingBills } from '../src/services/billService.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS
  }
});

export const notifyUpcomingBills = async () => {
  try {
    const bills = await getUpcomingBills();
    if (!bills.length) {
      console.log('No upcoming bills to notify.');
      return;
    }

    const list = bills
      .map((b) => {
        const url = `${process.env.FRONTEND_URL}/services/${b.serviceId}`;
        const amount = `$${b.amount.toLocaleString('es-AR')}`;
        const due = new Date(b.dueDate).toLocaleDateString('es-AR');
        return `Servicio: ${b.name}<br/>Monto: ${amount}<br/>Vence: ${due}<br/><a href="${url}">🔗 Ver factura → ${url}</a>`;
      })
      .join('<br/><br/>');

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: '📬 Recordatorio: Facturas próximas a vencer',
      html: list
    });
    console.log('Upcoming bills notification sent.');
  } catch (err) {
    console.error('Error sending notification', err);
  }
};

cron.schedule('0 9 * * *', notifyUpcomingBills);

if (process.argv[1] === new URL('', import.meta.url).pathname) {
  notifyUpcomingBills().then(() => process.exit(0)).catch(() => process.exit(1));
}
