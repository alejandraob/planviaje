/**
 * Notificaciones Routes
 * Routes for notification management
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');
const {
  enviarNotificacionSchema,
  difundirNotificacionSchema,
  notificacionesFiltrosSchema,
  idNotificacionParamSchema,
  marcarTodasLeidasQuerySchema
} = require('../utils/validationSchemas');
const {
  enviarNotificacion,
  difundirNotificacionController,
  listarNotificaciones,
  obtenerNotificacion,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
  obtenerConteoNoLeidasController,
  obtenerEstadisticasNotificaciones
} = require('../controllers/notificacionesController');

// Special routes (must be before /:id)
router.get(
  '/no-leidas/conteo',
  authenticate,
  asyncHandler(obtenerConteoNoLeidasController)
);

router.get(
  '/estadisticas',
  authenticate,
  asyncHandler(obtenerEstadisticasNotificaciones)
);

router.put(
  '/leer-todas',
  authenticate,
  validateQuery(marcarTodasLeidasQuerySchema),
  asyncHandler(marcarTodasLeidas)
);

router.post(
  '/difundir',
  authenticate,
  validateBody(difundirNotificacionSchema),
  asyncHandler(difundirNotificacionController)
);

// Standard CRUD routes
router.post(
  '/',
  authenticate,
  validateBody(enviarNotificacionSchema),
  asyncHandler(enviarNotificacion)
);

router.get(
  '/',
  authenticate,
  validateQuery(notificacionesFiltrosSchema),
  asyncHandler(listarNotificaciones)
);

router.get(
  '/:id',
  authenticate,
  validateParams(idNotificacionParamSchema),
  asyncHandler(obtenerNotificacion)
);

router.put(
  '/:id/leer',
  authenticate,
  validateParams(idNotificacionParamSchema),
  asyncHandler(marcarNotificacionLeida)
);

router.delete(
  '/:id',
  authenticate,
  validateParams(idNotificacionParamSchema),
  asyncHandler(eliminarNotificacion)
);

module.exports = router;
