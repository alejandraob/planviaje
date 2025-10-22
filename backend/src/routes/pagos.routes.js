/**
 * Pagos Routes
 * Routes for payment management (nested under deudas)
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // Important for nested routes
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');
const {
  registrarPagoSchema,
  rechazarPagoSchema,
  idPagoParamSchema,
  pagosFiltrosSchema
} = require('../utils/validationSchemas');
const {
  registrarPago,
  listarPagos,
  obtenerPago,
  confirmarPago,
  rechazarPago,
  eliminarPago,
  obtenerEstadisticasPagos
} = require('../controllers/pagosController');

/**
 * @route   POST /api/viajes/:id/deudas/:idDeuda/pagos
 * @desc    Register a new payment for a debt
 * @access  Private (debtor only)
 */
router.post(
  '/',
  authenticate,
  validateBody(registrarPagoSchema),
  asyncHandler(registrarPago)
);

/**
 * @route   GET /api/viajes/:id/deudas/:idDeuda/pagos
 * @desc    List all payments for a debt
 * @access  Private (trip members)
 */
router.get(
  '/',
  authenticate,
  validateQuery(pagosFiltrosSchema),
  asyncHandler(listarPagos)
);

/**
 * @route   GET /api/viajes/:id/deudas/:idDeuda/pagos/estadisticas
 * @desc    Get payment statistics for a debt
 * @access  Private (trip members)
 */
router.get(
  '/estadisticas',
  authenticate,
  asyncHandler(obtenerEstadisticasPagos)
);

/**
 * @route   GET /api/viajes/:id/deudas/:idDeuda/pagos/:idPago
 * @desc    Get payment details
 * @access  Private (trip members)
 */
router.get(
  '/:idPago',
  authenticate,
  validateParams(idPagoParamSchema),
  asyncHandler(obtenerPago)
);

/**
 * @route   PUT /api/viajes/:id/deudas/:idDeuda/pagos/:idPago/confirmar
 * @desc    Confirm a payment
 * @access  Private (creditor or admin only)
 */
router.put(
  '/:idPago/confirmar',
  authenticate,
  validateParams(idPagoParamSchema),
  asyncHandler(confirmarPago)
);

/**
 * @route   PUT /api/viajes/:id/deudas/:idDeuda/pagos/:idPago/rechazar
 * @desc    Reject a payment
 * @access  Private (creditor or admin only)
 */
router.put(
  '/:idPago/rechazar',
  authenticate,
  validateParams(idPagoParamSchema),
  validateBody(rechazarPagoSchema),
  asyncHandler(rechazarPago)
);

/**
 * @route   DELETE /api/viajes/:id/deudas/:idDeuda/pagos/:idPago
 * @desc    Delete payment (only if pending)
 * @access  Private (payer only)
 */
router.delete(
  '/:idPago',
  authenticate,
  validateParams(idPagoParamSchema),
  asyncHandler(eliminarPago)
);

module.exports = router;
