/**
 * Viajes Service
 * Business logic for trips
 */

const { Viaje, MiembroViaje, Usuario, Cronograma } = require('../models');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Check if user can access trip
 * @param {number} idViaje - Trip ID
 * @param {number} idUsuario - User ID
 * @returns {Promise<Object>} Member info
 */
const checkUserAccessToTrip = async (idViaje, idUsuario) => {
  const miembro = await MiembroViaje.findOne({
    where: {
      id_viaje: idViaje,
      id_usuario: idUsuario,
      estado_participacion: 'activo'
    }
  });

  if (!miembro) {
    throw new ForbiddenError('You do not have access to this trip');
  }

  return miembro;
};

/**
 * Check if user is admin of trip
 * @param {number} idViaje - Trip ID
 * @param {number} idUsuario - User ID
 * @returns {Promise<boolean>}
 */
const isUserAdmin = async (idViaje, idUsuario) => {
  const miembro = await MiembroViaje.findOne({
    where: {
      id_viaje: idViaje,
      id_usuario: idUsuario,
      estado_participacion: 'activo'
    }
  });

  return miembro && (miembro.rol === 'admin_principal' || miembro.rol === 'admin_secundario');
};

/**
 * Validate trip duration (max 365 days)
 * @param {Date} fechaInicio
 * @param {Date} fechaFin
 */
const validateTripDuration = (fechaInicio, fechaFin) => {
  const start = new Date(fechaInicio);
  const end = new Date(fechaFin);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 365) {
    throw new BadRequestError('Trip duration cannot exceed 365 days');
  }
};

/**
 * Create cronograma for trip
 * @param {number} idViaje - Trip ID
 * @param {Date} fechaInicio
 * @param {Date} fechaFin
 */
const createCronograma = async (idViaje, fechaInicio, fechaFin) => {
  try {
    const cronograma = await Cronograma.create({
      id_viaje: idViaje,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      estado: 'activo'
    });

    logger.info(`Cronograma created for trip ${idViaje}`);
    return cronograma;
  } catch (error) {
    logger.error('Error creating cronograma:', error);
    throw error;
  }
};

/**
 * Add user as principal admin member
 * @param {number} idViaje - Trip ID
 * @param {number} idUsuario - User ID
 */
const addUserAsPrincipalAdmin = async (idViaje, idUsuario) => {
  try {
    const miembro = await MiembroViaje.create({
      id_viaje: idViaje,
      id_usuario: idUsuario,
      rol: 'admin_principal',
      estado_participacion: 'activo'
    });

    logger.info(`User ${idUsuario} added as admin_principal to trip ${idViaje}`);
    return miembro;
  } catch (error) {
    logger.error('Error adding user as admin:', error);
    throw error;
  }
};

/**
 * Count active members in trip
 * @param {number} idViaje - Trip ID
 * @returns {Promise<number>}
 */
const countActiveMembers = async (idViaje) => {
  return await MiembroViaje.count({
    where: {
      id_viaje: idViaje,
      estado_participacion: 'activo'
    }
  });
};

/**
 * Check if trip can be deleted
 * @param {Object} viaje - Trip object
 * @returns {boolean}
 */
const canDeleteTrip = async (viaje) => {
  // Check if has active members (besides admin)
  const activeMembers = await countActiveMembers(viaje.id_viaje);
  if (activeMembers > 1) {
    return false;
  }

  // Check if has expenses
  const { Gasto } = require('../models');
  const gastosCount = await Gasto.count({
    where: { id_viaje: viaje.id_viaje }
  });

  if (gastosCount > 0) {
    return false;
  }

  return true;
};

/**
 * Change trip state based on dates
 * @param {Object} viaje - Trip object
 */
const updateTripState = async (viaje) => {
  const today = new Date();
  const fechaInicio = new Date(viaje.fecha_inicio);
  const fechaFin = new Date(viaje.fecha_fin);

  let newState = viaje.estado;

  if (today < fechaInicio) {
    newState = 'planificacion';
  } else if (today >= fechaInicio && today <= fechaFin) {
    newState = 'en_curso';
  } else if (today > fechaFin) {
    newState = 'finalizado';
  }

  if (newState !== viaje.estado) {
    await viaje.update({ estado: newState });
    logger.info(`Trip ${viaje.id_viaje} state updated to ${newState}`);
  }
};

module.exports = {
  checkUserAccessToTrip,
  isUserAdmin,
  validateTripDuration,
  createCronograma,
  addUserAsPrincipalAdmin,
  countActiveMembers,
  canDeleteTrip,
  updateTripState
};
