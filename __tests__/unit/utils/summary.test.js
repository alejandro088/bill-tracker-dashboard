import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/db/prismaClient.js', () => ({
  default: {
    bill: {
      updateMany: jest.fn(),
      findMany: jest.fn()
    }
  }
}));

const prisma = (await import('../../../src/db/prismaClient.js')).default;
const { getMonthlySummary, getMonthlyStatusByMonth } = await import('../../../src/services/billService.js');

describe('getMonthlySummary', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sums bill amounts by status', async () => {
    prisma.bill.findMany.mockResolvedValue([
      { status: 'paid', amount: 5 },
      { status: 'pending', amount: 10 },
      { status: 'paid', amount: 3 }
    ]);
    const summary = await getMonthlySummary();
    expect(prisma.bill.updateMany).toHaveBeenCalled();
    expect(summary).toEqual({ paid: 8, pending: 10, overdue: 0 });
  });
});

describe('getMonthlyStatusByMonth', () => {
  beforeEach(() => jest.clearAllMocks());

  it('groups bills by month and status', async () => {
    prisma.bill.findMany.mockResolvedValue([
      { dueDate: new Date('2025-07-10'), status: 'paid', amount: 100 },
      { dueDate: new Date('2025-07-12'), status: 'pending', amount: 50 },
      { dueDate: new Date('2025-07-20'), status: 'paid', amount: 40 }
    ]);
    const res = await getMonthlyStatusByMonth(2025);
    expect(res).toEqual([
      { month: '2025-07', status: 'paid', total: 140, count: 2 },
      { month: '2025-07', status: 'pending', total: 50, count: 1 }
    ]);
  });
});
