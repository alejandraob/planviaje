/**
 * Gastos Routes
 * Routes for expense management
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :id from parent
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');
const {
  crearGastoSchema,
  editarGastoSchema,
  actualizarEstadoGastoSchema,
  idGastoParamSchema,
  gastosFiltrosSchema
} = require('../utils/validationSchemas');
const {
  crearGasto,
  listarGastos,
  obtenerGasto,
  editarGasto,
  eliminarGasto,
  actualizarEstadoGasto,
  obtenerEstadisticasGastos
} = require('../controllers/gastosController');

// Statistics route (must be before /:idGasto)
router.get(
  '/estadisticas',
  authenticate,
  asyncHandler(obtenerEstadisticasGastos)
);

// CRUD routes
router.post(
  '/',
  authenticate,
  validateBody(crearGastoSchema),
  asyncHandler(crearGasto)
);

router.get(
  '/',
  authenticate,
  validateQuery(gastosFiltrosSchema),
  asyncHandler(listarGastos)
);

router.get(
  '/:idGasto',
  authenticate,
  validateParams(idGastoParamSchema),
  asyncHandler(obtenerGasto)
);

router.put(
  '/:idGasto',
  authenticate,
  validateParams(idGastoParamSchema),
  validateBody(editarGastoSchema),
  asyncHandler(editarGasto)
);

router.delete(
  '/:idGasto',
  authenticate,
  validateParams(idGastoParamSchema),
  asyncHandler(eliminarGasto)
);

// Status update route
router.put(
  '/:idGasto/estado',
  authenticate,
  validateParams(idGastoParamSchema),
  validateBody(actualizarEstadoGastoSchema),
  asyncHandler(actualizarEstadoGasto)
);

module.exports = router;
