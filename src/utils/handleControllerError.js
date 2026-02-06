export default function handleControllerError(res, error) {
  console.log(error.statusCode, error.message);
  const status = error && Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const message = error && (error.message || error.name || String(error)) ? (error.message || error.name || String(error)) : 'Internal server error';
  return res.status(status).json({ error: message });
}
