/**
 * Actividades Routes
 * Routes for activity management (nested under viajes)
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  crearActividad,
  listarActividades,
  obtenerActividad,
  editarActividad,
  eliminarActividad,
  actualizarPago,
  obtenerEstadisticasActividades
} = require('../controllers/actividadesController');
const {
  crearActividadSchema,
  editarActividadSchema,
  actualizarPagoActividadSchema,
  idActividadParamSchema,
  actividadesFiltrosSchema
} = require('../utils/validationSchemas');

// Get statistics (must be before :idActividad routes)
router.get(
  '/estadisticas',
  authenticate,
  asyncHandler(obtenerEstadisticasActividades)
);

// Create actividad
router.post(
  '/',
  authenticate,
  validateBody(crearActividadSchema),
  asyncHandler(crearActividad)
);

// List actividades
router.get(
  '/',
  authenticate,
  validateQuery(actividadesFiltrosSchema),
  asyncHandler(listarActividades)
);

// Get actividad details
router.get(
  '/:idActividad',
  authenticate,
  validateParams(idActividadParamSchema),
  asyncHandler(obtenerActividad)
);

// Update actividad
router.put(
  '/:idActividad',
  authenticate,
  validateParams(idActividadParamSchema),
  validateBody(editarActividadSchema),
  asyncHandler(editarActividad)
);

// Delete actividad
router.delete(
  '/:idActividad',
  authenticate,
  validateParams(idActividadParamSchema),
  asyncHandler(eliminarActividad)
);

// Update payment
router.put(
  '/:idActividad/pago',
  authenticate,
  validateParams(idActividadParamSchema),
  validateBody(actualizarPagoActividadSchema),
  asyncHandler(actualizarPago)
);

module.exports = router;
