import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
const paymentsDbPath = new URL('../../../src/db/paymentsDB.js', import.meta.url).pathname;
jest.unstable_mockModule(paymentsDbPath, () => ({
  addPayment: jest.fn(),
  getPaymentsByName: jest.fn(),
  getAllPayments: jest.fn()
}));
const paymentService = await import('../../../src/services/paymentService.js');
const db = await import(paymentsDbPath);

describe('paymentService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('addPayment forwards to DB', async () => {
    const payment = { id: '1' };
    const spy = jest.spyOn(db, 'addPayment').mockResolvedValue();
    await paymentService.addPayment(payment);
    expect(spy).toHaveBeenCalledWith(payment);
  });

  it('listPayments with name', async () => {
    const spy = jest.spyOn(db, 'getPaymentsByName').mockResolvedValue(['a']);
    const result = await paymentService.listPayments('a');
    expect(spy).toHaveBeenCalledWith('a');
    expect(result).toEqual(['a']);
  });

  it('listPayments without name', async () => {
    const spy = jest.spyOn(db, 'getAllPayments').mockResolvedValue(['b']);
    const result = await paymentService.listPayments();
    expect(spy).toHaveBeenCalled();
    expect(result).toEqual(['b']);
  });
});
