import {
  addPayment as addPaymentToDb,
  getPaymentsByName,
  getAllPayments
} from '../db/paymentsDB.js';

export const addPayment = async (payment) => addPaymentToDb(payment);

export const listPayments = async (name) =>
  name ? getPaymentsByName(name) : getAllPayments();
