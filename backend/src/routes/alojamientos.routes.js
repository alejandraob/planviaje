/**
 * Alojamientos Routes
 * Routes for accommodation management (nested under viajes)
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // Enables access to parent route params
const { authenticate } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  crearAlojamiento,
  listarAlojamientos,
  obtenerAlojamiento,
  editarAlojamiento,
  eliminarAlojamiento,
  actualizarPago,
  obtenerEstadisticasAlojamientos
} = require('../controllers/alojamientosController');
const {
  crearAlojamientoSchema,
  editarAlojamientoSchema,
  actualizarPagoAlojamientoSchema,
  idAlojamientoParamSchema,
  alojamientosFiltrosSchema
} = require('../utils/validationSchemas');

// Get statistics (must be before :idAlojamiento routes)
router.get(
  '/estadisticas',
  authenticate,
  asyncHandler(obtenerEstadisticasAlojamientos)
);

// Create alojamiento
router.post(
  '/',
  authenticate,
  validateBody(crearAlojamientoSchema),
  asyncHandler(crearAlojamiento)
);

// List alojamientos
router.get(
  '/',
  authenticate,
  validateQuery(alojamientosFiltrosSchema),
  asyncHandler(listarAlojamientos)
);

// Get alojamiento details
router.get(
  '/:idAlojamiento',
  authenticate,
  validateParams(idAlojamientoParamSchema),
  asyncHandler(obtenerAlojamiento)
);

// Update alojamiento
router.put(
  '/:idAlojamiento',
  authenticate,
  validateParams(idAlojamientoParamSchema),
  validateBody(editarAlojamientoSchema),
  asyncHandler(editarAlojamiento)
);

// Delete alojamiento
router.delete(
  '/:idAlojamiento',
  authenticate,
  validateParams(idAlojamientoParamSchema),
  asyncHandler(eliminarAlojamiento)
);

// Update payment
router.put(
  '/:idAlojamiento/pago',
  authenticate,
  validateParams(idAlojamientoParamSchema),
  validateBody(actualizarPagoAlojamientoSchema),
  asyncHandler(actualizarPago)
);

module.exports = router;
