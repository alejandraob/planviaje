/**
 * Franjas Controller
 * Handles HTTP requests for time slot management
 */

const { Franja, Viaje, Alojamiento, Actividad } = require('../models');
const { Op } = require('sequelize');
const {
  checkUserAccessToTrip,
  isUserAdmin,
  validateFranjaWithinTrip,
  checkFranjaOverlap,
  getNextOrdenSecuencia,
  reorderFranjas,
  canDeleteFranja,
  updateFranjaState,
  getCronogramaForTrip
} = require('../services/franjasService');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');

/**
 * POST /api/viajes/:id/franjas
 * Create a new franja for a trip
 * @access Admin only
 */
const crearFranja = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id_usuario;
    const { nombre_lugar, fecha_inicio, fecha_fin, descripcion } = req.body;

    // Check admin permission
    const { isAdmin } = await isUserAdmin(id, idUsuario);
    if (!isAdmin) {
      throw new ForbiddenError('Only admins can create franjas');
    }

    // Validate dates within trip
    await validateFranjaWithinTrip(id, fecha_inicio, fecha_fin);

    // Check for overlaps
    await checkFranjaOverlap(id, fecha_inicio, fecha_fin);

    // Get cronograma
    const cronograma = await getCronogramaForTrip(id);

    // Get next sequence order
    const ordenSecuencia = await getNextOrdenSecuencia(id);

    // Create franja
    const franja = await Franja.create({
      id_viaje: parseInt(id),
      id_cronograma: cronograma.id_cronograma,
      nombre_lugar,
      fecha_inicio,
      fecha_fin,
      descripcion,
      orden_secuencia: ordenSecuencia,
      estado_franja: 'programada',
      id_usuario_creador: idUsuario
    });

    // Update state based on dates
    await updateFranjaState(franja);

    // Reload to get updated state
    await franja.reload();

    res.status(201).json({
      success: true,
      data: franja
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/viajes/:id/franjas
 * List all franjas for a trip
 * @access Members
 */
const listarFranjas = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id_usuario;
    const { estado, page = 1, limit = 20 } = req.query;

    // Check access
    await checkUserAccessToTrip(id, idUsuario);

    // Build where clause
    const whereClause = { id_viaje: id };
    if (estado) {
      whereClause.estado_franja = estado;
    }

    // Get franjas with pagination
    const offset = (page - 1) * limit;
    const { count, rows: franjas } = await Franja.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Alojamiento,
          as: 'alojamientos',
          attributes: ['id_alojamiento', 'nombre', 'ubicacion_descripcion']
        },
        {
          model: Actividad,
          as: 'actividades',
          attributes: ['id_actividad', 'nombre', 'tipo_actividad']
        }
      ],
      order: [['orden_secuencia', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Update states for all franjas
    for (const franja of franjas) {
      await updateFranjaState(franja);
    }

    // Reload to get updated states
    const updatedFranjas = await Franja.findAll({
      where: whereClause,
      include: [
        {
          model: Alojamiento,
          as: 'alojamientos',
          attributes: ['id_alojamiento', 'nombre', 'ubicacion_descripcion']
        },
        {
          model: Actividad,
          as: 'actividades',
          attributes: ['id_actividad', 'nombre', 'tipo_actividad']
        }
      ],
      order: [['orden_secuencia', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: updatedFranjas,
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
 * GET /api/viajes/:id/franjas/:idFranja
 * Get details of a specific franja
 * @access Members
 */
const obtenerFranja = async (req, res, next) => {
  try {
    const { id, idFranja } = req.params;
    const idUsuario = req.user.id_usuario;

    // Check access
    await checkUserAccessToTrip(id, idUsuario);

    // Get franja
    const franja = await Franja.findOne({
      where: {
        id_franja: idFranja,
        id_viaje: id
      },
      include: [
        {
          model: Alojamiento,
          as: 'alojamientos',
          attributes: [
            'id_alojamiento',
            'nombre',
            'ubicacion_descripcion',
            'fecha_checkin',
            'fecha_checkout',
            'monto_total_ars'
          ]
        },
        {
          model: Actividad,
          as: 'actividades',
          attributes: [
            'id_actividad',
            'nombre',
            'tipo_actividad',
            'fecha',
            'hora',
            'valor_referencial_ars'
          ]
        }
      ]
    });

    if (!franja) {
      throw new NotFoundError('Franja not found');
    }

    // Update state
    await updateFranjaState(franja);
    await franja.reload({
      include: [
        {
          model: Alojamiento,
          as: 'alojamientos',
          attributes: [
            'id_alojamiento',
            'nombre',
            'ubicacion_descripcion',
            'fecha_checkin',
            'fecha_checkout',
            'monto_total_ars'
          ]
        },
        {
          model: Actividad,
          as: 'actividades',
          attributes: [
            'id_actividad',
            'nombre',
            'tipo_actividad',
            'fecha',
            'hora',
            'valor_referencial_ars'
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: franja
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/viajes/:id/franjas/:idFranja
 * Update a franja
 * @access Admin only
 */
const editarFranja = async (req, res, next) => {
  try {
    const { id, idFranja } = req.params;
    const idUsuario = req.user.id_usuario;
    const { nombre_lugar, fecha_inicio, fecha_fin, descripcion, estado_franja } = req.body;

    // Check admin permission
    const { isAdmin } = await isUserAdmin(id, idUsuario);
    if (!isAdmin) {
      throw new ForbiddenError('Only admins can edit franjas');
    }

    // Get franja
    const franja = await Franja.findOne({
      where: {
        id_franja: idFranja,
        id_viaje: id
      }
    });

    if (!franja) {
      throw new NotFoundError('Franja not found');
    }

    // If dates are being updated, validate them
    const newFechaInicio = fecha_inicio || franja.fecha_inicio;
    const newFechaFin = fecha_fin || franja.fecha_fin;

    if (fecha_inicio || fecha_fin) {
      await validateFranjaWithinTrip(id, newFechaInicio, newFechaFin);
      await checkFranjaOverlap(id, newFechaInicio, newFechaFin, idFranja);
    }

    // Update franja
    const updatedData = {};
    if (nombre_lugar) updatedData.nombre_lugar = nombre_lugar;
    if (fecha_inicio) updatedData.fecha_inicio = fecha_inicio;
    if (fecha_fin) updatedData.fecha_fin = fecha_fin;
    if (descripcion !== undefined) updatedData.descripcion = descripcion;
    if (estado_franja) updatedData.estado_franja = estado_franja;

    await franja.update(updatedData);

    // If dates changed, reorder franjas
    if (fecha_inicio || fecha_fin) {
      await reorderFranjas(id);
    }

    // Update state
    await updateFranjaState(franja);
    await franja.reload();

    res.json({
      success: true,
      data: franja
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/viajes/:id/franjas/:idFranja
 * Delete a franja
 * @access Admin only
 */
const eliminarFranja = async (req, res, next) => {
  try {
    const { id, idFranja } = req.params;
    const idUsuario = req.user.id_usuario;

    // Check admin permission
    const { isAdmin } = await isUserAdmin(id, idUsuario);
    if (!isAdmin) {
      throw new ForbiddenError('Only admins can delete franjas');
    }

    // Get franja
    const franja = await Franja.findOne({
      where: {
        id_franja: idFranja,
        id_viaje: id
      }
    });

    if (!franja) {
      throw new NotFoundError('Franja not found');
    }

    // Check if can delete
    const deleteCheck = await canDeleteFranja(idFranja);
    if (!deleteCheck.canDelete) {
      throw new ForbiddenError(
        `Cannot delete franja: has ${deleteCheck.alojamientos} alojamientos and ${deleteCheck.actividades} actividades`
      );
    }

    // Delete franja
    await franja.destroy();

    // Reorder remaining franjas
    await reorderFranjas(id);

    res.json({
      success: true,
      message: 'Franja deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/viajes/:id/franjas/:idFranja/reorder
 * Reorder a franja by changing its orden_secuencia
 * @access Admin only
 */
const reordenarFranja = async (req, res, next) => {
  try {
    const { id, idFranja } = req.params;
    const idUsuario = req.user.id_usuario;
    const { nuevo_orden } = req.body;

    // Check admin permission
    const { isAdmin } = await isUserAdmin(id, idUsuario);
    if (!isAdmin) {
      throw new ForbiddenError('Only admins can reorder franjas');
    }

    // Get franja
    const franja = await Franja.findOne({
      where: {
        id_franja: idFranja,
        id_viaje: id
      }
    });

    if (!franja) {
      throw new NotFoundError('Franja not found');
    }

    // Get total franjas
    const totalFranjas = await Franja.count({
      where: {
        id_viaje: id,
        estado_franja: ['programada', 'en_curso', 'completada']
      }
    });

    if (nuevo_orden < 1 || nuevo_orden > totalFranjas) {
      throw new BadRequestError(`nuevo_orden must be between 1 and ${totalFranjas}`);
    }

    const oldOrden = franja.orden_secuencia;

    // If orden is the same, do nothing
    if (oldOrden === nuevo_orden) {
      return res.json({
        success: true,
        data: franja
      });
    }

    // Get all franjas in order
    const franjas = await Franja.findAll({
      where: {
        id_viaje: id,
        estado_franja: ['programada', 'en_curso', 'completada']
      },
      order: [['orden_secuencia', 'ASC']]
    });

    // Reorder logic
    if (nuevo_orden < oldOrden) {
      // Moving up - shift down franjas between nuevo_orden and oldOrden
      for (const f of franjas) {
        if (f.id_franja === franja.id_franja) continue;
        if (f.orden_secuencia >= nuevo_orden && f.orden_secuencia < oldOrden) {
          await f.update({ orden_secuencia: f.orden_secuencia + 1 });
        }
      }
    } else {
      // Moving down - shift up franjas between oldOrden and nuevo_orden
      for (const f of franjas) {
        if (f.id_franja === franja.id_franja) continue;
        if (f.orden_secuencia > oldOrden && f.orden_secuencia <= nuevo_orden) {
          await f.update({ orden_secuencia: f.orden_secuencia - 1 });
        }
      }
    }

    // Update target franja
    await franja.update({ orden_secuencia: nuevo_orden });
    await franja.reload();

    res.json({
      success: true,
      data: franja
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/viajes/:id/franjas/estadisticas
 * Get statistics for franjas in a trip
 * @access Members
 */
const obtenerEstadisticasFranjas = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id_usuario;

    // Check access
    await checkUserAccessToTrip(id, idUsuario);

    // Count franjas by state
    const totalFranjas = await Franja.count({
      where: { id_viaje: id }
    });

    const programadas = await Franja.count({
      where: { id_viaje: id, estado_franja: 'programada' }
    });

    const enCurso = await Franja.count({
      where: { id_viaje: id, estado_franja: 'en_curso' }
    });

    const completadas = await Franja.count({
      where: { id_viaje: id, estado_franja: 'completada' }
    });

    const canceladas = await Franja.count({
      where: { id_viaje: id, estado_franja: 'cancelada' }
    });

    // Get total alojamientos and actividades
    const franjas = await Franja.findAll({
      where: { id_viaje: id },
      attributes: ['id_franja']
    });

    const idsFranjas = franjas.map(f => f.id_franja);

    let totalAlojamientos = 0;
    let totalActividades = 0;

    if (idsFranjas.length > 0) {
      totalAlojamientos = await Alojamiento.count({
        where: { id_franja: idsFranjas }
      });

      totalActividades = await Actividad.count({
        where: { id_franja: idsFranjas }
      });
    }

    res.json({
      success: true,
      data: {
        total_franjas: totalFranjas,
        por_estado: {
          programadas,
          en_curso: enCurso,
          completadas,
          canceladas
        },
        total_alojamientos: totalAlojamientos,
        total_actividades: totalActividades
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearFranja,
  listarFranjas,
  obtenerFranja,
  editarFranja,
  eliminarFranja,
  reordenarFranja,
  obtenerEstadisticasFranjas
};
