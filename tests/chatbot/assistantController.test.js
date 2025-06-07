import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const prismaMock = {
  bill: {
    findMany: vi.fn()
  }
};

const openAiMock = {
  chat: {
    completions: { create: vi.fn() }
  }
};

vi.mock('../../src/db/prismaClient.js', () => ({ default: prismaMock }));
vi.mock('openai', () => ({ default: class { constructor() { return openAiMock; } } }));

let controller;

beforeEach(async () => {
  vi.resetModules();
  const module = await import('../../src/controllers/assistantController.js');
  controller = module;
});

describe('ask handler', () => {
  it('returns answer from openai', async () => {
    prismaMock.bill.findMany.mockResolvedValue([]);
    openAiMock.chat.completions.create.mockResolvedValue({ choices: [{ message: { content: 'ok' } }] });
    const req = { body: { query: 'Hi' } };
    const res = { json: vi.fn(), status: vi.fn(() => res) };
    await controller.ask(req, res);
    expect(res.json).toHaveBeenCalledWith({ answer: 'ok' });
  });

  it('returns 400 if no query', async () => {
    const req = { body: {} };
    const res = { json: vi.fn(), status: vi.fn(() => res) };
    await controller.ask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('handles openai error', async () => {
    prismaMock.bill.findMany.mockResolvedValue([]);
    openAiMock.chat.completions.create.mockRejectedValue(new Error('fail'));
    const req = { body: { query: 'Hi' } };
    const res = { json: vi.fn(), status: vi.fn(() => res) };
    await controller.ask(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ answer: "Sorry, I couldn't understand your question." });
  });
});

describe('resetChat handler', () => {
  it('responds with reset message', async () => {
    const req = {};
    const res = { json: vi.fn() };
    await controller.resetChat(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Chat reset' });
  });
});
