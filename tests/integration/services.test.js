import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
process.env.NODE_ENV = 'test';
vi.mock('../../src/db/prismaClient.js', () => ({
  default: {
    $connect: vi.fn().mockResolvedValue(),
    $disconnect: vi.fn().mockResolvedValue(),
    service: {}
  }
}));
vi.mock('openai', () => ({ default: vi.fn() }));
import app from '../../src/index.js';
import * as serviceService from '../../src/services/serviceService.js';

vi.mock('../../src/services/serviceService.js');

const sampleService = {
  id: '1',
  name: 'Internet',
  category: 'utilities',
  paymentProvider: 'Visa',
  recurrence: 'monthly',
  bills: []
};

describe('Service endpoints', () => {
  beforeEach(() => vi.resetAllMocks());

  it('GET /services should list services', async () => {
    serviceService.listServices.mockResolvedValue([sampleService]);
    const res = await request(app).get('/services');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('Internet');
  });

  it('GET /services with filters should pass query to service', async () => {
    serviceService.listServices.mockResolvedValue([]);
    await request(app)
      .get('/services')
      .query({ category: 'utilities', paymentProvider: 'Visa' });
    expect(serviceService.listServices).toHaveBeenCalledWith({
      category: 'utilities',
      paymentProvider: 'Visa'
    });
  });

  it('GET /services/:id should return service by id', async () => {
    serviceService.getServiceById.mockResolvedValue(sampleService);
    const res = await request(app).get('/services/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('1');
  });
});
