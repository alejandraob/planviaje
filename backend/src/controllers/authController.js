/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

const { Usuario } = require('../models');
const { createFirebaseUser, verifyIdToken } = require('../config/firebase');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { BadRequestError, UnauthorizedError, ConflictError, ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Register new user with email and password
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, nombre, apellido, telefono } = req.body;

    // Check if user already exists
    const existingUser = await Usuario.findOne({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create Firebase user
    const firebaseUser = await createFirebaseUser({
      email,
      password,
      nombre,
      apellido,
      telefono
    });

    // Create user in database
    const usuario = await Usuario.create({
      email,
      nombre,
      apellido,
      telefono,
      estado: 'activo'
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: usuario.id_usuario,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido
    });

    const refreshToken = generateRefreshToken({
      id: usuario.id_usuario
    });

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: usuario.id_usuario,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          telefono: usuario.telefono
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

/**
 * Login with email and password (Firebase)
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      throw new BadRequestError('Firebase ID token is required');
    }

    // Verify Firebase token
    const decodedToken = await verifyIdToken(idToken);

    // Find user in database
    const usuario = await Usuario.findOne({
      where: { email: decodedToken.email }
    });

    if (!usuario) {
      throw new UnauthorizedError('User not found');
    }

    if (usuario.estado !== 'activo') {
      throw new UnauthorizedError('User account is not active');
    }

    // Update last login
    await usuario.update({
      fecha_ultimo_login: new Date()
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: usuario.id_usuario,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido
    });

    const refreshToken = generateRefreshToken({
      id: usuario.id_usuario
    });

    logger.info(`User logged in: ${usuario.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: usuario.id_usuario,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          telefono: usuario.telefono,
          avatar_url: usuario.avatar_url
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * Get current logged in user
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const usuario = await Usuario.findByPk(userId, {
      attributes: ['id_usuario', 'email', 'nombre', 'apellido', 'telefono', 'avatar_url', 'estado']
    });

    if (!usuario) {
      throw new UnauthorizedError('User not found');
    }

    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    logger.error('Get me error:', error);
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    // Verify refresh token
    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(refreshToken);

    // Find user
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario || usuario.estado !== 'activo') {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      id: usuario.id_usuario,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    // In a stateless JWT system, logout is typically handled on the client side
    // by removing the token. But we can log it here for auditing.
    logger.info(`User logged out: ${req.user?.email || 'Unknown'}`);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

/**
 * DEV ONLY: Login with email and password directly (without Firebase)
 * POST /api/auth/dev-login
 * This endpoint is only available in development mode for testing purposes
 */
const devLogin = async (req, res, next) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenError('This endpoint is not available in production');
    }

    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    // Find user in database
    const usuario = await Usuario.findOne({
      where: { email }
    });

    if (!usuario) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (usuario.estado !== 'activo') {
      throw new UnauthorizedError('User account is not active');
    }

    // In dev mode, we skip password verification for simplicity
    // In a real scenario, you'd verify the password hash

    // Update last login
    await usuario.update({
      fecha_ultimo_login: new Date()
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: usuario.id_usuario,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido
    });

    const refreshToken = generateRefreshToken({
      id: usuario.id_usuario
    });

    logger.info(`DEV LOGIN: User logged in: ${usuario.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful (DEV MODE)',
      data: {
        user: {
          id: usuario.id_usuario,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          telefono: usuario.telefono,
          avatar_url: usuario.avatar_url
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Dev login error:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  refreshAccessToken,
  logout,
  devLogin
};
