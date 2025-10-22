/**
 * Miembros Service
 * Business logic for trip members management
 */

const { MiembroViaje, Usuario, Viaje } = require('../models');
const { NotFoundError, ForbiddenError, BadRequestError, ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Check if user is member of trip
 */
async function checkUserIsMember(idViaje, idUsuario) {
  const miembro = await MiembroViaje.findOne({
    where: {
      id_viaje: idViaje,
      id_usuario: idUsuario,
      estado_participacion: 'activo'
    }
  });

  if (!miembro) {
    throw new ForbiddenError('You are not a member of this trip');
  }

  return miembro;
}

/**
 * Check if user is admin (principal or secondary)
 */
async function checkUserIsAdmin(idViaje, idUsuario) {
  const miembro = await checkUserIsMember(idViaje, idUsuario);

  if (miembro.rol !== 'admin_principal' && miembro.rol !== 'admin_secundario') {
    throw new ForbiddenError('Admin access required');
  }

  return miembro;
}

/**
 * Check if user is principal admin
 */
async function checkUserIsPrincipalAdmin(idViaje, idUsuario) {
  const miembro = await checkUserIsMember(idViaje, idUsuario);

  if (miembro.rol !== 'admin_principal') {
    throw new ForbiddenError('Principal admin access required');
  }

  return miembro;
}

/**
 * Validate that user exists
 */
async function validateUserExists(email) {
  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario) {
    throw new NotFoundError(`User with email ${email} not found`);
  }

  if (usuario.estado !== 'activo') {
    throw new BadRequestError('User account is not active');
  }

  return usuario;
}

/**
 * Check if user is already a member
 */
async function checkUserNotAlreadyMember(idViaje, idUsuario) {
  const existingMember = await MiembroViaje.findOne({
    where: {
      id_viaje: idViaje,
      id_usuario: idUsuario,
      estado_participacion: { [require('sequelize').Op.in]: ['activo', 'pausado'] }
    }
  });

  if (existingMember) {
    throw new ConflictError('User is already a member of this trip');
  }
}

/**
 * Check trip capacity
 */
async function checkTripCapacity(viaje) {
  const currentMembers = await MiembroViaje.count({
    where: {
      id_viaje: viaje.id_viaje,
      estado_participacion: 'activo'
    }
  });

  if (currentMembers >= viaje.max_miembros) {
    throw new BadRequestError(`Trip has reached maximum capacity (${viaje.max_miembros} members)`);
  }
}

/**
 * Validate if member is a minor and has legal guardian
 */
function validateMinorMember(esMenor, idResponsableLegal) {
  if (esMenor && !idResponsableLegal) {
    throw new BadRequestError('Minor members must have a legal guardian (id_responsable_legal)');
  }

  if (!esMenor && idResponsableLegal) {
    throw new BadRequestError('Only minor members can have a legal guardian');
  }
}

/**
 * Check if member can be removed
 */
async function canRemoveMember(miembro) {
  // Cannot remove principal admin
  if (miembro.rol === 'admin_principal') {
    throw new BadRequestError('Cannot remove principal admin from trip');
  }

  // Check if member has pending debts
  const { Deuda } = require('../models');
  const pendingDebts = await Deuda.count({
    where: {
      id_viaje: miembro.id_viaje,
      [require('sequelize').Op.or]: [
        { id_deudor: miembro.id_usuario },
        { id_acreedor: miembro.id_usuario }
      ],
      estado_deuda: { [require('sequelize').Op.notIn]: ['saldada', 'condonada'] }
    }
  });

  if (pendingDebts > 0) {
    throw new BadRequestError('Cannot remove member with pending debts. Settle debts first.');
  }

  return true;
}

/**
 * Count active members in trip
 */
async function countActiveMembers(idViaje) {
  return await MiembroViaje.count({
    where: {
      id_viaje: idViaje,
      estado_participacion: 'activo'
    }
  });
}

/**
 * Validate admin change
 */
async function validateAdminChange(viaje, newAdminId, currentUserId) {
  // Only principal admin can change secondary admin
  if (viaje.id_admin_principal !== currentUserId) {
    throw new ForbiddenError('Only principal admin can change secondary admin');
  }

  // New admin must be an active member
  const newAdminMember = await MiembroViaje.findOne({
    where: {
      id_viaje: viaje.id_viaje,
      id_usuario: newAdminId,
      estado_participacion: 'activo'
    }
  });

  if (!newAdminMember) {
    throw new BadRequestError('New admin must be an active member of the trip');
  }

  // Cannot set principal admin as secondary admin
  if (newAdminId === viaje.id_admin_principal) {
    throw new BadRequestError('Principal admin cannot be set as secondary admin');
  }

  return newAdminMember;
}

module.exports = {
  checkUserIsMember,
  checkUserIsAdmin,
  checkUserIsPrincipalAdmin,
  validateUserExists,
  checkUserNotAlreadyMember,
  checkTripCapacity,
  validateMinorMember,
  canRemoveMember,
  countActiveMembers,
  validateAdminChange
};
