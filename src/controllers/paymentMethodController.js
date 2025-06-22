import * as paymentMethodService from '../services/paymentMethodService.js';

export const getAllPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await paymentMethodService.getAllPaymentMethods();
    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await paymentMethodService.createPaymentMethod(req.body);
    res.status(201).json(paymentMethod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await paymentMethodService.updatePaymentMethod(req.params.id, req.body);
    res.json(paymentMethod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePaymentMethod = async (req, res) => {
  try {
    await paymentMethodService.deletePaymentMethod(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
