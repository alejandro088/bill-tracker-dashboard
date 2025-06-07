import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/db/prismaClient.js', () => ({
  default: {
    bill: {
      updateMany: jest.fn(),
      findMany: jest.fn()
    }
  }
}));

const prisma = (await import('../../src/db/prismaClient.js')).default;
const { getMonthlySummary } = await import('../../src/services/billService.js');

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
