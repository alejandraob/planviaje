/**
 * Validation Middleware
 * Request validation using Joi schemas
 */

const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

/**
 * Validate request body
 * @param {object} schema - Joi validation schema
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Replace body with validated value
    req.body = value;
    next();
  };
};

/**
 * Validate request params
 * @param {object} schema - Joi validation schema
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    req.params = value;
    next();
  };
};

/**
 * Validate request query
 * @param {object} schema - Joi validation schema
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    req.query = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // ID parameter validation
  idParam: Joi.object({
    id: Joi.number().integer().positive().required()
  }),

  // Email validation
  email: Joi.string().email().required(),

  // Password validation
  password: Joi.string().min(8).required(),

  // Phone validation (Argentina)
  phone: Joi.string().pattern(/^\+?549?[0-9]{10,13}$/).optional(),

  // Date validation
  date: Joi.date().iso().required(),

  // Amount validation
  amount: Joi.number().positive().precision(2).required(),

  // Pagination validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  })
};

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
  schemas
};
