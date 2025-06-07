import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import app from '../src/index.js';
import OpenAI from 'openai';

vi.mock('openai');

const mockCreate = vi.fn().mockResolvedValue({ choices: [{ message: { content: 'answer' } }] });
OpenAI.mockImplementation(() => ({ chat: { completions: { create: mockCreate } } }));

describe('Assistant endpoints', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('POST /assistant/ask should return answer', async () => {
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
