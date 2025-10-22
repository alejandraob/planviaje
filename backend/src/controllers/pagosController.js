/**
 * Pagos Controller
 * HTTP request handlers for payment management
 */

const { Pago, Deuda, Usuario } = require('../models');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');
const {
  checkUserAccessToTrip,
  validateDebtBelongsToTrip,
  validatePaymentAmount,
  validatePayerIsDebtor,
  validateConfirmerPermissions,
  updateDebtStatus,
  getDebtPaymentStats
} = require('../services/pagosService');

/**
 * POST /api/viajes/:id/deudas/:idDeuda/pagos
 * Register a new payment for a debt
 */
const registrarPago = async (req, res, next) => {
  const { id, idDeuda } = req.params;
  const idUsuario = req.user.id_usuario;
  const {
    monto_ars,
    monto_clp,
    monto_usd,
    metodo_pago,
    comprobante_url,
    observacion
  } = req.body;

  // Check user access to trip
  await checkUserAccessToTrip(id, idUsuario);

  // Validate debt belongs to trip
  await validateDebtBelongsToTrip(id, idDeuda);

  // Validate payment amount
  await validatePaymentAmount(idDeuda, monto_ars);

  // Validate payer is the debtor
  await validatePayerIsDebtor(idDeuda, idUsuario);

  // Create payment
  const pago = await Pago.create({
    id_deuda: parseInt(idDeuda),
    id_pagador: idUsuario,
    monto_ars,
    monto_clp: monto_clp || null,
    monto_usd: monto_usd || null,
    metodo_pago: metodo_pago || 'transferencia',
    comprobante_url: comprobante_url || null,
    observacion: observacion || null,
    estado_pago: 'pendiente', // Default to pending until confirmed
    fecha_pago: new Date()
  });

  // Reload with associations
  await pago.reload({
    include: [
      {
        model: Usuario,
        as: 'pagador',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email']
      },
      {
        model: Deuda,
        as: 'deuda',
        attributes: ['id_deuda', 'monto_ars', 'descripcion']
      }
    ]
  });

  res.status(201).json({
    success: true,
    data: pago,
    message: 'Payment registered successfully. Waiting for confirmation.'
  });
};

/**
 * GET /api/viajes/:id/deudas/:idDeuda/pagos
 * List all payments for a specific debt
 */
const listarPagos = async (req, res, next) => {
  const { id, idDeuda } = req.params;
  const idUsuario = req.user.id_usuario;
  const {
    estado_pago,
    metodo_pago,
    page = 1,
    limit = 20
  } = req.query;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Validate debt
  await validateDebtBelongsToTrip(id, idDeuda);

  // Build where clause
  const whereClause = { id_deuda: idDeuda };

  if (estado_pago) whereClause.estado_pago = estado_pago;
  if (metodo_pago) whereClause.metodo_pago = metodo_pago;

  // Get payments with pagination
  const offset = (page - 1) * limit;
  const { count, rows: pagos } = await Pago.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Usuario,
        as: 'pagador',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email']
      },
      {
        model: Usuario,
        as: 'confirmador',
        attributes: ['id_usuario', 'nombre', 'apellido'],
        required: false
      }
    ],
    order: [['fecha_pago', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });

  res.json({
    success: true,
    data: pagos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  });
};

/**
 * GET /api/viajes/:id/deudas/:idDeuda/pagos/:idPago
 * Get payment details
 */
const obtenerPago = async (req, res, next) => {
  const { id, idDeuda, idPago } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get payment
  const pago = await Pago.findOne({
    where: {
      id_pago: idPago,
      id_deuda: idDeuda
    },
    include: [
      {
        model: Usuario,
        as: 'pagador',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'telefono']
      },
      {
        model: Usuario,
        as: 'confirmador',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email'],
        required: false
      },
      {
        model: Deuda,
        as: 'deuda',
        attributes: ['id_deuda', 'monto_ars', 'descripcion', 'estado'],
        include: [
          {
            model: Usuario,
            as: 'acreedor',
            attributes: ['id_usuario', 'nombre', 'apellido', 'email']
          },
          {
            model: Usuario,
            as: 'deudor',
            attributes: ['id_usuario', 'nombre', 'apellido', 'email']
          }
        ]
      }
    ]
  });

  if (!pago) {
    throw new NotFoundError('Payment not found');
  }

  res.json({
    success: true,
    data: pago
  });
};

/**
 * PUT /api/viajes/:id/deudas/:idDeuda/pagos/:idPago/confirmar
 * Confirm a payment (only creditor or admin)
 */
const confirmarPago = async (req, res, next) => {
  const { id, idDeuda, idPago } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Validate confirmer permissions
  await validateConfirmerPermissions(idDeuda, id, idUsuario);

  // Get payment
  const pago = await Pago.findOne({
    where: {
      id_pago: idPago,
      id_deuda: idDeuda
    }
  });

  if (!pago) {
    throw new NotFoundError('Payment not found');
  }

  if (pago.estado_pago === 'confirmado') {
    throw new BadRequestError('Payment is already confirmed');
  }

  if (pago.estado_pago === 'rechazado') {
    throw new BadRequestError('Cannot confirm a rejected payment');
  }

  // Confirm payment
  await pago.update({
    estado_pago: 'confirmado',
    id_confirmador: idUsuario,
    fecha_confirmacion: new Date()
  });

  // Update debt status
  await updateDebtStatus(idDeuda);

  // Reload with associations
  await pago.reload({
    include: [
      {
        model: Usuario,
        as: 'pagador',
        attributes: ['id_usuario', 'nombre', 'apellido']
      },
      {
        model: Usuario,
        as: 'confirmador',
        attributes: ['id_usuario', 'nombre', 'apellido']
      }
    ]
  });

  res.json({
    success: true,
    data: pago,
    message: 'Payment confirmed successfully'
  });
};

/**
 * PUT /api/viajes/:id/deudas/:idDeuda/pagos/:idPago/rechazar
 * Reject a payment (only creditor or admin)
 */
const rechazarPago = async (req, res, next) => {
  const { id, idDeuda, idPago } = req.params;
  const idUsuario = req.user.id_usuario;
  const { motivo_rechazo } = req.body;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Validate confirmer permissions
  await validateConfirmerPermissions(idDeuda, id, idUsuario);

  // Get payment
  const pago = await Pago.findOne({
    where: {
      id_pago: idPago,
      id_deuda: idDeuda
    }
  });

  if (!pago) {
    throw new NotFoundError('Payment not found');
  }

  if (pago.estado_pago === 'confirmado') {
    throw new BadRequestError('Cannot reject a confirmed payment');
  }

  // Reject payment
  await pago.update({
    estado_pago: 'rechazado',
    observacion: motivo_rechazo || pago.observacion
  });

  // Reload with associations
  await pago.reload({
    include: [
      {
        model: Usuario,
        as: 'pagador',
        attributes: ['id_usuario', 'nombre', 'apellido']
      }
    ]
  });

  res.json({
    success: true,
    data: pago,
    message: 'Payment rejected'
  });
};

/**
 * DELETE /api/viajes/:id/deudas/:idDeuda/pagos/:idPago
 * Delete payment (only if pending and by payer)
 */
const eliminarPago = async (req, res, next) => {
  const { id, idDeuda, idPago } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get payment
  const pago = await Pago.findOne({
    where: {
      id_pago: idPago,
      id_deuda: idDeuda
    }
  });

  if (!pago) {
    throw new NotFoundError('Payment not found');
  }

  // Only payer can delete their own payment
  if (pago.id_pagador !== idUsuario) {
    throw new ForbiddenError('Only the payer can delete this payment');
  }

  // Can only delete pending payments
  if (pago.estado_pago !== 'pendiente') {
    throw new BadRequestError('Can only delete pending payments');
  }

  await pago.destroy();

  res.json({
    success: true,
    message: 'Payment deleted successfully'
  });
};

/**
 * GET /api/viajes/:id/deudas/:idDeuda/pagos/estadisticas
 * Get payment statistics for a debt
 */
const obtenerEstadisticasPagos = async (req, res, next) => {
  const { id, idDeuda } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Validate debt
  await validateDebtBelongsToTrip(id, idDeuda);

  // Get statistics
  const stats = await getDebtPaymentStats(idDeuda);

  res.json({
    success: true,
    data: stats
  });
};

module.exports = {
  registrarPago,
  listarPagos,
  obtenerPago,
  confirmarPago,
  rechazarPago,
  eliminarPago,
  obtenerEstadisticasPagos
};
