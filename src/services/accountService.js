import prisma from '../db/prismaClient.js';

export const getAllAccounts = async () => {
  return prisma.account.findMany({
    include: {
      paymentMethods: true
    },
    orderBy: {
      name: 'asc'
    }
  });
};

export const getAccountById = async (id) => {
  return prisma.account.findUnique({
    where: { id },
    include: {
      paymentMethods: true
    }
  });
};

export const createAccount = async (accountData) => {
  const { name, description, type, balance, currency, icon, color } = accountData;
  
  return prisma.account.create({
    data: {
      name,
      description,
      type,
      balance: balance ? parseFloat(balance) : null,
      currency,
      icon,
      color
    }
  });
};

export const updateAccount = async (id, accountData) => {
  const { name, description, type, balance, currency, icon, color } = accountData;
  
  return prisma.account.update({
    where: { id },
    data: {
      name,
      description,
      type,
      balance: balance !== undefined ? parseFloat(balance) : undefined,
      currency,
      icon,
      color
    }
  });
};

export const deleteAccount = async (id) => {
  // Primero verificar si tiene métodos de pago asociados
  const account = await prisma.account.findUnique({
    where: { id },
    include: { paymentMethods: true }
  });
  
  if (account.paymentMethods.length > 0) {
    throw new Error('No se puede eliminar la cuenta porque tiene métodos de pago asociados');
  }
  
  return prisma.account.delete({
    where: { id }
  });
};

// Funciones para vincular y desvincular métodos de pago a cuentas
export const linkPaymentMethodToAccount = async (paymentMethodId, accountId) => {
  return prisma.paymentMethods.update({
    where: { id: paymentMethodId },
    data: { accountId }
  });
};

export const unlinkPaymentMethodFromAccount = async (paymentMethodId) => {
  return prisma.paymentMethods.update({
    where: { id: paymentMethodId },
    data: { accountId: null }
  });
};

// Función para obtener el balance total por moneda
export const getAccountsBalance = async () => {
  const accounts = await prisma.account.findMany();
  
  // Agrupar por moneda
  const balances = {};
  
  accounts.forEach(account => {
    if (account.balance !== null) {
      if (!balances[account.currency]) {
        balances[account.currency] = 0;
      }
      balances[account.currency] += account.balance;
    }
  });
  
  return balances;
};

export const addIncome = async ({ accountId, amount, description }) => {
  return prisma.income.create({
    data: {
      accountId,
      amount,
      description,
    },
  });
};

export const addTransfer = async ({ fromAccountId, toAccountId, amount, currency, description, transferDate }) => {
  return prisma.$transaction(async (prisma) => {
    // Crear la transferencia
    const transfer = await prisma.transfer.create({
      data: {
        fromAccountId,
        toAccountId,
        amount,
        currency,
        description,
        transferDate,
      },
    });

    // Actualizar el saldo de la cuenta de origen (restar)
    await prisma.account.update({
      where: { id: fromAccountId },
      data: {
        balance: {
          decrement: parseFloat(amount),
        },
      },
    });

    // Actualizar el saldo de la cuenta de destino (sumar)
    await prisma.account.update({
      where: { id: toAccountId },
      data: {
        balance: {
          increment: parseFloat(amount),
        },
      },
    });

    return transfer;
  });
};

export const getIncomes = async () => {
  try {
    const incomes = await prisma.income.findMany({
      include: {
        account: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Incomes retrieved:', incomes);
    return incomes;
  } catch (error) {
    console.error('Error retrieving incomes:', error);
    throw new Error('Error retrieving incomes: ' + error.message);
  }
};

export const getTransfers = async () => {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        fromAccount: true,
        toAccount: true
      },
      orderBy: {
        transferDate: 'desc'
      }
    });

    return transfers;
  } catch (error) {
    console.error('Error retrieving transfers:', error);
    throw new Error('Error retrieving transfers: ' + error.message);
  }
};
