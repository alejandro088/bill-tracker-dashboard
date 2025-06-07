import {
  listBills,
  getBillById,
  addBill,
  updateBill,
  deleteBill,
  getUpcomingBills,
  getSummary
} from '../services/billService.js';

export const getAll = async (req, res, next) => {
  try {
    res.json(await listBills(req.query));
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const bill = await getBillById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const bill = await addBill(req.body);
    res.status(201).json(bill);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const result = await updateBill(req.params.id, req.body);
    if (!result) return res.status(404).json({ message: 'Bill not found' });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteBill(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const upcoming = async (req, res, next) => {
  try {
    res.json(await getUpcomingBills());
  } catch (err) {
    next(err);
  }
};

export const summary = async (req, res, next) => {
  try {
    res.json(await getSummary());
  } catch (err) {
    next(err);
  }
};
