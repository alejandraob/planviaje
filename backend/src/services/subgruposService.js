/**
 * Subgrupos Service
 * Business logic for subgroup management
 */

const { Subgrupo, SubgrupoMiembro, Viaje, MiembroViaje, Usuario, GastoSubgrupo, DeudaSubgrupo } = require('../models');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');

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
 * Validate subgroup name is unique in trip
 */
const validateSubgroupName = async (idViaje, nombre, excludeId = null) => {
  const whereClause = {
    id_viaje: idViaje,
    nombre,
    estado: ['activo', 'pausado']
  };

  if (excludeId) {
    whereClause.id_subgrupo = { [require('sequelize').Op.ne]: excludeId };
  }

  const existingSubgroup = await Subgrupo.findOne({ where: whereClause });

  if (existingSubgroup) {
    throw new BadRequestError('A subgroup with this name already exists in the trip');
  }

  return true;
};

/**
 * Validate max subgroups limit
 */
const validateMaxSubgroups = async (idViaje) => {
  const viaje = await Viaje.findByPk(idViaje);

  if (!viaje) {
    throw new NotFoundError('Trip not found');
  }

  const activeSubgroups = await Subgrupo.count({
    where: {
      id_viaje: idViaje,
      estado: ['activo', 'pausado']
    }
  });

  if (activeSubgroups >= viaje.max_subgrupos) {
    throw new BadRequestError(`Maximum number of subgroups (${viaje.max_subgrupos}) reached`);
  }

  return true;
};

/**
 * Validate representative belongs to trip
 */
const validateRepresentative = async (idViaje, idRepresentante) => {
  const miembro = await MiembroViaje.findOne({
    where: {
      id_viaje: idViaje,
      id_usuario: idRepresentante,
      estado_participacion: ['activo', 'pausado']
    }
  });

  if (!miembro) {
    throw new BadRequestError('Representative must be an active member of the trip');
  }

  return miembro;
};

/**
 * Validate members belong to trip and are not duplicated
 */
const validateMiembros = async (idViaje, miembrosIds) => {
  if (!miembrosIds || miembrosIds.length === 0) {
    throw new BadRequestError('At least one member is required');
  }

  // Check for duplicates
  const uniqueIds = [...new Set(miembrosIds)];
  if (uniqueIds.length !== miembrosIds.length) {
    throw new BadRequestError('Duplicate members are not allowed');
  }

  // Verify all members belong to trip
  for (const idMiembro of miembrosIds) {
    const miembro = await MiembroViaje.findOne({
      where: {
        id_miembro_viaje: idMiembro,
        id_viaje: idViaje,
        estado_participacion: ['activo', 'pausado']
      }
    });

    if (!miembro) {
      throw new BadRequestError(`Member ${idMiembro} not found in trip`);
    }
  }

  return true;
};

/**
 * Check if subgroup can be deleted
 */
const canDeleteSubgroup = async (subgrupo) => {
  const { GastoSubgrupo, DeudaSubgrupo } = require('../models');

  // Check if subgroup has expenses
  const expenses = await GastoSubgrupo.count({
    where: { id_subgrupo: subgrupo.id_subgrupo }
  });

  if (expenses > 0) {
    throw new BadRequestError('Cannot delete subgroup with associated expenses');
  }

  // Check if subgroup has debts
  const debts = await DeudaSubgrupo.count({
    where: { id_subgrupo: subgrupo.id_subgrupo }
  });

  if (debts > 0) {
    throw new BadRequestError('Cannot delete subgroup with associated debts');
  }

  return true;
};

/**
 * Get subgroup statistics
 */
const getSubgroupStats = async (idSubgrupo) => {
  const { GastoSubgrupo, DeudaSubgrupo } = require('../models');

  // Count members
  const totalMembers = await SubgrupoMiembro.count({
    where: { id_subgrupo: idSubgrupo }
  });

  // Count expenses
  const totalExpenses = await GastoSubgrupo.count({
    where: { id_subgrupo: idSubgrupo }
  });

  // Count debts
  const totalDebts = await DeudaSubgrupo.count({
    where: { id_subgrupo: idSubgrupo }
  });

  return {
    total_miembros: totalMembers,
    total_gastos: totalExpenses,
    total_deudas: totalDebts
  };
};

module.exports = {
  checkUserAccessToTrip,
  isUserAdmin,
  validateSubgroupName,
  validateMaxSubgroups,
  validateRepresentative,
  validateMiembros,
  canDeleteSubgroup,
  getSubgroupStats
};
