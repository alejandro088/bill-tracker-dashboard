import OpenAI from 'openai';
import prisma from '../db/prismaClient.js';

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

    const prompt = `Based on the following bills, answer the user query:\n\n${JSON.stringify(bills)}\n\nUser: ${query}`;
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    res.json({ answer });
  } catch (err) {
    console.error('OpenAI error', err.message);
    res.status(500).json({ answer: "Sorry, I couldn't understand your question." });
  }
};
