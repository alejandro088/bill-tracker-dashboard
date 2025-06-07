import {
  getBills,
  getBillById as getBill,
  addBill as addBillToDb,
  updateBill as updateBillInDb,
  deleteBill as deleteBillFromDb
} from '../db/mockDB.js';
import { v4 as uuidv4 } from 'uuid';

export const listBills = () => getBills();

export const getBillById = (id) => getBill(id);

export const addBill = (data) => {
  const bill = { id: uuidv4(), ...data };
  return addBillToDb(bill);
};

export const updateBill = (id, data) => updateBillInDb(id, data);

export const deleteBill = (id) => deleteBillFromDb(id);

export const getUpcomingBills = () => {
  const now = new Date();
  const limit = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  return getBills().filter((bill) => {
    const due = new Date(bill.dueDate);
    return due >= now && due <= limit;
  });
};
