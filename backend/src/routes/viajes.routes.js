/**
 * Viajes Routes
 * Routes for trip management
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');
const {
  crearViajeSchema,
  editarViajeSchema,
  idParamSchema,
  paginationSchema
} = require('../utils/validationSchemas');
const {
  crearViaje,
  obtenerViaje,
  listarMisViajes,
  editarViaje,
  eliminarViaje,
  obtenerEstadisticas
} = require('../controllers/viajesController');

/**
 * @route   POST /api/viajes
 * @desc    Create new trip
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validateBody(crearViajeSchema),
  asyncHandler(crearViaje)
);

/**
 * @route   GET /api/viajes
 * @desc    List user's trips
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validateQuery(paginationSchema),
  asyncHandler(listarMisViajes)
);

/**
 * @route   GET /api/viajes/:id
 * @desc    Get trip details
 * @access  Private (trip members only)
 */
router.get(
  '/:id',
  authenticate,
  validateParams(idParamSchema),
  asyncHandler(obtenerViaje)
);

/**
 * @route   PUT /api/viajes/:id
 * @desc    Update trip
 * @access  Private (admin only)
 */
router.put(
  '/:id',
  authenticate,
  validateParams(idParamSchema),
  validateBody(editarViajeSchema),
  asyncHandler(editarViaje)
);

/**
 * @route   DELETE /api/viajes/:id
 * @desc    Delete trip
 * @access  Private (principal admin only)
 */
router.delete(
  '/:id',
  authenticate,
  validateParams(idParamSchema),
  asyncHandler(eliminarViaje)
);

/**
 * @route   GET /api/viajes/:id/estadisticas
 * @desc    Get trip statistics
 * @access  Private (trip members only)
 */
router.get(
  '/:id/estadisticas',
  authenticate,
  validateParams(idParamSchema),
  asyncHandler(obtenerEstadisticas)
);

module.exports = router;
