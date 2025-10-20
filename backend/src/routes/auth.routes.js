/**
 * Authentication Routes
 * Routes for user authentication
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimit');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  nombre: Joi.string().min(2).required(),
  apellido: Joi.string().min(2).required(),
  telefono: Joi.string().pattern(/^\+?549?[0-9]{10,13}$/).optional()
});

const loginSchema = Joi.object({
  idToken: Joi.string().required()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

const devLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register',
  authLimiter,
  validateBody(registerSchema),
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user with Firebase token
 * @access  Public
 */
router.post('/login',
  authLimiter,
  validateBody(loginSchema),
  authController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me',
  authenticate,
  authController.getMe
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh',
  validateBody(refreshTokenSchema),
  authController.refreshAccessToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout',
  authenticate,
  authController.logout
);

/**
 * @route   POST /api/auth/dev-login
 * @desc    DEV ONLY: Login with email/password (no Firebase)
 * @access  Public (Development only)
 */
router.post('/dev-login',
  authLimiter,
  validateBody(devLoginSchema),
  authController.devLogin
);

module.exports = router;
