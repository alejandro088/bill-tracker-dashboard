import {
  addPayment as addPaymentToDb,
  getPaymentsByName,
  getAllPayments
} from '../db/paymentsDB.js';

export const addPayment = (payment) => addPaymentToDb(payment);

export const listPayments = (name) =>
  name ? getPaymentsByName(name) : getAllPayments();
