import { jest } from '@jest/globals';

let mockCreate;
jest.unstable_mockModule('openai', () => ({
  default: class {
    constructor() {
      mockCreate = jest.fn();
      this.chat = { completions: { create: mockCreate } };
    }
  }
}));

const { ask } = await import('../../src/controllers/assistantController.js');
import prisma from '../../src/db/prismaClient.js';
import OpenAI from 'openai';
process.env.OPENAI_API_KEY = 'test';

beforeEach(() => {
  jest.clearAllMocks();
  prisma.bill = { findMany: jest.fn() };
});

describe('assistantController ask', () => {
  it('returns answer from openai', async () => {
    prisma.bill.findMany.mockResolvedValue([]);
    mockCreate.mockResolvedValue({ choices: [{ message: { content: 'hi' } }] });

    const req = { body: { query: 'hello' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await ask(req, res);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ answer: 'hi' });
  });

  it('handles missing query', async () => {
    const req = { body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await ask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('handles openai error', async () => {
    prisma.bill.findMany.mockResolvedValue([]);
    mockCreate.mockRejectedValue(new Error('fail'));
    const req = { body: { query: 'hi' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await ask(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ answer: "Sorry, I couldn't understand your question." });
  });
});
