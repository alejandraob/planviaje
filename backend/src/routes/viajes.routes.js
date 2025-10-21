const express = require('express');
const router = express.Router();
const viajesController = require('../controllers/viajesController');
const deudasController = require('../controllers/deudasController');
const reportesController = require('../controllers/reportesController');

/**
 * Rutas de Viajes
 */

// GET /api/viajes - Obtener todos los viajes del usuario
router.get('/', viajesController.obtenerViajes.bind(viajesController));

// POST /api/viajes - Crear nuevo viaje
router.post('/', viajesController.crearViaje.bind(viajesController));

// GET /api/viajes/:id - Obtener detalle de un viaje
router.get('/:id', viajesController.obtenerViajeDetalle.bind(viajesController));

// PUT /api/viajes/:id - Actualizar un viaje
router.put('/:id', viajesController.actualizarViaje.bind(viajesController));

// DELETE /api/viajes/:id - Eliminar un viaje
router.delete('/:id', viajesController.eliminarViaje.bind(viajesController));

/**
 * Rutas de Deudas de un Viaje
 */

// POST /api/viajes/:id/deudas/calcular - Calcular deudas del viaje
router.post('/:id/deudas/calcular', deudasController.calcularDeudas.bind(deudasController));

// GET /api/viajes/:id/deudas/balance - Obtener balance de deudas
router.get('/:id/deudas/balance', deudasController.obtenerDeudas.bind(deudasController));

// GET /api/viajes/:id/deudas - Obtener deudas del viaje
router.get('/:id/deudas', deudasController.obtenerDeudas.bind(deudasController));

/**
 * Rutas de Reportes de un Viaje
 */

// GET /api/viajes/:id/reportes/resumen-financiero - Reporte financiero resumido (debe ir antes que /:id/reportes)
router.get('/:id/reportes/resumen-financiero', reportesController.generarReporteViaje.bind(reportesController));

// GET /api/viajes/:id/reportes/periodo - Reporte por período
router.get('/:id/reportes/periodo', reportesController.generarReportePorPeriodo.bind(reportesController));

// GET /api/viajes/:id/reportes/monedas - Reporte comparativo de monedas
router.get('/:id/reportes/monedas', reportesController.generarReporteComparativoMonedas.bind(reportesController));

// GET /api/viajes/:id/reportes - Generar reporte completo del viaje (debe ir al final)
router.get('/:id/reportes', reportesController.generarReporteViaje.bind(reportesController));

module.exports = router;
