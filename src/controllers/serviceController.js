import {
  listServices,
  getServiceById,
  updateService,
  createService,
  restoreService
} from '../services/serviceService.js';
import handleControllerError from '../utils/handleControllerError.js';

export const restore = async (req, res, next) => {
  try {
    const service = await restoreService(req.params.id, req.user?.userId);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    res.json(await listServices(req.query, req.user?.userId));
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const service = await getServiceById(req.params.id, req.user?.userId);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const service = await updateService(req.params.id, req.body, req.user?.userId);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    next(err);
  }
};

export const archive = async (req, res, next) => {
  try {
    const service = await updateService(req.params.id, { archived: true }, req.user?.userId);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const service = await createService(req.body, req.user?.userId);
    res.status(201).json(service);
  } catch (err) {
    //next(err);
    return handleControllerError(res, err);
  }
};
