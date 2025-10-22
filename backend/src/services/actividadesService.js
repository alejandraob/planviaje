/**
 * Actividades Service
 * Business logic for activity management
 */

const { Viaje, Franja, Actividad, MiembroViaje } = require('../models');
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
 * Validate that activity date is within franja dates
 */
const validateDateWithinFranja = (franja, fecha) => {
  if (!franja) {
    return true; // No franja to validate against
  }

  const franjaStart = new Date(franja.fecha_inicio);
  const franjaEnd = new Date(franja.fecha_fin);
  const actividadDate = new Date(fecha);

  if (actividadDate < franjaStart || actividadDate > franjaEnd) {
    throw new BadRequestError(
      `Activity date must be within franja dates (${franja.fecha_inicio} to ${franja.fecha_fin})`
    );
  }

  return true;
};

/**
 * Validate that activity date is within trip dates
 */
const validateDateWithinTrip = async (idViaje, fecha) => {
  const viaje = await Viaje.findByPk(idViaje);

  if (!viaje) {
    throw new NotFoundError('Trip not found');
  }

  const tripStart = new Date(viaje.fecha_inicio);
  const tripEnd = new Date(viaje.fecha_fin);
  const actividadDate = new Date(fecha);

  if (actividadDate < tripStart || actividadDate > tripEnd) {
    throw new BadRequestError(
      `Activity date must be within trip dates (${viaje.fecha_inicio} to ${viaje.fecha_fin})`
    );
  }

  return viaje;
};

/**
 * Validate assigned members belong to the trip
 */
const validateMiembrosAsignados = async (idViaje, miembrosAsignados) => {
  if (!miembrosAsignados || !Array.isArray(miembrosAsignados) || miembrosAsignados.length === 0) {
    throw new BadRequestError('At least one member must be assigned to the activity');
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
 * Check if user can modify/delete activity
 * User must be admin or the creator of the activity
 */
const canModifyActividad = async (actividad, idUsuario) => {
  // Check if user is admin
  const { isAdmin } = await isUserAdmin(actividad.id_viaje, idUsuario);

  // User can modify if they are admin or creator
  const canModify = isAdmin || actividad.id_usuario_creador === idUsuario;

  return { canModify, isAdmin, isCreator: actividad.id_usuario_creador === idUsuario };
};

/**
 * Validate that user making payment is a trip member
 */
const validateUsuarioPago = async (idViaje, idUsuarioPago) => {
  if (!idUsuarioPago) {
    return true; // Optional field
  }

  const miembro = await MiembroViaje.findOne({
    where: {
      id_viaje: idViaje,
      id_usuario: idUsuarioPago,
      estado_participacion: ['activo', 'pausado']
    }
  });

  if (!miembro) {
    throw new BadRequestError('User making payment is not a member of this trip');
  }

  return true;
};

/**
 * Update activity state based on current date and time
 */
const updateActividadState = async (actividad) => {
  if (actividad.estado_actividad === 'cancelada' || actividad.estado_actividad === 'suspendida') {
    return actividad.estado_actividad; // Don't auto-update these states
  }

  const now = new Date();
  const actividadDate = new Date(actividad.fecha);

  // Set time to start of day for comparison
  now.setHours(0, 0, 0, 0);
  actividadDate.setHours(0, 0, 0, 0);

  let newState = actividad.estado_actividad;

  if (actividadDate > now) {
    newState = 'programada';
  } else if (actividadDate.getTime() === now.getTime()) {
    // Check if we have time information
    if (actividad.hora) {
      const currentTime = new Date();
      const [hours, minutes] = actividad.hora.split(':');
      const actividadTime = new Date();
      actividadTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (currentTime >= actividadTime) {
        newState = 'en_curso';
      } else {
        newState = 'programada';
      }
    } else {
      newState = 'en_curso';
    }
  } else {
    newState = 'completada';
  }

  if (newState !== actividad.estado_actividad) {
    await actividad.update({ estado_actividad: newState });
  }

  return newState;
};

/**
 * Determine payment state based on es_paga flag
 */
const determineEstadoPago = (esPaga, idUsuarioPago) => {
  if (!esPaga) {
    return 'no_pagada'; // Free activity
  }

  if (idUsuarioPago) {
    return 'pagada'; // Someone paid
  }

  return 'no_pagada'; // Paid activity but not paid yet
};

module.exports = {
  checkUserAccessToTrip,
  isUserAdmin,
  validateFranjaForTrip,
  validateDateWithinFranja,
  validateDateWithinTrip,
  validateMiembrosAsignados,
  canModifyActividad,
  validateUsuarioPago,
  updateActividadState,
  determineEstadoPago
};
