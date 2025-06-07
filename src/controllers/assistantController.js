import OpenAI from 'openai';
import prisma from '../db/prismaClient.js';
import FINANCE_ASSISTANT_PROMPT from '../prompts/financeAssistant.js';

let chatHistory = [
  { role: 'system', content: FINANCE_ASSISTANT_PROMPT.trim() }
];

export const resetChat = (req, res) => {
  chatHistory = [{ role: 'system', content: FINANCE_ASSISTANT_PROMPT.trim() }];
  res.json({ message: 'Chat reset' });
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const ask = async (req, res) => {
  const query = (req.body.query || '').toString().slice(0, 200);
  if (!query) return res.status(400).json({ message: 'Query required' });

  try {
    const bills = await prisma.bill.findMany({
      where: { status: 'paid' },
      orderBy: { paidAt: 'desc' },
      take: 50,
      select: {
        name: true,
        amount: true,
        paidAt: true,
        paymentProvider: true,
        recurrence: true
      }
    });

    chatHistory.push({ role: 'system', content: JSON.stringify(bills) });
    chatHistory.push({ role: 'user', content: query });

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: chatHistory,
      temperature: 0.2
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    chatHistory.push({ role: 'assistant', content: answer });

    const MAX_TURNS = 10;
    const limit = 1 + MAX_TURNS * 3;
    if (chatHistory.length > limit) {
      chatHistory = [chatHistory[0], ...chatHistory.slice(chatHistory.length - limit + 1)];
    }

    res.json({ answer });
  } catch (err) {
    console.error('OpenAI error', err.message);
    res.status(500).json({ answer: "Sorry, I couldn't understand your question." });
  }
};
