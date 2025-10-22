/**
 * Pagos Service
 * Business logic for payment management
 */

const { Pago, Deuda, MiembroViaje, Usuario, Viaje } = require('../models');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');
const { Op } = require('sequelize');

/**
 * Check if user has access to trip
 */
const checkUserAccessToTrip = async (idViaje, idUsuario) => {
  const miembro = await MiembroViaje.findOne({
    where: {
      id_viaje: idViaje,
      id_usuario: idUsuario,
      estado_participacion: ['activo', 'pausado']
    }
  });

  if (!miembro) {
    throw new ForbiddenError('You do not have access to this trip');
  }

  return miembro;
};

/**
 * Validate that debt belongs to trip
 */
const validateDebtBelongsToTrip = async (idViaje, idDeuda) => {
  const deuda = await Deuda.findOne({
    where: {
      id_deuda: idDeuda,
      id_viaje: idViaje
    }
  });

  if (!deuda) {
    throw new NotFoundError('Debt not found in this trip');
  }

  return deuda;
};

/**
 * Validate payment amount
 */
const validatePaymentAmount = async (idDeuda, montoArs) => {
  const deuda = await Deuda.findByPk(idDeuda);

  if (!deuda) {
    throw new NotFoundError('Debt not found');
  }

  // Calculate current balance
  const pagos = await Pago.findAll({
    where: {
      id_deuda: idDeuda,
      estado_pago: 'confirmado'
    }
  });

  const totalPagado = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto_ars), 0);
  const pendiente = parseFloat(deuda.monto_ars) - totalPagado;

  if (montoArs > pendiente) {
    throw new BadRequestError(`Payment amount (${montoArs}) exceeds pending debt (${pendiente.toFixed(2)})`);
  }

  if (montoArs <= 0) {
    throw new BadRequestError('Payment amount must be greater than zero');
  }

  return { deuda, pendiente };
};

/**
 * Validate payer is the debtor
 */
const validatePayerIsDebtor = async (idDeuda, idUsuarioPagador) => {
  const deuda = await Deuda.findByPk(idDeuda, {
    include: [
      {
        model: Usuario,
        as: 'deudor',
        attributes: ['id_usuario']
      }
    ]
  });

  if (!deuda) {
    throw new NotFoundError('Debt not found');
  }

  if (deuda.deudor.id_usuario !== idUsuarioPagador) {
    throw new ForbiddenError('Only the debtor can make payments');
  }

  return deuda;
};

/**
 * Validate confirmer is the creditor or admin
 */
const validateConfirmerPermissions = async (idDeuda, idViaje, idUsuario) => {
  const deuda = await Deuda.findByPk(idDeuda, {
    include: [
      {
        model: Usuario,
        as: 'acreedor',
        attributes: ['id_usuario']
      }
    ]
  });

  if (!deuda) {
    throw new NotFoundError('Debt not found');
  }

  // Check if user is creditor
  if (deuda.acreedor.id_usuario === idUsuario) {
    return true;
  }

  // Check if user is admin
  const viaje = await Viaje.findByPk(idViaje);
  if (viaje && viaje.id_admin_principal === idUsuario) {
    return true;
  }

  throw new ForbiddenError('Only the creditor or trip admin can confirm payments');
};

/**
 * Update debt status based on payments
 */
const updateDebtStatus = async (idDeuda) => {
  const deuda = await Deuda.findByPk(idDeuda);

  if (!deuda) {
    throw new NotFoundError('Debt not found');
  }

  // Calculate total paid
  const pagos = await Pago.findAll({
    where: {
      id_deuda: idDeuda,
      estado_pago: 'confirmado'
    }
  });

  const totalPagado = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto_ars), 0);
  const montoOriginal = parseFloat(deuda.monto_ars);

  // Update debt status
  if (totalPagado >= montoOriginal) {
    await deuda.update({ estado: 'pagada' });
  } else if (totalPagado > 0) {
    await deuda.update({ estado: 'pendiente' }); // Keep as pending if partially paid
  }

  return deuda;
};

/**
 * Calculate payment statistics for a debt
 */
const getDebtPaymentStats = async (idDeuda) => {
  const deuda = await Deuda.findByPk(idDeuda);

  if (!deuda) {
    throw new NotFoundError('Debt not found');
  }

  const pagos = await Pago.findAll({
    where: { id_deuda: idDeuda }
  });

  const confirmados = pagos.filter(p => p.estado_pago === 'confirmado');
  const pendientes = pagos.filter(p => p.estado_pago === 'pendiente');
  const rechazados = pagos.filter(p => p.estado_pago === 'rechazado');

  const totalConfirmado = confirmados.reduce((sum, p) => sum + parseFloat(p.monto_ars), 0);
  const totalPendiente = pendientes.reduce((sum, p) => sum + parseFloat(p.monto_ars), 0);

  return {
    monto_original: parseFloat(deuda.monto_ars),
    total_confirmado: totalConfirmado,
    total_pendiente: totalPendiente,
    monto_restante: parseFloat(deuda.monto_ars) - totalConfirmado,
    cantidad_pagos_confirmados: confirmados.length,
    cantidad_pagos_pendientes: pendientes.length,
    cantidad_pagos_rechazados: rechazados.length
  };
};

module.exports = {
  checkUserAccessToTrip,
  validateDebtBelongsToTrip,
  validatePaymentAmount,
  validatePayerIsDebtor,
  validateConfirmerPermissions,
  updateDebtStatus,
  getDebtPaymentStats
};
