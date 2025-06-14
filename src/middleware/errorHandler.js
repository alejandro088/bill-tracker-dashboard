export default (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({ message: 'Not Found' });
  }

  res.status(500).json({ message: 'Internal Server Error' });
};
