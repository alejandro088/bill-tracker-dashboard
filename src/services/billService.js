import {
  getBills,
  getBillById as getBill,
  addBill as addBillToDb,
  updateBill as updateBillInDb,
  deleteBill as deleteBillFromDb
} from '../db/mockDB.js';
import { v4 as uuidv4 } from 'uuid';
import { addPayment } from './paymentService.js';

const updateOverdueBills = () => {
  const now = new Date();
  getBills().forEach((bill) => {
    if (
      bill.status !== 'paid' &&
      new Date(bill.dueDate) < now &&
      bill.status !== 'overdue'
    ) {
      bill.status = 'overdue';
    }
  });
};

export const listBills = (query = {}) => {
  updateOverdueBills();
  let data = [...getBills()];

  const {
    search,
    category,
    status,
    paymentProvider,
    sort = 'dueDate',
    page = 1,
    limit = 10
  } = query;

  if (search) {
    const term = search.toLowerCase();
    data = data.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        (b.description && b.description.toLowerCase().includes(term))
    );
  }

  if (category) {
    data = data.filter((b) => b.category === category);
  }

  if (status) {
    data = data.filter((b) => b.status === status);
  }

  if (paymentProvider) {
    data = data.filter(
      (b) =>
        b.paymentProvider &&
        b.paymentProvider.toLowerCase() === paymentProvider.toLowerCase()
    );
  }

  data.sort((a, b) => {
    if (!a[sort] || !b[sort]) return 0;
    return new Date(a[sort]) - new Date(b[sort]);
  });

  const start = (page - 1) * limit;
  const end = start + Number(limit);
  const paginated = data.slice(start, end);

  return {
    total: data.length,
    page: Number(page),
    limit: Number(limit),
    data: paginated
  };
};

export const getBillById = (id) => getBill(id);

export const addBill = (data) => {
  const bill = {
    id: uuidv4(),
    status: 'pending',
    autoRenew: false,
    paymentProvider: data.paymentProvider || '',
    ...data
  };
  return addBillToDb(bill);
};

export const updateBill = (id, data) => {
  const existing = getBill(id);
  if (!existing) return null;

  const prevStatus = existing.status;
  const updated = updateBillInDb(id, data);
  let newBill = null;

  if (
    updated &&
    updated.category === 'subscriptions' &&
    updated.autoRenew &&
    data.status === 'paid' &&
    prevStatus !== 'paid'
  ) {
    const due = new Date(updated.dueDate);
    due.setMonth(due.getMonth() + 1);
    newBill = {
      id: uuidv4(),
      name: updated.name,
      description: updated.description,
      amount: updated.amount,
      category: updated.category,
      dueDate: due.toISOString(),
      status: 'pending',
      autoRenew: updated.autoRenew,
      paymentProvider: updated.paymentProvider
    };
    addBillToDb(newBill);
  }

  if (updated && data.status === 'paid' && prevStatus !== 'paid') {
    addPayment({
      billId: updated.id,
      name: updated.name,
      amount: updated.amount,
      dueDate: updated.dueDate,
      paidDate: new Date().toISOString()
    });
  }

  return { updated, newBill };
};

export const deleteBill = (id) => deleteBillFromDb(id);

export const getUpcomingBills = () => {
  const now = new Date();
  const limit = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  return getBills().filter((bill) => {
    const due = new Date(bill.dueDate);
    return due >= now && due <= limit;
  });
};

export const getMonthlySummary = () => {
  updateOverdueBills();
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const summary = { paid: 0, pending: 0, overdue: 0 };

  getBills().forEach((bill) => {
    const due = new Date(bill.dueDate);
    if (due.getMonth() === month && due.getFullYear() === year) {
      summary[bill.status] += bill.amount;
    }
  });

  return summary;
};
