import { getMonthlyStatusByMonth } from '../services/billService.js';

export const monthly = async (req, res, next) => {
  try {
    const year = req.query.year ? Number(req.query.year) : undefined;
    const summary = await getMonthlyStatusByMonth(year);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};
