import { describe, it, expect, vi, beforeEach } from 'vitest';

var dbMock;
vi.mock('../../src/db/paymentsDB.js', () => {
  dbMock = {
    addPayment: vi.fn(),
    getPaymentsByName: vi.fn(),
    getAllPayments: vi.fn()
  };
  return {
    addPayment: dbMock.addPayment,
    getPaymentsByName: dbMock.getPaymentsByName,
    getAllPayments: dbMock.getAllPayments
  };
});

import * as paymentService from '../../src/services/paymentService.js';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('addPayment', () => {
  it('delegates to db', async () => {
    dbMock.addPayment.mockResolvedValue({ id: '1' });
    const res = await paymentService.addPayment({ amount: 1 });
    expect(dbMock.addPayment).toHaveBeenCalledWith({ amount: 1 });
    expect(res.id).toBe('1');
  });
});

describe('listPayments', () => {
  it('filters by name when provided', async () => {
    dbMock.getPaymentsByName.mockResolvedValue([{ id: '1' }]);
    const res = await paymentService.listPayments('Internet');
    expect(dbMock.getPaymentsByName).toHaveBeenCalledWith('Internet');
    expect(res.length).toBe(1);
  });

  it('returns all payments when no name', async () => {
    dbMock.getAllPayments.mockResolvedValue([{ id: '2' }]);
    const res = await paymentService.listPayments();
    expect(dbMock.getAllPayments).toHaveBeenCalled();
    expect(res[0].id).toBe('2');
  });
});
