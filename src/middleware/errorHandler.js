import { logError } from '../utils/logger.js';

export default (err, req, res, next) => {
  // Loguear el error con Winston
  logError('Error handler caught error', err, {
    path: req.path,
    method: req.method,
    userId: req.user?.userId
  });
  
  res.status(err.statusCode || 500).json({ message: err.message });

};
