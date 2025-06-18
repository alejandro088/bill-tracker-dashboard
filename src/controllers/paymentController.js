import { listPayments, getPaymentSummary, getPaymentTrends, deletePayment as deletePaymentService, editPayment as editPaymentService   } from '../services/paymentService.js';

export const history = async (req, res, next) => {
  try {
    const filters = {
      name: req.params.name,
      year: req.query.year,
      currency: req.query.currency,
      category: req.query.category
    };
    const payments = await listPayments(filters);
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

export const editPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = req.body;
    res.json(await editPaymentService(id, payment));
  } catch (err) {
    next(err);
  }
};

export const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.json(await deletePaymentService(id));
  } catch (err) {
    next(err);
  }
};

export const summary = async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    res.json(await getPaymentSummary(startDate, endDate));
  } catch (err) {
    next(err);
  }
};

export const trends = async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    res.json(await getPaymentTrends(startDate, endDate));
  } catch (err) {
    next(err);
  }
};
