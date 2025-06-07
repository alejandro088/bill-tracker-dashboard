import { addPayment as addPaymentToDb, getPaymentsByName } from '../db/paymentsDB.js';

export const addPayment = (payment) => addPaymentToDb(payment);

export const listPayments = (name) => getPaymentsByName(name);
