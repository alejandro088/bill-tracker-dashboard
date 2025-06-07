import { describe, it, expect, beforeEach, vi } from 'vitest';

var prismaMock;
vi.mock('../../src/db/prismaClient.js', () => {
  prismaMock = {
    bill: {
      updateMany: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn()
    }
  };
  return { default: prismaMock };
});
import * as billService from '../../src/services/billService.js';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getMonthlySummary', () => {
  it('sums amounts for current month', async () => {
    const now = new Date('2024-01-15T00:00:00Z');
    vi.setSystemTime(now);
    prismaMock.bill.findMany.mockResolvedValue([
      { status: 'paid', amount: 10 },
      { status: 'pending', amount: 5 },
      { status: 'overdue', amount: 2 }
    ]);
    const summary = await billService.getMonthlySummary();
    expect(prismaMock.bill.updateMany).toHaveBeenCalled();
    expect(summary).toEqual({ paid: 10, pending: 5, overdue: 2 });
    vi.useRealTimers();
  });
});

describe('getSummary', () => {
  it('groups amounts by status', async () => {
    prismaMock.bill.groupBy.mockResolvedValue([
      { status: 'paid', _sum: { amount: 10 } },
      { status: 'pending', _sum: { amount: 5 } }
    ]);
    const summary = await billService.getSummary();
    expect(prismaMock.bill.updateMany).toHaveBeenCalled();
    expect(summary.paid).toBe(10);
    expect(summary.pending).toBe(5);
    expect(summary.overdue).toBe(0);
  });
});
