import { listPayments } from '../services/paymentService.js';

export const history = async (req, res, next) => {
  try {
    res.json(await listPayments(req.params.name));
  } catch (err) {
    next(err);
  }
};
