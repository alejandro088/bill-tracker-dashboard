import * as accountService from '../services/accountService.js';

// Obtener todas las cuentas
export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await accountService.getAllAccounts();
    res.json(accounts);
  } catch (error) {
    console.error('Error al obtener todas las cuentas:', error);
    res.status(500).json({ error: 'Error al obtener todas las cuentas' });
  }
};

// Obtener una cuenta por ID
export const getAccountById = async (req, res) => {
  try {
    const account = await accountService.getAccountById(req.params.id);
    if (!account) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    res.json(account);
  } catch (error) {
    console.error('Error al obtener la cuenta:', error);
    res.status(500).json({ error: 'Error al obtener la cuenta' });
  }
};

// Crear una nueva cuenta
export const createAccount = async (req, res) => {
  try {
    const newAccount = await accountService.createAccount(req.body);
    res.status(201).json(newAccount);
  } catch (error) {
    console.error('Error al crear la cuenta:', error);
    res.status(500).json({ error: 'Error al crear la cuenta' });
  }
};

// Actualizar una cuenta existente
export const updateAccount = async (req, res) => {
  try {
    const updatedAccount = await accountService.updateAccount(req.params.id, req.body);
    res.json(updatedAccount);
  } catch (error) {
    console.error('Error al actualizar la cuenta:', error);
    res.status(500).json({ error: 'Error al actualizar la cuenta' });
  }
};

// Eliminar una cuenta
export const deleteAccount = async (req, res) => {
  try {
    await accountService.deleteAccount(req.params.id);
    res.json({ message: 'Cuenta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la cuenta:', error);
    if (error.message.includes('tiene métodos de pago asociados')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al eliminar la cuenta' });
  }
};

// Vincular un método de pago a una cuenta
export const linkPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId, accountId } = req.body;
    const result = await accountService.linkPaymentMethodToAccount(paymentMethodId, accountId);
    res.json(result);
  } catch (error) {
    console.error('Error al vincular método de pago a cuenta:', error);
    res.status(500).json({ error: 'Error al vincular método de pago a cuenta' });
  }
};

// Desvincular un método de pago de una cuenta
export const unlinkPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const result = await accountService.unlinkPaymentMethodFromAccount(paymentMethodId);
    res.json(result);
  } catch (error) {
    console.error('Error al desvincular método de pago de cuenta:', error);
    res.status(500).json({ error: 'Error al desvincular método de pago de cuenta' });
  }
};

// Obtener balance de cuentas por moneda
export const getBalances = async (req, res) => {
  try {
    const balances = await accountService.getAccountsBalance();
    res.json(balances);
  } catch (error) {
    console.error('Error al obtener los balances:', error);
    res.status(500).json({ error: 'Error al obtener los balances' });
  }
};
