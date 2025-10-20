/**
 * Error Handler Middleware
 * Centralized error handling
 */

const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * Handle Sequelize validation errors
 */
const handleSequelizeError = (error) => {
  if (error.name === 'SequelizeValidationError') {
    const messages = error.errors.map(err => err.message);
    return {
      statusCode: 400,
      message: 'Validation error',
      errors: messages
    };
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path;
    return {
      statusCode: 409,
      message: `${field} already exists`,
      errors: [error.message]
    };
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return {
      statusCode: 400,
      message: 'Invalid reference',
      errors: ['Referenced resource does not exist']
    };
  }

  return null;
};

/**
 * Development error response
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message,
    stack: err.stack,
    details: err
  });
};

/**
 * Production error response
 */
const sendErrorProd = (err, res) => {
  // Operational errors: send to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  // Programming or unknown errors: don't leak details
  else {
    logger.error('ERROR:', err);
    res.status(500).json({
      success: false,
      error: 'Something went wrong'
    });
  }
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Handle Sequelize errors
  const sequelizeError = handleSequelizeError(err);
  if (sequelizeError) {
    return res.status(sequelizeError.statusCode).json({
      success: false,
      error: sequelizeError.message,
      errors: sequelizeError.errors
    });
  }

  // Development vs Production
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

/**
 * Handle 404 errors (not found routes)
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Async handler wrapper
 * Catches errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
