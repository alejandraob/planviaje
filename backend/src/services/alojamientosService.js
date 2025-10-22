/**
 * Alojamientos Service
 * Business logic for accommodation management
 */

const { Viaje, Franja, Alojamiento, MiembroViaje } = require('../models');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');

/**
 * Check if user has access to the trip
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

  const isAdmin = viaje.id_admin_principal === idUsuario ||
                  viaje.id_admin_secundario_actual === idUsuario;

  return { viaje, isAdmin };
};

/**
 * Validate that franja exists and belongs to the trip
 */
const validateFranjaForTrip = async (idViaje, idFranja) => {
  if (!idFranja) {
    return null; // Optional franja
  }

  const franja = await Franja.findOne({
    where: {
      id_franja: idFranja,
      id_viaje: idViaje
    }
  });

  if (!franja) {
    throw new BadRequestError('Franja does not exist or does not belong to this trip');
  }

  return franja;
};

/**
 * Validate that accommodation dates are within franja dates
 */
const validateDatesWithinFranja = (franja, fechaCheckin, fechaCheckout) => {
  if (!franja) {
    return true; // No franja to validate against
  }

  const franjaStart = new Date(franja.fecha_inicio);
  const franjaEnd = new Date(franja.fecha_fin);
  const checkin = new Date(fechaCheckin);
  const checkout = new Date(fechaCheckout);

  if (checkin < franjaStart || checkout > franjaEnd) {
    throw new BadRequestError(
      `Accommodation dates must be within franja dates (${franja.fecha_inicio} to ${franja.fecha_fin})`
    );
  }

  if (checkout <= checkin) {
    throw new BadRequestError('fecha_checkout must be after fecha_checkin');
  }

  return true;
};

/**
 * Validate that accommodation dates are within trip dates
 */
const validateDatesWithinTrip = async (idViaje, fechaCheckin, fechaCheckout) => {
  const viaje = await Viaje.findByPk(idViaje);

  if (!viaje) {
    throw new NotFoundError('Trip not found');
  }

  const tripStart = new Date(viaje.fecha_inicio);
  const tripEnd = new Date(viaje.fecha_fin);
  const checkin = new Date(fechaCheckin);
  const checkout = new Date(fechaCheckout);

  if (checkin < tripStart || checkout > tripEnd) {
    throw new BadRequestError(
      `Accommodation dates must be within trip dates (${viaje.fecha_inicio} to ${viaje.fecha_fin})`
    );
  }

  if (checkout <= checkin) {
    throw new BadRequestError('fecha_checkout must be after fecha_checkin');
  }

  return viaje;
};

/**
 * Validate assigned members belong to the trip
 */
const validateMiembrosAsignados = async (idViaje, miembrosAsignados) => {
  if (!miembrosAsignados || !Array.isArray(miembrosAsignados) || miembrosAsignados.length === 0) {
    return true; // Optional field
  }

  // Check that all members exist and belong to the trip
  const miembros = await MiembroViaje.findAll({
    where: {
      id_miembro_viaje: miembrosAsignados,
      id_viaje: idViaje,
      estado_participacion: ['activo', 'pausado']
    }
  });

  if (miembros.length !== miembrosAsignados.length) {
    throw new BadRequestError('Some assigned members do not exist or do not belong to this trip');
  }

  return true;
};

/**
 * Calculate monto_faltante based on monto_total and monto_pagado
 */
const calculateMontoFaltante = (montoTotal, montoPagado) => {
  if (!montoTotal) {
    return null;
  }

  const total = parseFloat(montoTotal);
  const pagado = parseFloat(montoPagado || 0);

  return total - pagado;
};

/**
 * Determine estado_pago based on amounts
 */
const determineEstadoPago = (montoTotal, montoPagado) => {
  if (!montoTotal) {
    return 'no_pagado';
  }

  const total = parseFloat(montoTotal);
  const pagado = parseFloat(montoPagado || 0);

  if (pagado === 0) {
    return 'no_pagado';
  } else if (pagado >= total) {
    return 'pagado';
  } else {
    return 'parcialmente_pagado';
  }
};

/**
 * Check if user can modify/delete accommodation
 * User must be admin or the creator of the accommodation
 */
const canModifyAlojamiento = async (alojamiento, idUsuario) => {
  // Check if user is admin
  const { isAdmin } = await isUserAdmin(alojamiento.id_viaje, idUsuario);

  // User can modify if they are admin or creator
  const canModify = isAdmin || alojamiento.id_usuario_creador === idUsuario;

  return { canModify, isAdmin, isCreator: alojamiento.id_usuario_creador === idUsuario };
};

/**
 * Validate that user making reservation is a trip member
 */
const validateUsuarioReserva = async (idViaje, idUsuarioReserva) => {
  if (!idUsuarioReserva) {
    return true; // Optional field
  }

  const miembro = await MiembroViaje.findOne({
    where: {
      id_viaje: idViaje,
      id_usuario: idUsuarioReserva,
      estado_participacion: ['activo', 'pausado']
    }
  });

  if (!miembro) {
    throw new BadRequestError('User making reservation is not a member of this trip');
  }

  return true;
};

module.exports = {
  checkUserAccessToTrip,
  isUserAdmin,
  validateFranjaForTrip,
  validateDatesWithinFranja,
  validateDatesWithinTrip,
  validateMiembrosAsignados,
  calculateMontoFaltante,
  determineEstadoPago,
  canModifyAlojamiento,
  validateUsuarioReserva
};
