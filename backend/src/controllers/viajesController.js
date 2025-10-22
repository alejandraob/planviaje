/**
 * Viajes Controller
 * Handles all trip-related HTTP requests
 */

const { Viaje, MiembroViaje, Usuario, Cronograma, Franja, Alojamiento, Actividad, Gasto } = require('../models');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');
const {
  validateTripDuration,
  createCronograma,
  addUserAsPrincipalAdmin,
  checkUserAccessToTrip,
  isUserAdmin,
  canDeleteTrip,
  updateTripState
} = require('../services/viajesService');

/**
 * Create new trip
 * @route POST /api/viajes
 * @access Private
 */
const crearViaje = async (req, res) => {
  const {
    nombre,
    tipo,
    alcance,
    fecha_inicio,
    fecha_fin,
    descripcion,
    max_miembros,
    max_subgrupos,
    max_franjas
  } = req.body;
  const idUsuario = req.user.id_usuario;

  // Validate trip duration
  validateTripDuration(fecha_inicio, fecha_fin);

  // Create trip
  const viaje = await Viaje.create({
    id_admin_principal: idUsuario,
    nombre,
    tipo,
    alcance,
    fecha_inicio,
    fecha_fin,
    descripcion,
    estado: 'planificacion',
    max_miembros: max_miembros || 30,
    max_subgrupos: max_subgrupos || 30,
    max_franjas: max_franjas || 999
  });

  // Create cronograma for the trip
  await createCronograma(viaje.id_viaje, fecha_inicio, fecha_fin);

  // Add creator as principal admin member
  await addUserAsPrincipalAdmin(viaje.id_viaje, idUsuario);

  logger.info(`Trip ${viaje.id_viaje} created by user ${idUsuario}`);

  res.status(201).json({
    success: true,
    message: 'Trip created successfully',
    data: {
      viaje
    }
  });
};

/**
 * Get trip details
 * @route GET /api/viajes/:id
 * @access Private (trip members only)
 */
const obtenerViaje = async (req, res) => {
  const { id } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  const viaje = await Viaje.findByPk(id, {
    include: [
      {
        model: Usuario,
        as: 'adminPrincipal',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'avatar_url']
      },
      {
        model: Usuario,
        as: 'adminSecundario',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'avatar_url']
      },
      {
        model: Cronograma,
        as: 'cronograma',
        attributes: ['id_cronograma', 'fecha_inicio', 'fecha_fin', 'estado']
      },
      {
        model: MiembroViaje,
        as: 'miembros',
        where: { estado_participacion: 'activo' },
        required: false,
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'avatar_url']
          }
        ]
      }
    ]
  });

  if (!viaje) {
    throw new NotFoundError('Trip not found');
  }

  // Update trip state based on dates
  await updateTripState(viaje);

  res.json({
    success: true,
    data: {
      viaje
    }
  });
};

/**
 * List user's trips
 * @route GET /api/viajes
 * @access Private
 */
const listarMisViajes = async (req, res) => {
  const idUsuario = req.user.id_usuario;
  const { estado, tipo, page = 1, limit = 20 } = req.query;

  const offset = (page - 1) * limit;

  // Build where clause
  const whereClause = {};
  if (estado) whereClause.estado = estado;
  if (tipo) whereClause.tipo = tipo;

  // Find all trips where user is a member
  const miembros = await MiembroViaje.findAll({
    where: {
      id_usuario: idUsuario,
      estado_participacion: 'activo'
    },
    attributes: ['id_viaje', 'rol']
  });

  const viajeIds = miembros.map(m => m.id_viaje);

  if (viajeIds.length === 0) {
    return res.json({
      success: true,
      data: {
        viajes: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: 0
        }
      }
    });
  }

  whereClause.id_viaje = viajeIds;

  const { count, rows: viajes } = await Viaje.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Usuario,
        as: 'adminPrincipal',
        attributes: ['id_usuario', 'nombre', 'apellido', 'avatar_url']
      },
      {
        model: MiembroViaje,
        as: 'miembros',
        where: { estado_participacion: 'activo' },
        required: false,
        attributes: ['id_miembro_viaje']
      }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['fecha_inicio', 'DESC']]
  });

  // Add user role to each trip
  const viajesWithRole = viajes.map(viaje => {
    const miembro = miembros.find(m => m.id_viaje === viaje.id_viaje);
    const viajeJson = viaje.toJSON();
    return {
      ...viajeJson,
      mi_rol: miembro ? miembro.rol : null,
      total_miembros: viajeJson.miembros ? viajeJson.miembros.length : 0
    };
  });

  res.json({
    success: true,
    data: {
      viajes: viajesWithRole,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    }
  });
};

/**
 * Update trip
 * @route PUT /api/viajes/:id
 * @access Private (admin only)
 */
const editarViaje = async (req, res) => {
  const { id } = req.params;
  const idUsuario = req.user.id_usuario;
  const { nombre, descripcion, estado, max_miembros, max_subgrupos } = req.body;

  // Check if user is admin
  const esAdmin = await isUserAdmin(id, idUsuario);
  if (!esAdmin) {
    throw new ForbiddenError('Only admins can edit trips');
  }

  const viaje = await Viaje.findByPk(id);
  if (!viaje) {
    throw new NotFoundError('Trip not found');
  }

  // Validate state transitions
  if (estado) {
    const validTransitions = {
      'planificacion': ['en_curso', 'cancelado'],
      'en_curso': ['finalizado', 'cancelado'],
      'finalizado': [],
      'cancelado': []
    };

    if (estado !== viaje.estado) {
      if (!validTransitions[viaje.estado].includes(estado)) {
        throw new BadRequestError(`Cannot transition from ${viaje.estado} to ${estado}`);
      }
    }
  }

  // Update trip
  const updateData = {};
  if (nombre) updateData.nombre = nombre;
  if (descripcion !== undefined) updateData.descripcion = descripcion;
  if (estado) updateData.estado = estado;
  if (max_miembros) updateData.max_miembros = max_miembros;
  if (max_subgrupos) updateData.max_subgrupos = max_subgrupos;

  await viaje.update(updateData);

  logger.info(`Trip ${id} updated by user ${idUsuario}`);

  res.json({
    success: true,
    message: 'Trip updated successfully',
    data: {
      viaje
    }
  });
};

/**
 * Delete trip
 * @route DELETE /api/viajes/:id
 * @access Private (principal admin only)
 */
const eliminarViaje = async (req, res) => {
  const { id } = req.params;
  const idUsuario = req.user.id_usuario;

  const viaje = await Viaje.findByPk(id);
  if (!viaje) {
    throw new NotFoundError('Trip not found');
  }

  // Only principal admin can delete
  if (viaje.id_admin_principal !== idUsuario) {
    throw new ForbiddenError('Only principal admin can delete trips');
  }

  // Check if trip can be deleted
  const canDelete = await canDeleteTrip(viaje);
  if (!canDelete) {
    throw new BadRequestError('Cannot delete trip with active members or expenses');
  }

  // Delete related records first
  await MiembroViaje.destroy({ where: { id_viaje: id } });
  await Cronograma.destroy({ where: { id_viaje: id } });

  // Delete trip
  await viaje.destroy();

  logger.info(`Trip ${id} deleted by user ${idUsuario}`);

  res.json({
    success: true,
    message: 'Trip deleted successfully'
  });
};

/**
 * Get trip statistics
 * @route GET /api/viajes/:id/estadisticas
 * @access Private (trip members only)
 */
const obtenerEstadisticas = async (req, res) => {
  const { id } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  const viaje = await Viaje.findByPk(id);
  if (!viaje) {
    throw new NotFoundError('Trip not found');
  }

  // Count statistics
  const totalMiembros = await MiembroViaje.count({
    where: { id_viaje: id, estado_participacion: 'activo' }
  });

  const totalFranjas = await Franja.count({
    where: { id_viaje: id, estado_franja: { [require('sequelize').Op.ne]: 'cancelada' } }
  });

  const totalAlojamientos = await Alojamiento.count({
    where: { id_viaje: id }
  });

  const totalActividades = await Actividad.count({
    where: { id_viaje: id, estado_actividad: { [require('sequelize').Op.ne]: 'cancelada' } }
  });

  const gastos = await Gasto.findAll({
    where: { id_viaje: id, estado_gasto: { [require('sequelize').Op.ne]: 'cancelado' } },
    attributes: ['monto_ars', 'monto_clp', 'monto_usd']
  });

  const totalGastoARS = gastos.reduce((sum, g) => sum + parseFloat(g.monto_ars || 0), 0);
  const totalGastoCLP = gastos.reduce((sum, g) => sum + parseFloat(g.monto_clp || 0), 0);
  const totalGastoUSD = gastos.reduce((sum, g) => sum + parseFloat(g.monto_usd || 0), 0);

  res.json({
    success: true,
    data: {
      estadisticas: {
        total_miembros: totalMiembros,
        total_franjas: totalFranjas,
        total_alojamientos: totalAlojamientos,
        total_actividades: totalActividades,
        gastos_totales: {
          ars: totalGastoARS,
          clp: totalGastoCLP,
          usd: totalGastoUSD
        },
        duracion_dias: Math.ceil((new Date(viaje.fecha_fin) - new Date(viaje.fecha_inicio)) / (1000 * 60 * 60 * 24)),
        estado: viaje.estado
      }
    }
  });
};

module.exports = {
  crearViaje,
  obtenerViaje,
  listarMisViajes,
  editarViaje,
  eliminarViaje,
  obtenerEstadisticas
};
