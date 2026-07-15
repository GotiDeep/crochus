const ApiError = require('../lib/apiError');

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(error, req, res, next) {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message = error instanceof ApiError ? error.message : 'Internal server error';

  if (!(error instanceof ApiError)) {
    console.error(error);
  }

  res.status(statusCode).json({
    message,
    details: error.details || undefined,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

