/**
 * Validators Utility
 * Common validation functions
 */

const Joi = require('joi');

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const schema = Joi.string().email();
  const { error } = schema.validate(email);
  return !error;
};

/**
 * Validate phone number (Argentina)
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
const isValidPhone = (phone) => {
  // Argentina: +54 9 11 1234-5678 or similar
  const phoneRegex = /^\+?549?[0-9]{10,13}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {boolean}
 */
const isValidDateRange = (startDate, endDate) => {
  return new Date(startDate) <= new Date(endDate);
};

/**
 * Validate amount (must be positive)
 * @param {number} amount - Amount to validate
 * @returns {boolean}
 */
const isValidAmount = (amount) => {
  return typeof amount === 'number' && amount > 0;
};

/**
 * Validate trip duration (max 365 days)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {boolean}
 */
const isValidTripDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 365;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, message: string }
 */
const validatePasswordStrength = (password) => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain lowercase letters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase letters' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain numbers' };
  }
  return { valid: true, message: 'Password is strong' };
};

/**
 * Sanitize input (remove dangerous characters)
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidDateRange,
  isValidAmount,
  isValidTripDuration,
  validatePasswordStrength,
  sanitizeInput
};
