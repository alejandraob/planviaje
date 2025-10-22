/**
 * Actividades Controller
 * Handles HTTP requests for activity management
 */

const { Actividad, Franja, Usuario, MiembroViaje } = require('../models');
const { Op } = require('sequelize');
const {
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
} = require('../services/actividadesService');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * POST /api/viajes/:id/actividades
 * Create a new activity for a trip
 * @access Members (any member can create)
 */
const crearActividad = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id_usuario;
    const {
      id_franja,
      nombre,
      fecha,
      hora,
      descripcion,
      tipo_actividad,
      es_paga,
      valor_referencial_ars,
      valor_referencial_clp,
      valor_referencial_usd,
      id_usuario_pago,
      miembros_asignados
    } = req.body;

    // Check access to trip
    await checkUserAccessToTrip(id, idUsuario);

    // Validate franja if provided
    const franja = await validateFranjaForTrip(id, id_franja);

    // Validate date
    if (franja) {
      validateDateWithinFranja(franja, fecha);
    } else {
      await validateDateWithinTrip(id, fecha);
    }

    // Validate assigned members (required)
    await validateMiembrosAsignados(id, miembros_asignados);

    // Validate usuario_pago
    await validateUsuarioPago(id, id_usuario_pago);

    // Determine estado_pago
    const estadoPago = determineEstadoPago(es_paga, id_usuario_pago);

    // Create actividad
    const actividad = await Actividad.create({
      id_viaje: parseInt(id),
      id_franja: id_franja || null,
      nombre,
      fecha,
      hora,
      descripcion,
      tipo_actividad,
      es_paga: es_paga || false,
      valor_referencial_ars,
      valor_referencial_clp,
      valor_referencial_usd,
      estado_pago: estadoPago,
      id_usuario_pago,
      miembros_asignados,
      estado_actividad: 'programada',
      id_usuario_creador: idUsuario
    });

    // Update state based on date
    await updateActividadState(actividad);
    await actividad.reload();

    res.status(201).json({
      success: true,
      data: actividad
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/viajes/:id/actividades
 * List all activities for a trip
 * @access Members
 */
const listarActividades = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id_usuario;
    const { id_franja, tipo_actividad, estado_actividad, es_paga, page = 1, limit = 20 } = req.query;

    // Check access
    await checkUserAccessToTrip(id, idUsuario);

    // Build where clause
    const whereClause = { id_viaje: id };
    if (id_franja) whereClause.id_franja = id_franja;
    if (tipo_actividad) whereClause.tipo_actividad = tipo_actividad;
    if (estado_actividad) whereClause.estado_actividad = estado_actividad;
    if (es_paga !== undefined) whereClause.es_paga = es_paga === 'true';

    // Get actividades with pagination
    const offset = (page - 1) * limit;
    const { count, rows: actividades } = await Actividad.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Franja,
          as: 'franja',
          attributes: ['id_franja', 'nombre_lugar', 'fecha_inicio', 'fecha_fin']
        },
        {
          model: Usuario,
          as: 'usuarioPago',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email']
        },
        {
          model: Usuario,
          as: 'usuarioCreador',
          attributes: ['id_usuario', 'nombre', 'apellido']
        }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Update states
    for (const actividad of actividades) {
      await updateActividadState(actividad);
    }

    // Reload with updated states
    const updatedActividades = await Actividad.findAll({
      where: whereClause,
      include: [
        {
          model: Franja,
          as: 'franja',
          attributes: ['id_franja', 'nombre_lugar', 'fecha_inicio', 'fecha_fin']
        },
        {
          model: Usuario,
          as: 'usuarioPago',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email']
        },
        {
          model: Usuario,
          as: 'usuarioCreador',
          attributes: ['id_usuario', 'nombre', 'apellido']
        }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: updatedActividades,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/viajes/:id/actividades/:idActividad
 * Get details of a specific activity
 * @access Members
 */
const obtenerActividad = async (req, res, next) => {
  try {
    const { id, idActividad } = req.params;
    const idUsuario = req.user.id_usuario;

    // Check access
    await checkUserAccessToTrip(id, idUsuario);

    // Get actividad
    const actividad = await Actividad.findOne({
      where: {
        id_actividad: idActividad,
        id_viaje: id
      },
      include: [
        {
          model: Franja,
          as: 'franja',
          attributes: ['id_franja', 'nombre_lugar', 'fecha_inicio', 'fecha_fin', 'orden_secuencia']
        },
        {
          model: Usuario,
          as: 'usuarioPago',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'telefono']
        },
        {
          model: Usuario,
          as: 'usuarioCreador',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email']
        }
      ]
    });

    if (!actividad) {
      throw new NotFoundError('Actividad not found');
    }

    // Update state
    await updateActividadState(actividad);
    await actividad.reload({
      include: [
        {
          model: Franja,
          as: 'franja',
          attributes: ['id_franja', 'nombre_lugar', 'fecha_inicio', 'fecha_fin', 'orden_secuencia']
        },
        {
          model: Usuario,
          as: 'usuarioPago',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'telefono']
        },
        {
          model: Usuario,
          as: 'usuarioCreador',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email']
        }
      ]
    });

    // Get assigned members details
    let miembrosDetalle = [];
    if (actividad.miembros_asignados && actividad.miembros_asignados.length > 0) {
      const miembros = await MiembroViaje.findAll({
        where: {
          id_miembro_viaje: actividad.miembros_asignados
        },
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'nombre', 'apellido', 'email']
          }
        ]
      });
      miembrosDetalle = miembros;
    }

    res.json({
      success: true,
      data: {
        ...actividad.toJSON(),
        miembros_detalle: miembrosDetalle
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/viajes/:id/actividades/:idActividad
 * Update an activity
 * @access Admin or creator
 */
const editarActividad = async (req, res, next) => {
  try {
    const { id, idActividad } = req.params;
    const idUsuario = req.user.id_usuario;
    const {
      id_franja,
      nombre,
      fecha,
      hora,
      descripcion,
      tipo_actividad,
      es_paga,
      valor_referencial_ars,
      valor_referencial_clp,
      valor_referencial_usd,
      id_usuario_pago,
      miembros_asignados,
      estado_actividad
    } = req.body;

    // Get actividad
    const actividad = await Actividad.findOne({
      where: {
        id_actividad: idActividad,
        id_viaje: id
      }
    });

    if (!actividad) {
      throw new NotFoundError('Actividad not found');
    }

    // Check permission
    const { canModify } = await canModifyActividad(actividad, idUsuario);
    if (!canModify) {
      throw new ForbiddenError('Only admins or the creator can edit this activity');
    }

    // Validate franja if being changed
    if (id_franja !== undefined) {
      const franja = await validateFranjaForTrip(id, id_franja);
      const newFecha = fecha || actividad.fecha;

      if (franja) {
        validateDateWithinFranja(franja, newFecha);
      } else {
        await validateDateWithinTrip(id, newFecha);
      }
    } else if (fecha) {
      // Date is being updated but franja is not
      if (actividad.id_franja) {
        const franja = await validateFranjaForTrip(id, actividad.id_franja);
        validateDateWithinFranja(franja, fecha);
      } else {
        await validateDateWithinTrip(id, fecha);
      }
    }

    // Validate assigned members
    if (miembros_asignados !== undefined) {
      await validateMiembrosAsignados(id, miembros_asignados);
    }

    // Validate usuario_pago
    if (id_usuario_pago !== undefined) {
      await validateUsuarioPago(id, id_usuario_pago);
    }

    // Build update object
    const updateData = {};
    if (id_franja !== undefined) updateData.id_franja = id_franja;
    if (nombre) updateData.nombre = nombre;
    if (fecha) updateData.fecha = fecha;
    if (hora !== undefined) updateData.hora = hora;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (tipo_actividad) updateData.tipo_actividad = tipo_actividad;
    if (es_paga !== undefined) updateData.es_paga = es_paga;
    if (valor_referencial_ars !== undefined) updateData.valor_referencial_ars = valor_referencial_ars;
    if (valor_referencial_clp !== undefined) updateData.valor_referencial_clp = valor_referencial_clp;
    if (valor_referencial_usd !== undefined) updateData.valor_referencial_usd = valor_referencial_usd;
    if (id_usuario_pago !== undefined) updateData.id_usuario_pago = id_usuario_pago;
    if (miembros_asignados !== undefined) updateData.miembros_asignados = miembros_asignados;
    if (estado_actividad) updateData.estado_actividad = estado_actividad;

    // Recalculate estado_pago if payment info changed
    const newEsPaga = es_paga !== undefined ? es_paga : actividad.es_paga;
    const newUsuarioPago = id_usuario_pago !== undefined ? id_usuario_pago : actividad.id_usuario_pago;

    if (es_paga !== undefined || id_usuario_pago !== undefined) {
      updateData.estado_pago = determineEstadoPago(newEsPaga, newUsuarioPago);
    }

    // Update actividad
    await actividad.update(updateData);

    // Update state if date changed
    if (fecha || estado_actividad) {
      await updateActividadState(actividad);
    }

    await actividad.reload({
      include: [
        {
          model: Franja,
          as: 'franja',
          attributes: ['id_franja', 'nombre_lugar', 'fecha_inicio', 'fecha_fin']
        },
        {
          model: Usuario,
          as: 'usuarioPago',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: actividad
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/viajes/:id/actividades/:idActividad
 * Delete an activity
 * @access Admin or creator
 */
const eliminarActividad = async (req, res, next) => {
  try {
    const { id, idActividad } = req.params;
    const idUsuario = req.user.id_usuario;

    // Get actividad
    const actividad = await Actividad.findOne({
      where: {
        id_actividad: idActividad,
        id_viaje: id
      }
    });

    if (!actividad) {
      throw new NotFoundError('Actividad not found');
    }

    // Check permission
    const { canModify } = await canModifyActividad(actividad, idUsuario);
    if (!canModify) {
      throw new ForbiddenError('Only admins or the creator can delete this activity');
    }

    // Delete actividad
    await actividad.destroy();

    res.json({
      success: true,
      message: 'Actividad deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/viajes/:id/actividades/:idActividad/pago
 * Update payment status of an activity
 * @access Admin or creator
 */
const actualizarPago = async (req, res, next) => {
  try {
    const { id, idActividad } = req.params;
    const idUsuario = req.user.id_usuario;
    const { id_usuario_pago } = req.body;

    // Get actividad
    const actividad = await Actividad.findOne({
      where: {
        id_actividad: idActividad,
        id_viaje: id
      }
    });

    if (!actividad) {
      throw new NotFoundError('Actividad not found');
    }

    // Check permission
    const { canModify } = await canModifyActividad(actividad, idUsuario);
    if (!canModify) {
      throw new ForbiddenError('Only admins or the creator can update payment');
    }

    // Validate usuario_pago
    await validateUsuarioPago(id, id_usuario_pago);

    // Determine new estado_pago
    const estadoPago = determineEstadoPago(actividad.es_paga, id_usuario_pago);

    // Update payment info
    await actividad.update({
      id_usuario_pago,
      estado_pago: estadoPago
    });

    await actividad.reload();

    res.json({
      success: true,
      data: actividad
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/viajes/:id/actividades/estadisticas
 * Get statistics for activities in a trip
 * @access Members
 */
const obtenerEstadisticasActividades = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id_usuario;

    // Check access
    await checkUserAccessToTrip(id, idUsuario);

    // Count total
    const totalActividades = await Actividad.count({
      where: { id_viaje: id }
    });

    // Count by estado_actividad
    const programadas = await Actividad.count({
      where: { id_viaje: id, estado_actividad: 'programada' }
    });

    const enCurso = await Actividad.count({
      where: { id_viaje: id, estado_actividad: 'en_curso' }
    });

    const completadas = await Actividad.count({
      where: { id_viaje: id, estado_actividad: 'completada' }
    });

    const canceladas = await Actividad.count({
      where: { id_viaje: id, estado_actividad: 'cancelada' }
    });

    const suspendidas = await Actividad.count({
      where: { id_viaje: id, estado_actividad: 'suspendida' }
    });

    // Count by tipo_actividad
    const porTipo = {};
    const tipos = ['entrada', 'visita', 'comida', 'transporte', 'otro'];
    for (const tipo of tipos) {
      porTipo[tipo] = await Actividad.count({
        where: { id_viaje: id, tipo_actividad: tipo }
      });
    }

    // Count pagas vs gratuitas
    const actividadesPagas = await Actividad.count({
      where: { id_viaje: id, es_paga: true }
    });

    const actividadesGratuitas = await Actividad.count({
      where: { id_viaje: id, es_paga: false }
    });

    // Payment status for paid activities
    const pagadas = await Actividad.count({
      where: { id_viaje: id, es_paga: true, estado_pago: 'pagada' }
    });

    const confirmadas = await Actividad.count({
      where: { id_viaje: id, es_paga: true, estado_pago: 'confirmada' }
    });

    // Calculate total costs
    const actividades = await Actividad.findAll({
      where: { id_viaje: id, es_paga: true },
      attributes: ['valor_referencial_ars', 'valor_referencial_clp', 'valor_referencial_usd']
    });

    let totalArs = 0;
    let totalClp = 0;
    let totalUsd = 0;

    actividades.forEach(act => {
      totalArs += parseFloat(act.valor_referencial_ars || 0);
      totalClp += parseFloat(act.valor_referencial_clp || 0);
      totalUsd += parseFloat(act.valor_referencial_usd || 0);
    });

    res.json({
      success: true,
      data: {
        total_actividades: totalActividades,
        por_estado: {
          programadas,
          en_curso: enCurso,
          completadas,
          canceladas,
          suspendidas
        },
        por_tipo: porTipo,
        pagas_vs_gratuitas: {
          pagas: actividadesPagas,
          gratuitas: actividadesGratuitas
        },
        estado_pago_actividades_pagas: {
          pendientes: actividadesPagas - pagadas - confirmadas,
          pagadas,
          confirmadas
        },
        costos_estimados: {
          ars: parseFloat(totalArs.toFixed(2)),
          clp: parseFloat(totalClp.toFixed(2)),
          usd: parseFloat(totalUsd.toFixed(2))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearActividad,
  listarActividades,
  obtenerActividad,
  editarActividad,
  eliminarActividad,
  actualizarPago,
  obtenerEstadisticasActividades
};
