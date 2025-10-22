/**
 * Gastos Service
 * Business logic for expense management
 */

const { Gasto, Viaje, MiembroViaje, Usuario, Alojamiento, Actividad, Deuda } = require('../models');
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
 * Validate expense date within trip dates
 */
const validateExpenseDateWithinTrip = async (idViaje, fecha) => {
  const viaje = await Viaje.findByPk(idViaje);

  if (!viaje) {
    throw new NotFoundError('Trip not found');
  }

  const expenseDate = new Date(fecha);
  const tripStart = new Date(viaje.fecha_inicio);
  const tripEnd = new Date(viaje.fecha_fin);

  if (expenseDate < tripStart || expenseDate > tripEnd) {
    throw new BadRequestError(
      `Expense date must be within trip dates (${viaje.fecha_inicio} to ${viaje.fecha_fin})`
    );
  }

  return true;
};

/**
 * Validate assigned members for expense
 */
const validateMiembrosAsignados = async (idViaje, miembrosAsignados) => {
  if (!miembrosAsignados || miembrosAsignados.length === 0) {
    throw new BadRequestError('At least one member must be assigned to the expense');
  }

  // Verify all members belong to the trip
  for (const asignacion of miembrosAsignados) {
    const miembro = await MiembroViaje.findOne({
      where: {
        id_miembro_viaje: asignacion.id_miembro_viaje,
        id_viaje: idViaje,
        estado_participacion: ['activo', 'pausado']
      }
    });

    if (!miembro) {
      throw new BadRequestError(`Member ${asignacion.id_miembro_viaje} not found in trip`);
    }

    // Validate monto_corresponde is positive
    if (asignacion.monto_corresponde <= 0) {
      throw new BadRequestError('Assigned amount must be positive');
    }
  }

  return true;
};

/**
 * Validate expense references (alojamiento or actividad)
 */
const validateExpenseReferences = async (idViaje, idAlojamiento, idActividad) => {
  if (idAlojamiento) {
    const alojamiento = await Alojamiento.findOne({
      where: {
        id_alojamiento: idAlojamiento,
        id_viaje: idViaje
      }
    });

    if (!alojamiento) {
      throw new NotFoundError('Referenced accommodation not found');
    }
  }

  if (idActividad) {
    const actividad = await Actividad.findOne({
      where: {
        id_actividad: idActividad,
        id_viaje: idViaje
      }
    });

    if (!actividad) {
      throw new NotFoundError('Referenced activity not found');
    }
  }

  return true;
};

/**
 * Validate payment user belongs to trip
 */
const validatePagador = async (idViaje, idUsuarioPagador) => {
  const miembro = await MiembroViaje.findOne({
    where: {
      id_viaje: idViaje,
      id_usuario: idUsuarioPagador,
      estado_participacion: ['activo', 'pausado']
    }
  });

  if (!miembro) {
    throw new BadRequestError('Payment user must be a member of the trip');
  }

  return miembro;
};

/**
 * Calculate total assigned amounts
 */
const calculateTotalAsignado = (miembrosAsignados) => {
  return miembrosAsignados.reduce((sum, asignacion) => {
    return sum + parseFloat(asignacion.monto_corresponde);
  }, 0);
};

/**
 * Determine expense status based on payment info
 */
const determineEstadoGasto = (tipoGasto, montoTotal, miembrosAsignados) => {
  if (tipoGasto === 'personal') {
    return 'pagado';
  }

  // For group expenses, check if assignments cover the total
  if (miembrosAsignados && miembrosAsignados.length > 0) {
    const totalAsignado = calculateTotalAsignado(miembrosAsignados);

    if (totalAsignado >= montoTotal) {
      return 'pagado';
    } else if (totalAsignado > 0) {
      return 'parcialmente_pagado';
    }
  }

  return 'pendiente';
};

/**
 * Validate tipo_division matches tipo_gasto
 */
const validateTipoDivision = (tipoGasto, tipoDivision) => {
  const validCombinations = {
    'personal': ['individual'],
    'grupal': ['todos_miembros', 'miembros_especificos'],
    'subgrupo_privado': ['subgrupos', 'miembros_especificos'],
    'actividad_compartida': ['todos_miembros', 'miembros_especificos']
  };

  if (!validCombinations[tipoGasto].includes(tipoDivision)) {
    throw new BadRequestError(
      `Invalid tipo_division '${tipoDivision}' for tipo_gasto '${tipoGasto}'`
    );
  }

  return true;
};

/**
 * Auto-distribute expense among all members equally
 */
const autoDistributeExpense = async (idViaje, montoTotal) => {
  const miembros = await MiembroViaje.findAll({
    where: {
      id_viaje: idViaje,
      estado_participacion: ['activo', 'pausado']
    }
  });

  const montoPerPerson = montoTotal / miembros.length;

  return miembros.map(miembro => ({
    id_miembro_viaje: miembro.id_miembro_viaje,
    monto_corresponde: parseFloat(montoPerPerson.toFixed(2))
  }));
};

/**
 * Check if expense can be deleted
 */
const canDeleteExpense = async (gasto) => {
  // Check if expense has child expenses
  const childExpenses = await Gasto.count({
    where: { id_gasto_padre: gasto.id_gasto }
  });

  if (childExpenses > 0) {
    throw new BadRequestError('Cannot delete expense with child expenses');
  }

  // Check if expense has associated debts
  const debts = await Deuda.count({
    where: { id_gasto: gasto.id_gasto }
  });

  if (debts > 0) {
    throw new BadRequestError('Cannot delete expense with associated debts. Cancel it instead.');
  }

  return true;
};

module.exports = {
  checkUserAccessToTrip,
  isUserAdmin,
  validateExpenseDateWithinTrip,
  validateMiembrosAsignados,
  validateExpenseReferences,
  validatePagador,
  calculateTotalAsignado,
  determineEstadoGasto,
  validateTipoDivision,
  autoDistributeExpense,
  canDeleteExpense
};
