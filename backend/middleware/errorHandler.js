// =====================================================================
// AdVia Backend — Centralized Error Handling
// =====================================================================

/** 404 handler — placed after all routes. */
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/** Generic error handler — placed last in the middleware chain. */
function errorHandler(err, req, res, next) {
  console.error('💥 Error:', err.message);

  // MySQL duplicate-entry error → friendlier message
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Duplicate entry — this record already exists.' });
  }

  // MySQL foreign-key error → friendlier message
  if (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ message: 'Referenced record does not exist.' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
