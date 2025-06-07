import { describe, it, expect, beforeEach, vi } from 'vitest';

var prismaMock;
vi.mock('../../src/db/prismaClient.js', () => {
  prismaMock = {
    bill: {
      updateMany: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      groupBy: vi.fn()
    },
    payment: { create: vi.fn() }
  };
  return { default: prismaMock };
});
var addPaymentMock;
vi.mock('../../src/services/paymentService.js', () => {
  addPaymentMock = vi.fn();
  return { addPayment: addPaymentMock };
});

import * as billService from '../../src/services/billService.js';
import { addPayment } from '../../src/services/paymentService.js';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('listBills', () => {
  it('returns paginated bills with filters', async () => {
    prismaMock.bill.count.mockResolvedValue(1);
    prismaMock.bill.findMany.mockResolvedValue([{ id: '1' }]);
    const result = await billService.listBills({ category: 'utilities', page: 2, limit: 5 });
    expect(prismaMock.bill.updateMany).toHaveBeenCalled();
    expect(prismaMock.bill.findMany).toHaveBeenCalledWith({
      where: { category: 'utilities' },
      orderBy: { dueDate: 'asc' },
      skip: 5,
      take: 5
    });
    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(result.data[0].id).toBe('1');
  });
});

describe('addBill', () => {
  it('creates bill with defaults', async () => {
    prismaMock.bill.create.mockResolvedValue({ id: '1', status: 'pending' });
    const data = { name: 'Test', amount: 5, dueDate: new Date() };
    const bill = await billService.addBill(data);
    expect(prismaMock.bill.create).toHaveBeenCalled();
    expect(bill.id).toBe('1');
  });
});

describe('getBillById', () => {
  it('finds bill by id', async () => {
    prismaMock.bill.findUnique.mockResolvedValue({ id: '1' });
    const bill = await billService.getBillById('1');
    expect(prismaMock.bill.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(bill.id).toBe('1');
  });
});

describe('updateBill', () => {
  it('returns null when bill not found', async () => {
    prismaMock.bill.findUnique.mockResolvedValue(null);
    const res = await billService.updateBill('x', {});
    expect(res).toBeNull();
  });

  it('creates payment and new bill when auto renew subscription paid', async () => {
    const existing = { id: '1', status: 'pending', dueDate: new Date('2024-01-01'), category: 'subscriptions' };
    const updated = { ...existing, status: 'paid', autoRenew: true, recurrence: 'monthly' };
    prismaMock.bill.findUnique.mockResolvedValue(existing);
    prismaMock.bill.update.mockResolvedValue(updated);
    const newBill = { id: '2' };
    prismaMock.bill.create.mockResolvedValue(newBill);
    const result = await billService.updateBill('1', { status: 'paid' });
    expect(addPayment).toHaveBeenCalled();
    expect(prismaMock.bill.create).toHaveBeenCalled();
    expect(result.newBill).toEqual(newBill);
  });

  it('only records payment when not subscription', async () => {
    const existing = { id: '1', status: 'pending', dueDate: new Date(), category: 'utilities' };
    const updated = { ...existing, status: 'paid', autoRenew: false };
    prismaMock.bill.findUnique.mockResolvedValue(existing);
    prismaMock.bill.update.mockResolvedValue(updated);
    const result = await billService.updateBill('1', { status: 'paid' });
    expect(addPayment).toHaveBeenCalled();
    expect(result.newBill).toBeNull();
  });
});

describe('deleteBill', () => {
  it('deletes by id', async () => {
    prismaMock.bill.delete.mockResolvedValue(true);
    const res = await billService.deleteBill('1');
    expect(prismaMock.bill.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(res).toBe(true);
  });
});

describe('getUpcomingBills', () => {
  it('queries next 3 days', async () => {
    const now = new Date('2024-01-01T00:00:00Z');
    vi.setSystemTime(now);
    prismaMock.bill.findMany.mockResolvedValue([]);
    await billService.getUpcomingBills();
    const limit = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    expect(prismaMock.bill.findMany).toHaveBeenCalledWith({ where: { dueDate: { gte: now, lte: limit } } });
    vi.useRealTimers();
  });
});

