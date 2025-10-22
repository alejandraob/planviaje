/**
 * Deudas Routes
 * Routes for debt management
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');
const {
  crearDeudaSchema,
  editarDeudaSchema,
  actualizarEstadoDeudaSchema,
  idDeudaParamSchema,
  deudasFiltrosSchema
} = require('../utils/validationSchemas');
const {
  crearDeuda,
  listarDeudas,
  obtenerDeuda,
  editarDeuda,
  eliminarDeuda,
  actualizarEstadoDeuda,
  obtenerEstadisticasDeudas,
  obtenerResumenDeudas
} = require('../controllers/deudasController');

// Mount pagos routes (nested under deudas)
const pagosRoutes = require('./pagos.routes');
router.use('/:idDeuda/pagos', pagosRoutes);

// Special routes (must be before /:idDeuda)
router.get(
  '/estadisticas',
  authenticate,
  asyncHandler(obtenerEstadisticasDeudas)
);

router.get(
  '/resumen',
  authenticate,
  asyncHandler(obtenerResumenDeudas)
);

// CRUD routes
router.post(
  '/',
  authenticate,
  validateBody(crearDeudaSchema),
  asyncHandler(crearDeuda)
);

router.get(
  '/',
  authenticate,
  validateQuery(deudasFiltrosSchema),
  asyncHandler(listarDeudas)
);

router.get(
  '/:idDeuda',
  authenticate,
  validateParams(idDeudaParamSchema),
  asyncHandler(obtenerDeuda)
);

router.put(
  '/:idDeuda',
  authenticate,
  validateParams(idDeudaParamSchema),
  validateBody(editarDeudaSchema),
  asyncHandler(editarDeuda)
);

router.delete(
  '/:idDeuda',
  authenticate,
  validateParams(idDeudaParamSchema),
  asyncHandler(eliminarDeuda)
);

// Status update route
router.put(
  '/:idDeuda/estado',
  authenticate,
  validateParams(idDeudaParamSchema),
  validateBody(actualizarEstadoDeudaSchema),
  asyncHandler(actualizarEstadoDeuda)
);

module.exports = router;
