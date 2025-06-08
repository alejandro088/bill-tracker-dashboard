import { listServices, getServiceById } from '../services/serviceService.js';

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
