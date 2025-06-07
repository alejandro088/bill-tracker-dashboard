import db from '../db/mockDb.js';
import { v4 as uuidv4 } from 'uuid';

export const listBills = () => db.getBills();

export const getBillById = (id) => db.getBill(id);

export const addBill = (data) => {
  const bill = { id: uuidv4(), ...data };
  return db.addBill(bill);
};

export const updateBill = (id, data) => db.updateBill(id, data);

export const deleteBill = (id) => db.deleteBill(id);
