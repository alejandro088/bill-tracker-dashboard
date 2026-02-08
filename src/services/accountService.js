import prisma from '../db/prismaClient.js';
import { ValidationError, NotFoundError, UnauthorizedError } from '../errors/httpErrors.js';
import { logDebug, logError } from '../utils/logger.js';

export const getAllAccounts = async (userId = null) => {
  const where = { ...(userId && { userId }) };
  return prisma.account.findMany({
    where,
    include: {
      paymentMethods: true
    },
    orderBy: {
      name: 'asc'
    }
  });
};

export const getAccountById = async (id, userId = null) => {
  const where = { id, ...(userId && { userId }) };
  return prisma.account.findFirst({
    where,
    include: {
      paymentMethods: true
    }
  });
};

export const createAccount = async (accountData, userId = null) => {
  const { name, description, type, balance, currency, icon, color } = accountData;
  
  return prisma.account.create({
    data: {
      name,
      description,
      type,
      balance: balance ? parseFloat(balance) : null,
      currency,
      icon,
      color,
      ...(userId && { userId })
    }
  });
};

export const updateAccount = async (id, accountData, userId = null) => {
  const { name, description, type, balance, currency, icon, color } = accountData;
  
  if (userId) {
    const existing = await prisma.account.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) throw new NotFoundError('Account not found');
  }
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

export const deleteAccount = async (id, userId = null) => {
  // Primero verificar si tiene métodos de pago asociados
  const account = await prisma.account.findUnique({
    where: { id },
    include: { paymentMethods: true }
  });
  
  if (account.paymentMethods.length > 0) {
    throw new ValidationError('No se puede eliminar la cuenta porque tiene métodos de pago asociados');
  }
  if (userId) {
    if (!account || account.userId !== userId) throw new NotFoundError('Account not found');
  }
  
  return prisma.account.delete({
    where: { id }
  });
};

// Funciones para vincular y desvincular métodos de pago a cuentas
export const linkPaymentMethodToAccount = async (paymentMethodId, accountId, userId = null) => {
  if (userId) {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account || account.userId !== userId) throw new NotFoundError('Account not found');
    const pm = await prisma.paymentMethods.findUnique({ where: { id: paymentMethodId } });
    if (!pm || pm.userId !== userId) throw new NotFoundError('Payment method not found');
  }
  return prisma.paymentMethods.update({
    where: { id: paymentMethodId },
    data: { accountId }
  });
};

export const unlinkPaymentMethodFromAccount = async (paymentMethodId, userId = null) => {
  if (userId) {
    const pm = await prisma.paymentMethods.findUnique({ where: { id: paymentMethodId }, include: { Account: true } });
    if (!pm) throw new NotFoundError('Payment method not found');
    const account = pm.Account;
    if (account && account.userId !== userId) throw new UnauthorizedError('Not authorized');
  }
  return prisma.paymentMethods.update({
    where: { id: paymentMethodId },
    data: { accountId: null }
  });
};

// Función para obtener el balance total por moneda
export const getAccountsBalance = async (userId = null) => {
  const where = { ...(userId && { userId }) };
  const accounts = await prisma.account.findMany({ where });
  
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

export const addIncome = async ({ accountId, amount, description }, userId = null) => {
  if (userId) {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account || account.userId !== userId) throw new NotFoundError('Account not found');
  }
  // Crear el ingreso y actualizar el balance de la cuenta en una transacción
  return prisma.$transaction(async (prismaTx) => {
    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const income = await prismaTx.income.create({
      data: {
        accountId,
        amount: parsedAmount,
        description,
      },
    });

    // Incrementar el balance de la cuenta (si existe)
    await prismaTx.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: parsedAmount,
        },
      },
    });

    return income;
  });
};

export const addWithdrawal = async ({ accountId, amount, description }, userId = null) => {
  // Obtener cuenta y validar propiedad / existencia
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) throw new NotFoundError('Account not found');
  if (userId && account.userId !== userId) throw new NotFoundError('Account not found');

  const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const available = account.balance !== null ? parseFloat(account.balance) : 0;
  if (parsedAmount > available) {
    throw new ValidationError('Insufficient funds');
  }

  return prisma.$transaction(async (prismaTx) => {
    const negativeAmount = parsedAmount * -1;

    // Registrar como un Income con monto negativo para conservar historial
    const withdrawal = await prismaTx.income.create({
      data: {
        accountId,
        amount: negativeAmount,
        description,
      },
    });

    // Reducir el balance de la cuenta
    await prismaTx.account.update({
      where: { id: accountId },
      data: {
        balance: {
          decrement: parsedAmount,
        },
      },
    });

    return withdrawal;
  });
};

export const addTransfer = async ({ fromAccountId, toAccountId, amount, currency, description, transferDate }, userId = null) => {
  // Obtener cuentas y validar acceso
  const fromAccount = await prisma.account.findUnique({ where: { id: fromAccountId } });
  const toAccount = await prisma.account.findUnique({ where: { id: toAccountId } });
  if (userId) {
    if (!fromAccount || fromAccount.userId !== userId) throw new NotFoundError('From account not found');
    if (!toAccount || toAccount.userId !== userId) throw new NotFoundError('To account not found');
  }

  // Validar fondos suficientes en la cuenta de origen
  const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const fromBalance = fromAccount && fromAccount.balance !== null ? parseFloat(fromAccount.balance) : 0;
  if (parsedAmount > fromBalance) throw new ValidationError('Insufficient funds');

  return prisma.$transaction(async (prismaTx) => {
    // Crear la transferencia
    const transfer = await prismaTx.transfer.create({
      data: {
        fromAccountId,
        toAccountId,
        amount: parsedAmount,
        currency,
        description,
        transferDate,
      },
    });

    // Actualizar el saldo de la cuenta de origen (restar)
    await prismaTx.account.update({
      where: { id: fromAccountId },
      data: {
        balance: {
          decrement: parsedAmount,
        },
      },
    });

    // Actualizar el saldo de la cuenta de destino (sumar)
    await prismaTx.account.update({
      where: { id: toAccountId },
      data: {
        balance: {
          increment: parsedAmount,
        },
      },
    });

    return transfer;
  });
};

export const updateReminderPreferences = async (userId, prefs) => {
  const allowed = {};
  if (prefs.reminderEnabled !== undefined) allowed.reminderEnabled = Boolean(prefs.reminderEnabled);
  if (prefs.reminderWindowDays !== undefined) allowed.reminderWindowDays = Number(prefs.reminderWindowDays);
  if (prefs.reminderChannel !== undefined) allowed.reminderChannel = String(prefs.reminderChannel);

  return prisma.user.update({ where: { id: userId }, data: allowed });
};

export const getIncomes = async (userId = null) => {
  try {

    // Evitar comparaciones SQL entre collations distintas haciendo el filtro
    // por `userId` en memoria: primero obtener cuentas, filtrar por `userId`
    // en JS y luego pedir los ingresos por `accountId`.
    if (userId) {
      const allAccounts = await prisma.account.findMany({ select: { id: true, userId: true, name: true, currency: true } });
      const accountIds = allAccounts.filter(a => a.userId === userId).map(a => a.id);
      if (accountIds.length === 0) return [];

      const incomes = await prisma.income.findMany({
        where: { accountId: { in: accountIds } },
        include: { account: true },
        orderBy: { createdAt: 'desc' }
      });
      return incomes;
    }

    const incomes = await prisma.income.findMany({
      include: { account: true },
      orderBy: { createdAt: 'desc' }
    });

    logDebug('Incomes retrieved', { count: incomes.length });
    return incomes;
  } catch (error) {
    logError('Error retrieving incomes', error);
    throw new Error('Error retrieving incomes: ' + error.message);
  }
};

export const getTransfers = async (userId = null) => {
  try {
    if (userId) {
      const allAccounts = await prisma.account.findMany({ select: { id: true, userId: true, name: true } });
      const accountIds = allAccounts.filter(a => a.userId === userId).map(a => a.id);
      if (accountIds.length === 0) return [];

      const transfers = await prisma.transfer.findMany({
        where: {
          OR: [ { fromAccountId: { in: accountIds } }, { toAccountId: { in: accountIds } } ]
        },
        include: { fromAccount: true, toAccount: true },
        orderBy: { transferDate: 'desc' }
      });

      return transfers;
    }

    const transfers = await prisma.transfer.findMany({
      include: { fromAccount: true, toAccount: true },
      orderBy: { transferDate: 'desc' }
    });

    return transfers;
  } catch (error) {
    console.error('Error retrieving transfers:', error);
    throw new Error('Error retrieving transfers: ' + error.message);
  }
};
