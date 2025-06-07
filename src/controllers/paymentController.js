import { listPayments } from '../services/paymentService.js';

export const history = (req, res, next) => {
  try {
    res.json(listPayments(req.params.name));
  } catch (err) {
    next(err);
  }
};
