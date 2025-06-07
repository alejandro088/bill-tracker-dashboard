import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import app from '../src/index.js';
import * as billService from '../src/services/billService.js';

vi.mock('../src/services/billService.js');

const sampleBill = {
  id: '1',
  name: 'Internet',
  description: 'Monthly internet',
  amount: 50,
  dueDate: new Date().toISOString(),
  status: 'pending',
  category: 'utilities',
  paymentProvider: 'Visa',
  autoRenew: false,
  recurrence: 'none'
};

describe('Bill endpoints', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('GET /bills should list bills', async () => {
    billService.listBills.mockResolvedValue({ total: 1, page: 1, limit: 10, data: [sampleBill] });
    const res = await request(app).get('/bills');
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Internet');
  });

  it('GET /bills with filters should pass query to service', async () => {
    billService.listBills.mockResolvedValue({ total: 0, page: 1, limit: 10, data: [] });
    await request(app).get('/bills').query({ category: 'utilities', paymentProvider: 'Visa' });
    expect(billService.listBills).toHaveBeenCalledWith({ category: 'utilities', paymentProvider: 'Visa' });
  });

  it('GET /bills/:id should return bill by id', async () => {
    billService.getBillById.mockResolvedValue(sampleBill);
    const res = await request(app).get('/bills/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('1');
  });

  it('GET /bills/upcoming should return upcoming bills', async () => {
    billService.getUpcomingBills.mockResolvedValue([sampleBill]);
    const res = await request(app).get('/bills/upcoming');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('POST /bills should create bill', async () => {
    billService.addBill.mockResolvedValue(sampleBill);
    const res = await request(app).post('/bills').send(sampleBill);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Internet');
  });

  it('PUT /bills/:id should update bill', async () => {
    billService.updateBill.mockResolvedValue({ updated: { ...sampleBill, status: 'paid' }, newBill: null });
    const res = await request(app).put('/bills/1').send({ status: 'paid' });
    expect(res.status).toBe(200);
    expect(res.body.updated.status).toBe('paid');
  });

  it('PUT /bills/:id should create new bill when auto-renew paid', async () => {
    billService.updateBill.mockResolvedValue({ updated: { ...sampleBill, status: 'paid', autoRenew: true }, newBill: { ...sampleBill, id: '2' } });
    const res = await request(app).put('/bills/1').send({ status: 'paid' });
    expect(res.status).toBe(200);
    expect(res.body.newBill.id).toBe('2');
  });

  it('PUT /bills/:id autoRenew false should cancel subscription', async () => {
    billService.updateBill.mockResolvedValue({ updated: { ...sampleBill, autoRenew: false }, newBill: null });
    const res = await request(app).put('/bills/1').send({ autoRenew: false });
    expect(res.status).toBe(200);
    expect(res.body.updated.autoRenew).toBe(false);
  });

  it('DELETE /bills/:id should remove bill', async () => {
    billService.deleteBill.mockResolvedValue(true);
    const res = await request(app).delete('/bills/1');
    expect(res.status).toBe(204);
  });

  it('GET /bills/summary should return summary', async () => {
    billService.getSummary.mockResolvedValue({ paid: 100, pending: 50, overdue: 0 });
    const res = await request(app).get('/bills/summary');
    expect(res.status).toBe(200);
    expect(res.body.paid).toBe(100);
  });
});
