/**
 * errorHandler.js
 *
 * asyncHandler — wraps async route handlers so thrown errors reach Express's
 *   error pipeline instead of causing unhandled rejections.
 *   Usage: router.post('/path', asyncHandler(myController))
 *
 * errorHandler — Express error-handling middleware (4-arg signature).
 *   Register AFTER all routes: app.use(errorHandler)
 */

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const isDev = process.env.REACT_APP_NODE_ENV !== 'production';
  console.error(`[ERROR] ${req.method} ${req.path} → ${status}: ${err.message}`);
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = { asyncHandler, errorHandler };
