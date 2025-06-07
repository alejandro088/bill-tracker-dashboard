import prisma from '../db/prismaClient.js';
import { addPayment } from './paymentService.js';

const updateOverdueBills = async () => {
  await prisma.bill.updateMany({
    where: {
      dueDate: { lt: new Date() },
      NOT: { status: { in: ['paid', 'overdue'] } }
    },
    data: { status: 'overdue' }
  });
};

export const listBills = async (query = {}) => {
  await updateOverdueBills();
  const {
    search,
    category,
    status,
    paymentProvider,
    recurrence,
    sort = 'dueDate',
    page = 1,
    limit = 10
  } = query;

  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (category) where.category = category;
  if (status) where.status = status;
  if (paymentProvider) where.paymentProvider = paymentProvider;
  if (recurrence) where.recurrence = recurrence;

  const total = await prisma.bill.count({ where });
  const data = await prisma.bill.findMany({
    where,
    orderBy: { [sort]: 'asc' },
    skip: (page - 1) * limit,
    take: Number(limit)
  });

  return { total, page: Number(page), limit: Number(limit), data };
};

export const getBillById = async (id) => prisma.bill.findUnique({ where: { id } });

export const addBill = async (data) => {
  return prisma.bill.create({
    data: {
      status: 'pending',
      autoRenew: false,
      paymentProvider: data.paymentProvider || '',
      recurrence: data.recurrence || 'none',
      ...data
    }
  });
};

export const updateBill = async (id, data) => {
  const existing = await prisma.bill.findUnique({ where: { id } });
  if (!existing) return null;

  const updateData = { ...data };
  if (data.status === 'paid' && existing.status !== 'paid') {
    updateData.paidAt = new Date();
  }
  const updated = await prisma.bill.update({ where: { id }, data: updateData });
  let newBill = null;

  if (
    updated.category === 'subscriptions' &&
    updated.autoRenew &&
    data.status === 'paid' &&
    existing.status !== 'paid'
  ) {
    const due = new Date(updated.dueDate);
    switch (updated.recurrence) {
      case 'weekly':
        due.setDate(due.getDate() + 7);
        break;
      case 'bimonthly':
        due.setMonth(due.getMonth() + 2);
        break;
      case 'yearly':
        due.setFullYear(due.getFullYear() + 1);
        break;
      case 'monthly':
        due.setMonth(due.getMonth() + 1);
        break;
      default:
        break;
    }
    newBill = await prisma.bill.create({
      data: {
        name: updated.name,
        description: updated.description,
        amount: updated.amount,
        category: updated.category,
        dueDate: due,
        status: 'pending',
        autoRenew: updated.autoRenew,
        paymentProvider: updated.paymentProvider,
        recurrence: updated.recurrence || 'none'
      }
    });
  }

  if (data.status === 'paid' && existing.status !== 'paid') {
    addPayment({
      billId: updated.id,
      name: updated.name,
      amount: updated.amount,
      dueDate: updated.dueDate,
      paidAt: new Date().toISOString(),
      paymentProvider: updated.paymentProvider,
      recurrence: updated.recurrence || 'none'
    });
  }

  return { updated, newBill };
};

export const deleteBill = async (id) => {
  await prisma.bill.delete({ where: { id } });
  return true;
};

export const getUpcomingBills = async () => {
  const now = new Date();
  const limit = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  return prisma.bill.findMany({
    where: { dueDate: { gte: now, lte: limit } }
  });
};

export const getMonthlySummary = async () => {
  await updateOverdueBills();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const bills = await prisma.bill.findMany({
    where: { dueDate: { gte: start, lt: end } }
  });

  const summary = { paid: 0, pending: 0, overdue: 0 };
  bills.forEach((bill) => {
    summary[bill.status] += bill.amount;
  });
  return summary;
};
