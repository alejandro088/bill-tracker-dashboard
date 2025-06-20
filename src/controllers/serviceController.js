import {
  listServices,
  getServiceById,
  updateService,
  createService
} from '../services/serviceService.js';

export const getAll = async (req, res, next) => {
  try {
    res.json(await listServices(req.query));
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const service = await getServiceById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const service = await updateService(req.params.id, req.body);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    next(err);
  }
};

export const archive = async (req, res, next) => {
  try {
    const service = await updateService(req.params.id, { archived: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const service = await createService(req.body);
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
};
