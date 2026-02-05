import * as paymentMethodService from '../services/paymentMethodService.js';
import handleControllerError from '../utils/handleControllerError.js';

export const getAllPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await paymentMethodService.getAllPaymentMethods(req.user?.userId);
    res.json(paymentMethods);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const createPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await paymentMethodService.createPaymentMethod(req.body, req.user?.userId);
    res.status(201).json(paymentMethod);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const updatePaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await paymentMethodService.updatePaymentMethod(req.params.id, req.body, req.user?.userId);
    res.json(paymentMethod);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const deletePaymentMethod = async (req, res) => {
  try {
    await paymentMethodService.deletePaymentMethod(req.params.id, req.user?.userId);
    res.status(204).send();
  } catch (error) {
    return handleControllerError(res, error);
  }
};
