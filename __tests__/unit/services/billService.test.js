import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/db/prismaClient.js', () => ({
  default: {
    bill: {
      updateMany: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn()
    },
    service: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn()
    }
  }
}));

jest.unstable_mockModule('../../../src/services/paymentService.js', () => ({
  addPayment: jest.fn()
}));

const prisma = (await import('../../../src/db/prismaClient.js')).default;
const { addPayment } = await import('../../../src/services/paymentService.js');
const billService = await import('../../../src/services/billService.js');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('billService listBills', () => {
  it('returns paginated bills with filters', async () => {
    prisma.bill.count.mockResolvedValue(1);
    prisma.bill.findMany.mockResolvedValue([{ id: '1' }]);

    const result = await billService.listBills({ category: 'utilities', page: 2, limit: 5 });

    expect(prisma.bill.updateMany).toHaveBeenCalled();
    expect(prisma.bill.count).toHaveBeenCalledWith({ where: { category: 'utilities' } });
    expect(prisma.bill.findMany).toHaveBeenCalledWith({
      where: { category: 'utilities' },
      orderBy: { dueDate: 'asc' },
      skip: 5,
      take: 5,
      include: { Service: true, payments: true }
    });
    expect(result).toEqual({
      total: 1,
      page: 2,
      limit: 5,
      data: [{ id: '1', name: undefined, description: undefined, payments: undefined }]
    });
  });
});

describe('billService updateBill', () => {
  const existing = {
    id: '1',
    amount: 10,
    dueDate: new Date('2024-01-01T00:00:00Z'),
    status: 'pending',
    category: 'subscriptions',
    autoRenew: true,
    recurrence: 'monthly'
  };

  it('returns null when bill not found', async () => {
    prisma.bill.findUnique.mockResolvedValue(null);
    const result = await billService.updateBill('1', { status: 'paid' });
    expect(result).toBeNull();
  });

  it('creates new bill and payment when auto-renew subscription is paid', async () => {
    prisma.bill.findUnique.mockResolvedValue(existing);
    prisma.service.findUnique.mockResolvedValue({ name: 'Netflix' });
    prisma.bill.update.mockResolvedValue({ ...existing, status: 'paid', paidAt: new Date() });
    prisma.bill.create.mockResolvedValue({ ...existing, id: '2' });

    const result = await billService.updateBill('1', {
      status: 'paid',
      payments: [{ amount: 10, paymentProvider: 'Visa' }]
    });

    expect(prisma.bill.update).toHaveBeenCalled();
    expect(prisma.bill.create).toHaveBeenCalled();
    expect(addPayment).toHaveBeenCalled();
    expect(result.newBill.id).toBe('2');
  });

  it('updates bill without creating new one when not auto-renew', async () => {
    const noRenew = { ...existing, autoRenew: false };
    prisma.bill.findUnique.mockResolvedValue(noRenew);
    prisma.service.findUnique.mockResolvedValue({ name: 'Netflix' });
    prisma.bill.update.mockResolvedValue({ ...noRenew, status: 'paid' });

    const result = await billService.updateBill('1', {
      status: 'paid',
      payments: [{ amount: 10, paymentProvider: 'Visa' }]
    });

    expect(prisma.bill.create).not.toHaveBeenCalled();
    expect(addPayment).toHaveBeenCalled();
    expect(result.newBill).toBeNull();
  });
});
