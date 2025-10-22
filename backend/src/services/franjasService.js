/**
 * Franjas Service
 * Business logic for time slot management
 */

const { Viaje, Franja, Cronograma, Alojamiento, Actividad } = require('../models');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');

/**
 * Check if user has access to the trip
 */
const checkUserAccessToTrip = async (idViaje, idUsuario) => {
  const { MiembroViaje } = require('../models');

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
 * Validate that franja dates are within trip dates
 */
const validateFranjaWithinTrip = async (idViaje, fechaInicio, fechaFin) => {
  const viaje = await Viaje.findByPk(idViaje);

  if (!viaje) {
    throw new NotFoundError('Trip not found');
  }

  const tripStart = new Date(viaje.fecha_inicio);
  const tripEnd = new Date(viaje.fecha_fin);
  const franjaStart = new Date(fechaInicio);
  const franjaEnd = new Date(fechaFin);

  if (franjaStart < tripStart || franjaEnd > tripEnd) {
    throw new BadRequestError(
      `Franja dates must be within trip dates (${viaje.fecha_inicio} to ${viaje.fecha_fin})`
    );
  }

  if (franjaEnd <= franjaStart) {
    throw new BadRequestError('fecha_fin must be after fecha_inicio');
  }

  return viaje;
};

/**
 * Check for overlapping franjas
 */
const checkFranjaOverlap = async (idViaje, fechaInicio, fechaFin, excludeIdFranja = null) => {
  const whereClause = {
    id_viaje: idViaje,
    estado_franja: ['programada', 'en_curso', 'completada']
  };

  if (excludeIdFranja) {
    whereClause.id_franja = { [require('sequelize').Op.ne]: excludeIdFranja };
  }

  const overlappingFranjas = await Franja.findAll({
    where: whereClause,
    attributes: ['id_franja', 'nombre_lugar', 'fecha_inicio', 'fecha_fin']
  });

  const newStart = new Date(fechaInicio);
  const newEnd = new Date(fechaFin);

  const hasOverlap = overlappingFranjas.some(franja => {
    const existingStart = new Date(franja.fecha_inicio);
    const existingEnd = new Date(franja.fecha_fin);

    // Check if ranges overlap
    return (newStart < existingEnd && newEnd > existingStart);
  });

  if (hasOverlap) {
    throw new BadRequestError('Franja dates overlap with existing franjas');
  }

  return true;
};

/**
 * Calculate next sequence order for a trip
 */
const getNextOrdenSecuencia = async (idViaje) => {
  const maxOrden = await Franja.max('orden_secuencia', {
    where: { id_viaje: idViaje }
  });

  return (maxOrden || 0) + 1;
};

/**
 * Reorder franjas after deletion or reordering
 */
const reorderFranjas = async (idViaje) => {
  const franjas = await Franja.findAll({
    where: {
      id_viaje: idViaje,
      estado_franja: ['programada', 'en_curso', 'completada']
    },
    order: [['fecha_inicio', 'ASC']]
  });

  // Update orden_secuencia based on chronological order
  for (let i = 0; i < franjas.length; i++) {
    if (franjas[i].orden_secuencia !== i + 1) {
      await franjas[i].update({ orden_secuencia: i + 1 });
    }
  }

  return franjas.length;
};

/**
 * Check if franja can be deleted (no related alojamientos or actividades)
 */
const canDeleteFranja = async (idFranja) => {
  const alojamientosCount = await Alojamiento.count({
    where: { id_franja: idFranja }
  });

  const actividadesCount = await Actividad.count({
    where: { id_franja: idFranja }
  });

  if (alojamientosCount > 0 || actividadesCount > 0) {
    return {
      canDelete: false,
      alojamientos: alojamientosCount,
      actividades: actividadesCount
    };
  }

  return { canDelete: true };
};

/**
 * Update franja state based on current date
 */
const updateFranjaState = async (franja) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fechaInicio = new Date(franja.fecha_inicio);
  const fechaFin = new Date(franja.fecha_fin);

  let newState = franja.estado_franja;

  if (franja.estado_franja !== 'cancelada') {
    if (today < fechaInicio) {
      newState = 'programada';
    } else if (today >= fechaInicio && today <= fechaFin) {
      newState = 'en_curso';
    } else if (today > fechaFin) {
      newState = 'completada';
    }

    if (newState !== franja.estado_franja) {
      await franja.update({ estado_franja: newState });
    }
  }

  return newState;
};

/**
 * Get cronograma for a trip
 */
const getCronogramaForTrip = async (idViaje) => {
  const cronograma = await Cronograma.findOne({
    where: { id_viaje: idViaje }
  });

  if (!cronograma) {
    throw new NotFoundError('Cronograma not found for this trip');
  }

  return cronograma;
};

module.exports = {
  checkUserAccessToTrip,
  isUserAdmin,
  validateFranjaWithinTrip,
  checkFranjaOverlap,
  getNextOrdenSecuencia,
  reorderFranjas,
  canDeleteFranja,
  updateFranjaState,
  getCronogramaForTrip
};
