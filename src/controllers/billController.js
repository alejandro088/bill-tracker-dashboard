import {
  listBills,
  getBillById,
  addBill,
  updateBill,
  deleteBill,
  getUpcomingBills,
  getMonthlySummary
} from '../services/billService.js';

export const getAll = (req, res, next) => {
  try {
    res.json(listBills(req.query));
  } catch (err) {
    next(err);
  }
};

export const getById = (req, res, next) => {
  try {
    const bill = getBillById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    next(err);
  }
};

export const create = (req, res, next) => {
  try {
    const bill = addBill(req.body);
    res.status(201).json(bill);
  } catch (err) {
    next(err);
  }
};

export const update = (req, res, next) => {
  try {
    const bill = updateBill(req.params.id, req.body);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    next(err);
  }
};

export const remove = (req, res, next) => {
  try {
    const success = deleteBill(req.params.id);
    if (!success) return res.status(404).json({ message: 'Bill not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const upcoming = (req, res, next) => {
  try {
    res.json(getUpcomingBills());
  } catch (err) {
    next(err);
  }
};

export const summary = (req, res, next) => {
  try {
    res.json(getMonthlySummary());
  } catch (err) {
    next(err);
  }
};
