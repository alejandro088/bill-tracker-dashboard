import * as accountService from '../services/accountService.js';
import handleControllerError from '../utils/handleControllerError.js';

// Obtener todas las cuentas
export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await accountService.getAllAccounts(req.user?.userId);
    res.json(accounts);
  } catch (error) {
    console.error('Error al obtener todas las cuentas:', error);
    return handleControllerError(res, error);
  }
};

// Obtener una cuenta por ID
export const getAccountById = async (req, res) => {
  try {
    const account = await accountService.getAccountById(req.params.id, req.user?.userId);
    if (!account) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    res.json(account);
  } catch (error) {
    console.error('Error al obtener la cuenta:', error);
    return handleControllerError(res, error);
  }
};

// Crear una nueva cuenta
export const createAccount = async (req, res) => {
  try {
    const newAccount = await accountService.createAccount(req.body, req.user?.userId);
    res.status(201).json(newAccount);
  } catch (error) {
    console.error('Error al crear la cuenta:', error);
    return handleControllerError(res, error);
  }
};

// Actualizar una cuenta existente
export const updateAccount = async (req, res) => {
  try {
    const updatedAccount = await accountService.updateAccount(req.params.id, req.body, req.user?.userId);
    res.json(updatedAccount);
  } catch (error) {
    console.error('Error al actualizar la cuenta:', error);
    return handleControllerError(res, error);
  }
};

// Eliminar una cuenta
export const deleteAccount = async (req, res) => {
  try {
    await accountService.deleteAccount(req.params.id, req.user?.userId);
    res.json({ message: 'Cuenta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la cuenta:', error);
    if (error.message && error.message.includes('tiene métodos de pago asociados')) {
      return res.status(400).json({ error: error.message });
    }
    return handleControllerError(res, error);
  }
};

// Vincular un método de pago a una cuenta
export const linkPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId, accountId } = req.body;
    const result = await accountService.linkPaymentMethodToAccount(paymentMethodId, accountId, req.user?.userId);
    res.json(result);
  } catch (error) {
    console.error('Error al vincular método de pago a cuenta:', error);
    return handleControllerError(res, error);
  }
};

// Desvincular un método de pago de una cuenta
export const unlinkPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const result = await accountService.unlinkPaymentMethodFromAccount(paymentMethodId, req.user?.userId);
    res.json(result);
  } catch (error) {
    console.error('Error al desvincular método de pago de cuenta:', error);
    return handleControllerError(res, error);
  }
};

// Obtener balance de cuentas por moneda
export const getBalances = async (req, res) => {
  try {
    const balances = await accountService.getAccountsBalance(req.user?.userId);
    res.json(balances);
  } catch (error) {
    console.error('Error al obtener los balances:', error);
    return handleControllerError(res, error);
  }
};

// Registrar un ingreso en una cuenta
export const registerIncome = async (req, res) => {
  const { accountId, amount, description } = req.body;
  try {
    const income = await accountService.addIncome({ accountId, amount, description }, req.user?.userId);
    res.status(201).json(income);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// Registrar un retiro/egreso
export const registerWithdrawal = async (req, res) => {
  const { accountId, amount, description } = req.body;
  try {
    const withdrawal = await accountService.addWithdrawal({ accountId, amount, description }, req.user?.userId);
    res.status(201).json(withdrawal);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// Crear una transferencia entre cuentas
export const createTransfer = async (req, res) => {
  const { fromAccountId, toAccountId, amount, currency, description, date } = req.body;
  try {
    // Normalizar transferDate: si se pasa sólo la fecha (YYYY-MM-DD), combinarla con la hora actual
    let transferDate;
    if (!date) {
      transferDate = new Date();
    } else {
      const dateStr = String(date);
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const now = new Date();
        const parts = dateStr.split('-').map(Number);
        transferDate = new Date(parts[0], parts[1] - 1, parts[2], now.getHours(), now.getMinutes(), now.getSeconds());
      } else {
        transferDate = new Date(dateStr);
      }
    }

    const transfer = await accountService.addTransfer({ 
      fromAccountId, 
      toAccountId, 
      amount, 
      currency, 
      description, 
      transferDate
    }, req.user?.userId);
    
    res.status(201).json(transfer);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// Listar ingresos
export const listIncomes = async (req, res) => {
  try {
    const incomes = await accountService.getIncomes(req.user?.userId);
    res.json(incomes);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// Listar transferencias
export const listTransfers = async (req, res) => {
  try {
    const transfers = await accountService.getTransfers(req.user?.userId);
    res.json(transfers);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// Actualizar preferencias de reminder del usuario autenticado
export const updateReminderPreferences = async (req, res) => {
  try {
    const prefs = req.body || {};
    const updated = await accountService.updateReminderPreferences(req.user?.userId, prefs);
    res.json({ message: 'Reminder preferences updated', data: { reminderEnabled: updated.reminderEnabled, reminderWindowDays: updated.reminderWindowDays, reminderChannel: updated.reminderChannel } });
  } catch (error) {
    console.error('Error updating reminder preferences:', error);
    return handleControllerError(res, error);
  }
};

// Obtener preferencias de reminder del usuario autenticado
export const getReminderPreferences = async (req, res) => {
  try {
    const prefs = await accountService.getReminderPreferences(req.user?.userId);
    if (!prefs) return res.status(404).json({ error: 'User not found' });
    res.json(prefs);
  } catch (error) {
    console.error('Error fetching reminder preferences:', error);
    return handleControllerError(res, error);
  }
};
