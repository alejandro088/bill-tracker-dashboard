import {
  addPayment as addPaymentToDb,
  getPaymentsByName,
  getAllPayments
} from '../db/paymentsDB.js';

export const addPayment = (payment) => addPaymentToDb(payment);

export const listPayments = (name) => {
  const data = name ? getPaymentsByName(name) : getAllPayments();
  return [...data].sort(
    (a, b) => new Date(b.paidAt) - new Date(a.paidAt)
  );
};
