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
  viajesFiltrosSchema,
  cambiarAdminSchema,
  idParamSchema
} = require('../utils/validationSchemas');
const {
  crearViaje,
  obtenerViaje,
  listarMisViajes,
  editarViaje,
  eliminarViaje,
  obtenerEstadisticas
} = require('../controllers/viajesController');
const { cambiarAdminSecundario } = require('../controllers/miembrosController');

// Mount miembros routes
const miembrosRoutes = require('./miembros.routes');
router.use('/:id/miembros', miembrosRoutes);

// Mount franjas routes
const franjasRoutes = require('./franjas.routes');
router.use('/:id/franjas', franjasRoutes);

// Mount alojamientos routes
const alojamientosRoutes = require('./alojamientos.routes');
router.use('/:id/alojamientos', alojamientosRoutes);

// Mount actividades routes
const actividadesRoutes = require('./actividades.routes');
router.use('/:id/actividades', actividadesRoutes);

// Mount gastos routes
const gastosRoutes = require('./gastos.routes');
router.use('/:id/gastos', gastosRoutes);

// Mount deudas routes
const deudasRoutes = require('./deudas.routes');
router.use('/:id/deudas', deudasRoutes);

// Mount subgrupos routes
const subgruposRoutes = require('./subgrupos.routes');
router.use('/:id/subgrupos', subgruposRoutes);

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
  validateQuery(viajesFiltrosSchema),
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

/**
 * @route   PUT /api/viajes/:id/admin-secundario
 * @desc    Change secondary admin
 * @access  Private (principal admin only)
 */
router.put(
  '/:id/admin-secundario',
  authenticate,
  validateParams(idParamSchema),
  validateBody(cambiarAdminSchema),
  asyncHandler(cambiarAdminSecundario)
);

module.exports = router;
