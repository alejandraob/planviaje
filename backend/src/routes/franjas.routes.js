/**
 * Franjas Routes
 * Routes for time slot management (nested under viajes)
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // Enables access to parent route params
const { authenticate } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  crearFranja,
  listarFranjas,
  obtenerFranja,
  editarFranja,
  eliminarFranja,
  reordenarFranja,
  obtenerEstadisticasFranjas
} = require('../controllers/franjasController');
const {
  crearFranjaSchema,
  editarFranjaSchema,
  reordenarFranjaSchema,
  idFranjaParamSchema,
  franjasFiltrosSchema
} = require('../utils/validationSchemas');

// Get statistics (must be before :idFranja routes)
router.get(
  '/estadisticas',
  authenticate,
  asyncHandler(obtenerEstadisticasFranjas)
);

// Create franja
router.post(
  '/',
  authenticate,
  validateBody(crearFranjaSchema),
  asyncHandler(crearFranja)
);

// List franjas
router.get(
  '/',
  authenticate,
  validateQuery(franjasFiltrosSchema),
  asyncHandler(listarFranjas)
);

// Get franja details
router.get(
  '/:idFranja',
  authenticate,
  validateParams(idFranjaParamSchema),
  asyncHandler(obtenerFranja)
);

// Update franja
router.put(
  '/:idFranja',
  authenticate,
  validateParams(idFranjaParamSchema),
  validateBody(editarFranjaSchema),
  asyncHandler(editarFranja)
);

// Delete franja
router.delete(
  '/:idFranja',
  authenticate,
  validateParams(idFranjaParamSchema),
  asyncHandler(eliminarFranja)
);

// Reorder franja
router.put(
  '/:idFranja/reorder',
  authenticate,
  validateParams(idFranjaParamSchema),
  validateBody(reordenarFranjaSchema),
  asyncHandler(reordenarFranja)
);

module.exports = router;
