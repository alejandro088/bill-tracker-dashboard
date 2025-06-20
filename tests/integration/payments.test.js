import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
process.env.NODE_ENV = 'test';
vi.mock('../../src/db/prismaClient.js', () => ({
  default: {
    $connect: vi.fn().mockResolvedValue(),
    $disconnect: vi.fn().mockResolvedValue(),
    payment: {}
  }
}));
vi.mock('openai', () => ({ default: vi.fn() }));
import app from '../../src/index.js';
import * as paymentService from '../../src/services/paymentService.js';

vi.mock('../../src/services/paymentService.js');

const sample = {
  id: '1',
  amount: 50,
  paidAt: new Date().toISOString(),
  paymentProvider: 'Visa',
  Bill: { Service: { name: 'Internet' } }
};

describe('Payment endpoints', () => {
  beforeEach(() => vi.resetAllMocks());

  it('GET /payments should return all payments', async () => {
    paymentService.listPayments.mockResolvedValue([sample]);
    const res = await request(app).get('/payments');
    expect(res.status).toBe(200);
    expect(res.body[0].Bill.Service.name).toBe('Internet');
  });

  it('GET /payments/:name should filter by name', async () => {
    paymentService.listPayments.mockResolvedValue([sample]);
    const res = await request(app).get('/payments/Internet');
    expect(res.status).toBe(200);
    expect(paymentService.listPayments).toHaveBeenCalledWith('Internet');
  });
});
