/**
 * Deudas Service
 * Business logic for debt management
 */

const { Deuda, Viaje, MiembroViaje, Usuario, Gasto, Pago } = require('../models');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../middleware/errorHandler');

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
 * Check if user is admin of the trip
 */
const isUserAdmin = async (idViaje, idUsuario) => {
  const viaje = await Viaje.findByPk(idViaje);

  if (!viaje) {
    throw new NotFoundError('Trip not found');
  }

  return viaje.id_admin_principal === idUsuario || viaje.id_admin_secundario_actual === idUsuario;
};

/**
 * Validate that acreedor and deudor belong to trip
 */
const validateParticipants = async (idViaje, idAcreedor, idDeudor) => {
  if (idAcreedor === idDeudor) {
    throw new BadRequestError('Creditor and debtor cannot be the same user');
  }

  // Validate acreedor
  const acreedor = await MiembroViaje.findOne({
    where: {
      id_viaje: idViaje,
      id_usuario: idAcreedor,
      estado_participacion: ['activo', 'pausado']
    }
  });

  if (!acreedor) {
    throw new BadRequestError('Creditor is not a member of the trip');
  }

  // Validate deudor
  const deudor = await MiembroViaje.findOne({
    where: {
      id_viaje: idViaje,
      id_usuario: idDeudor,
      estado_participacion: ['activo', 'pausado']
    }
  });

  if (!deudor) {
    throw new BadRequestError('Debtor is not a member of the trip');
  }

  return { acreedor, deudor };
};

/**
 * Validate gasto belongs to trip
 */
const validateGasto = async (idViaje, idGasto) => {
  const gasto = await Gasto.findOne({
    where: {
      id_gasto: idGasto,
      id_viaje: idViaje
    }
  });

  if (!gasto) {
    throw new NotFoundError('Expense not found in this trip');
  }

  return gasto;
};

/**
 * Check for duplicate debt (same viaje, acreedor, deudor, gasto)
 */
const checkDuplicateDebt = async (idViaje, idAcreedor, idDeudor, idGasto, excludeDeudaId = null) => {
  const whereClause = {
    id_viaje: idViaje,
    id_acreedor: idAcreedor,
    id_deudor: idDeudor,
    id_gasto: idGasto
  };

  if (excludeDeudaId) {
    whereClause.id_deuda = { [require('sequelize').Op.ne]: excludeDeudaId };
  }

  const existingDebt = await Deuda.findOne({ where: whereClause });

  if (existingDebt) {
    throw new BadRequestError('A debt with these exact parameters already exists');
  }

  return true;
};

/**
 * Calculate debt balance (total - paid)
 */
const calculateDebtBalance = async (deuda) => {
  // Get all payments for this debt
  const pagos = await Pago.findAll({
    where: { id_deuda: deuda.id_deuda }
  });

  const totalPagado = pagos.reduce((sum, pago) => {
    if (pago.estado_pago === 'confirmado') {
      return sum + parseFloat(pago.monto_ars);
    }
    return sum;
  }, 0);

  const balance = parseFloat(deuda.monto_ars) - totalPagado;

  return {
    monto_original: parseFloat(deuda.monto_ars),
    monto_pagado: totalPagado,
    monto_pendiente: balance
  };
};

/**
 * Check if debt can be deleted
 */
const canDeleteDebt = async (deuda) => {
  // Check if debt has any payments
  const pagos = await Pago.count({
    where: { id_deuda: deuda.id_deuda }
  });

  if (pagos > 0) {
    throw new BadRequestError('Cannot delete debt with associated payments. Cancel it instead.');
  }

  // Can't delete paid debts
  if (deuda.estado_deuda === 'pagada') {
    throw new BadRequestError('Cannot delete paid debt');
  }

  return true;
};

/**
 * Auto-update debt status based on payments
 */
const updateDebtStatus = async (deuda) => {
  const balance = await calculateDebtBalance(deuda);

  let newStatus = deuda.estado_deuda;

  // Don't auto-update if manually cancelled or paused
  if (deuda.estado_deuda === 'cancelada' || deuda.estado_deuda === 'pausada') {
    return deuda.estado_deuda;
  }

  if (balance.monto_pendiente <= 0) {
    newStatus = 'pagada';
    await deuda.update({
      estado_deuda: 'pagada',
      fecha_pago: new Date()
    });
  } else if (balance.monto_pagado > 0) {
    // Has partial payments but not fully paid
    // Keep as pendiente since we don't have 'parcialmente_pagada' status
    newStatus = 'pendiente';
  }

  return newStatus;
};

/**
 * Get debt summary for a user in a trip
 */
const getUserDebtSummary = async (idViaje, idUsuario) => {
  // Debts where user owes money
  const deudasComDeudor = await Deuda.findAll({
    where: {
      id_viaje: idViaje,
      id_deudor: idUsuario,
      estado_deuda: 'pendiente'
    },
    include: [
      {
        model: Usuario,
        as: 'acreedor',
        attributes: ['id_usuario', 'nombre', 'apellido']
      }
    ]
  });

  // Debts where user is owed money
  const deudasComAcreedor = await Deuda.findAll({
    where: {
      id_viaje: idViaje,
      id_acreedor: idUsuario,
      estado_deuda: 'pendiente'
    },
    include: [
      {
        model: Usuario,
        as: 'deudor',
        attributes: ['id_usuario', 'nombre', 'apellido']
      }
    ]
  });

  const totalOwed = deudasComDeudor.reduce((sum, d) => sum + parseFloat(d.monto_ars), 0);
  const totalToReceive = deudasComAcreedor.reduce((sum, d) => sum + parseFloat(d.monto_ars), 0);

  return {
    debts_owed: {
      count: deudasComDeudor.length,
      total_ars: totalOwed,
      debts: deudasComDeudor
    },
    debts_to_receive: {
      count: deudasComAcreedor.length,
      total_ars: totalToReceive,
      debts: deudasComAcreedor
    },
    balance: totalToReceive - totalOwed
  };
};

module.exports = {
  checkUserAccessToTrip,
  isUserAdmin,
  validateParticipants,
  validateGasto,
  checkDuplicateDebt,
  calculateDebtBalance,
  canDeleteDebt,
  updateDebtStatus,
  getUserDebtSummary
};
