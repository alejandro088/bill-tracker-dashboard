let prisma;
if (process.env.NODE_ENV === 'test') {
  prisma = {
    bill: {},
    payment: {},
    service: {},
    $connect: async () => {},
    $disconnect: async () => {}
  };
} else {
  const { PrismaClient } = await import('@prisma/client');
  prisma = new PrismaClient();
}

export default prisma;
