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
