import { logError } from './logger.js';

export default function handleControllerError(res, error) {
  logError('Controller error', error, { statusCode: error.statusCode });
  const status = error && Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const message = error && (error.message || error.name || String(error)) ? (error.message || error.name || String(error)) : 'Internal server error';
  return res.status(status).json({ error: message });
}
