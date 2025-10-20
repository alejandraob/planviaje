/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Authenticate user middleware
 * Verifies JWT token from Authorization header
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      id_usuario: decoded.id, // Also add id_usuario for compatibility
      email: decoded.email,
      nombre: decoded.nombre,
      apellido: decoded.apellido
    };

    next();
  } catch (error) {
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.'
      });
    }

    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Check if user is admin (principal or secondary)
 * Must be used after authenticate middleware
 */
const isAdmin = async (req, res, next) => {
  try {
    const { MiembroViaje } = require('../models');
    const { id_viaje } = req.params;
    const userId = req.user.id;

    // Find member in trip
    const miembro = await MiembroViaje.findOne({
      where: {
        id_viaje: id_viaje,
        id_usuario: userId,
        estado_participacion: 'activo'
      }
    });

    if (!miembro) {
      throw new UnauthorizedError('Not a member of this trip');
    }

    // Check if admin
    if (miembro.rol !== 'admin_principal' && miembro.rol !== 'admin_secundario') {
      throw new UnauthorizedError('Admin access required');
    }

    req.miembro = miembro;
    next();
  } catch (error) {
    logger.error('Admin check error:', error);
    return res.status(403).json({
      success: false,
      error: error.message || 'Admin access required'
    });
  }
};

/**
 * Check if user is principal admin
 * Must be used after authenticate middleware
 */
const isPrincipalAdmin = async (req, res, next) => {
  try {
    const { MiembroViaje } = require('../models');
    const { id_viaje } = req.params;
    const userId = req.user.id;

    // Find member in trip
    const miembro = await MiembroViaje.findOne({
      where: {
        id_viaje: id_viaje,
        id_usuario: userId,
        estado_participacion: 'activo'
      }
    });

    if (!miembro) {
      throw new UnauthorizedError('Not a member of this trip');
    }

    // Check if principal admin
    if (miembro.rol !== 'admin_principal') {
      throw new UnauthorizedError('Principal admin access required');
    }

    req.miembro = miembro;
    next();
  } catch (error) {
    logger.error('Principal admin check error:', error);
    return res.status(403).json({
      success: false,
      error: error.message || 'Principal admin access required'
    });
  }
};

module.exports = {
  authenticate,
  isAdmin,
  isPrincipalAdmin
};
