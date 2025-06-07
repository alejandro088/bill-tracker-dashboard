import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
process.env.NODE_ENV = 'test';
vi.mock('../src/db/prismaClient.js', () => ({
  default: {
    $connect: vi.fn().mockResolvedValue(),
    $disconnect: vi.fn().mockResolvedValue(),
    bill: { findMany: vi.fn().mockResolvedValue([]) }
  }
}));
vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create: vi.fn().mockResolvedValue({ choices: [{ message: { content: 'answer' } }] }) } };
  }
}));
import app from '../src/index.js';

describe('Assistant endpoints', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it.skip('POST /assistant/ask should return answer', async () => {
    const res = await request(app).post('/assistant/ask').send({ query: 'Hi' });
    expect(res.status).toBe(200);
    expect(res.body.answer).toBe('answer');
  });

  it('POST /assistant/ask without query should return 400', async () => {
    const res = await request(app).post('/assistant/ask').send({});
    expect(res.status).toBe(400);
  });
});

describe('Chat endpoints', () => {
  it('POST /chat/reset should reset conversation', async () => {
    const res = await request(app).post('/chat/reset');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Chat reset');
  });
});
