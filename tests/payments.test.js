import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import app from '../src/index.js';
import * as paymentService from '../src/services/paymentService.js';

vi.mock('../src/services/paymentService.js');

const sample = { id: '1', name: 'Internet', amount: 50, paidAt: new Date().toISOString(), dueDate: new Date().toISOString(), paymentProvider: 'Visa', recurrence: 'none', category: 'utilities' };

describe('Payment endpoints', () => {
  beforeEach(() => vi.resetAllMocks());

  it('GET /payments should return all payments', async () => {
    paymentService.listPayments.mockResolvedValue([sample]);
    const res = await request(app).get('/payments');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('Internet');
  });

  it('GET /payments/:name should filter by name', async () => {
    paymentService.listPayments.mockResolvedValue([sample]);
    const res = await request(app).get('/payments/Internet');
    expect(res.status).toBe(200);
    expect(paymentService.listPayments).toHaveBeenCalledWith('Internet');
  });
});
