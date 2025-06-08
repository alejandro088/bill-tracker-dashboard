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
    serviceId,
    recurrence,
    sort = 'dueDate',
    page = 1,
    limit = 10
  } = query;

  const where = {};
  if (search) {
    where.OR = [
      { Service: { name: { contains: search, mode: 'insensitive' } } },
      { Service: { description: { contains: search, mode: 'insensitive' } } }
    ];
  }
  if (category) where.category = category;
  if (status) where.status = status;
  if (recurrence) where.recurrence = recurrence;
  if (serviceId) where.serviceId = serviceId;

  const total = await prisma.bill.count({ where });
  const data = await prisma.bill.findMany({
    where,
    orderBy: { [sort]: 'asc' },
    skip: (page - 1) * limit,
    take: Number(limit),
    include: { Service: true }
  });

  const mapped = data.map((b) => ({
    ...b,
    name: b.Service?.name,
    description: b.Service?.description,
    Service: undefined
  }));

  return { total, page: Number(page), limit: Number(limit), data: mapped };
};

export const getBillById = async (id) => {
  const bill = await prisma.bill.findUnique({
    where: { id },
    include: { Service: true }
  });
  if (!bill) return null;
  return { ...bill, name: bill.Service?.name, description: bill.Service?.description, Service: undefined };
};

export const addBill = async (data) => {
  let serviceId = data.serviceId;
  if (!serviceId) {
    let service = await prisma.service.findFirst({
      where: {
        name: data.name,
        category: data.category
      }
    });
    if (!service) {
      service = await prisma.service.create({
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          recurrence: data.recurrence || 'none',
          autoRenew: data.autoRenew ?? false
        }
      });
    }
      serviceId = service.id;
  }

  const { name, description, ...billData } = data;
  return prisma.bill.create({
    data: {
      status: 'pending',
      autoRenew: false,
      recurrence: data.recurrence || 'none',
      serviceId,
      ...billData
    }
  });
};

export const updateBill = async (id, data) => {
  const existing = await prisma.bill.findUnique({ where: { id } });
  if (!existing) return null;

  const { name, description, ...rest } = data;
  const updateData = { ...rest };
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
        serviceId: updated.serviceId,
        amount: updated.amount,
        category: updated.category,
        dueDate: due,
        status: 'pending',
        autoRenew: updated.autoRenew,
        recurrence: updated.recurrence || 'none'
      }
    });
  }

  if (data.status === 'paid' && existing.status !== 'paid') {
    await addPayment({
      billId: updated.id,
      amount: updated.amount,
      paidAt: new Date().toISOString(),
      paymentProvider: data.paymentProvider || 'unknown'
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
  const bills = await prisma.bill.findMany({
    where: { dueDate: { gte: now, lte: limit } },
    include: { Service: true }
  });
  return bills.map((b) => ({
    ...b,
    name: b.Service?.name,
    description: b.Service?.description,
    Service: undefined
  }));
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

export const getMonthlyStatusByMonth = async (year = new Date().getFullYear()) => {
  await updateOverdueBills();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const bills = await prisma.bill.findMany({
    where: { dueDate: { gte: start, lt: end } },
    select: { dueDate: true, status: true, amount: true }
  });
  const map = {};
  bills.forEach((b) => {
    const month = b.dueDate.toISOString().slice(0, 7);
    const key = `${month}-${b.status}`;
    if (!map[key]) map[key] = { month, status: b.status, total: 0, count: 0 };
    map[key].total += b.amount;
    map[key].count += 1;
  });
  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
};

export const getSummary = async () => {
  await updateOverdueBills();
  const grouped = await prisma.bill.groupBy({
    by: ['status'],
    _sum: { amount: true }
  });
  const summary = { paid: 0, pending: 0, overdue: 0 };
  grouped.forEach((g) => {
    summary[g.status] = g._sum.amount ?? 0;
  });
  return summary;
};
