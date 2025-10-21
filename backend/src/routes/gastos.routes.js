const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams permite acceder a :id del parent route
const gastosController = require('../controllers/gastosController');

/**
 * Rutas de Gastos
 * Base: /api/viajes/:id/gastos
 */

// GET /api/viajes/:id/gastos - Obtener todos los gastos de un viaje
router.get('/', gastosController.obtenerGastos.bind(gastosController));

// POST /api/viajes/:id/gastos - Crear nuevo gasto
router.post('/', gastosController.crearGasto.bind(gastosController));

// POST /api/viajes/:id/gastos/recalcular - Recalcular gastos por cambio de tasa
router.post('/recalcular', gastosController.recalcularGastos.bind(gastosController));

// GET /api/gastos/:gastoId - Obtener un gasto específico
router.get('/:gastoId', gastosController.obtenerGasto.bind(gastosController));

// PUT /api/gastos/:gastoId - Actualizar un gasto
router.put('/:gastoId', gastosController.actualizarGasto.bind(gastosController));

// DELETE /api/gastos/:gastoId - Eliminar un gasto
router.delete('/:gastoId', gastosController.eliminarGasto.bind(gastosController));

module.exports = router;
