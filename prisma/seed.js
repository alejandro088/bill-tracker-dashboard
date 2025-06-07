import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.bill.count();
  if (count > 0) return;

  await prisma.bill.createMany({
    data: [
      {
        name: 'Electricity',
        description: 'Monthly power bill',
        amount: 60.5,
        dueDate: new Date(Date.now() + 2 * 86400000),
        status: 'pending',
        category: 'utilities',
        paymentProvider: 'Visa'
      },
      {
        name: 'Streaming Service',
        description: 'Video subscription',
        amount: 12.99,
        dueDate: new Date(Date.now() + 5 * 86400000),
        status: 'pending',
        category: 'subscriptions',
        paymentProvider: 'Mastercard',
        autoRenew: true,
        recurrence: 'monthly'
      }
    ]
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
