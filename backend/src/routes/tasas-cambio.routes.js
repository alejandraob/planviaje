const express = require('express');
const router = express.Router();
const tasasCambioController = require('../controllers/tasasCambioController');

/**
 * Rutas de Tasas de Cambio
 * Base: /api/tasas-cambio
 */

// GET /api/tasas-cambio - Obtener tasa actual
router.get('/', tasasCambioController.obtenerTasaActual.bind(tasasCambioController));

// GET /api/tasas-cambio/historial - Obtener hist├│rico de tasas
router.get('/historial', tasasCambioController.obtenerHistorial.bind(tasasCambioController));

// POST /api/tasas-cambio/actualizar-api - Actualizar desde API externa
router.post('/actualizar-api', tasasCambioController.actualizarTasasDesdeAPI.bind(tasasCambioController));

// POST /api/tasas-cambio/actualizar-automatico - Alias para actualizar desde API externa
router.post('/actualizar-automatico', tasasCambioController.actualizarTasasDesdeAPI.bind(tasasCambioController));

// POST /api/tasas-cambio/manual - Crear tasa manualmente
router.post('/manual', tasasCambioController.crearTasaManual.bind(tasasCambioController));

// POST /api/tasas-cambio - Crear nueva tasa (con recalculo de gastos)
router.post('/', tasasCambioController.crearTasaManual.bind(tasasCambioController));

module.exports = router;
