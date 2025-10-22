/**
 * Alojamientos Controller
 * Handles HTTP requests for accommodation management
 */

const { Alojamiento, Franja, Usuario, MiembroViaje } = require('../models');
const { Op } = require('sequelize');
const {
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
} = require('../services/alojamientosService');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * POST /api/viajes/:id/alojamientos
 * Create a new accommodation for a trip
 * @access Members (any member can create)
 */
const crearAlojamiento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id_usuario;
    const {
      id_franja,
      nombre,
      link_reserva,
      fecha_checkin,
      hora_checkin,
      fecha_checkout,
      hora_checkout,
      ubicacion_descripcion,
      monto_total_ars,
      monto_total_clp,
      monto_total_usd,
      monto_pagado_ars,
      id_usuario_reserva,
      miembros_asignados
    } = req.body;

    // Check access to trip
    await checkUserAccessToTrip(id, idUsuario);

    // Validate franja if provided
    const franja = await validateFranjaForTrip(id, id_franja);

    // Validate dates
    if (franja) {
      validateDatesWithinFranja(franja, fecha_checkin, fecha_checkout);
    } else {
      await validateDatesWithinTrip(id, fecha_checkin, fecha_checkout);
    }

    // Validate assigned members
    await validateMiembrosAsignados(id, miembros_asignados);

    // Validate usuario_reserva
    await validateUsuarioReserva(id, id_usuario_reserva);

    // Calculate monto_faltante and estado_pago
    const montoFaltante = calculateMontoFaltante(monto_total_ars, monto_pagado_ars);
    const estadoPago = determineEstadoPago(monto_total_ars, monto_pagado_ars);

    // Create alojamiento
    const alojamiento = await Alojamiento.create({
      id_viaje: parseInt(id),
      id_franja: id_franja || null,
      nombre,
      link_reserva,
      fecha_checkin,
      hora_checkin,
      fecha_checkout,
      hora_checkout,
      ubicacion_descripcion,
      estado_pago: estadoPago,
      monto_total_ars,
      monto_total_clp,
      monto_total_usd,
      monto_pagado_ars: monto_pagado_ars || 0,
      monto_faltante_ars: montoFaltante,
      id_usuario_reserva,
      id_usuario_creador: idUsuario,
      miembros_asignados: miembros_asignados || []
    });

    res.status(201).json({
      success: true,
      data: alojamiento
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/viajes/:id/alojamientos
 * List all accommodations for a trip
 * @access Members
 */
const listarAlojamientos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id_usuario;
    const { id_franja, estado_pago, page = 1, limit = 20 } = req.query;

    // Check access
    await checkUserAccessToTrip(id, idUsuario);

    // Build where clause
    const whereClause = { id_viaje: id };
    if (id_franja) {
      whereClause.id_franja = id_franja;
    }
    if (estado_pago) {
      whereClause.estado_pago = estado_pago;
    }

    // Get alojamientos with pagination
    const offset = (page - 1) * limit;
    const { count, rows: alojamientos } = await Alojamiento.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Franja,
          as: 'franja',
          attributes: ['id_franja', 'nombre_lugar', 'fecha_inicio', 'fecha_fin']
        },
        {
          model: Usuario,
          as: 'usuarioReserva',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email']
        },
        {
          model: Usuario,
          as: 'usuarioCreador',
          attributes: ['id_usuario', 'nombre', 'apellido']
        }
      ],
      order: [['fecha_checkin', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: alojamientos,
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
 * GET /api/viajes/:id/alojamientos/:idAlojamiento
 * Get details of a specific accommodation
 * @access Members
 */
const obtenerAlojamiento = async (req, res, next) => {
  try {
    const { id, idAlojamiento } = req.params;
    const idUsuario = req.user.id_usuario;

    // Check access
    await checkUserAccessToTrip(id, idUsuario);

    // Get alojamiento
    const alojamiento = await Alojamiento.findOne({
      where: {
        id_alojamiento: idAlojamiento,
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
          as: 'usuarioReserva',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'telefono']
        },
        {
          model: Usuario,
          as: 'usuarioCreador',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email']
        }
      ]
    });

    if (!alojamiento) {
      throw new NotFoundError('Alojamiento not found');
    }

    // If there are assigned members, get their details
    let miembrosDetalle = [];
    if (alojamiento.miembros_asignados && alojamiento.miembros_asignados.length > 0) {
      const miembros = await MiembroViaje.findAll({
        where: {
          id_miembro_viaje: alojamiento.miembros_asignados
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
        ...alojamiento.toJSON(),
        miembros_detalle: miembrosDetalle
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/viajes/:id/alojamientos/:idAlojamiento
 * Update an accommodation
 * @access Admin or creator
 */
const editarAlojamiento = async (req, res, next) => {
  try {
    const { id, idAlojamiento } = req.params;
    const idUsuario = req.user.id_usuario;
    const {
      id_franja,
      nombre,
      link_reserva,
      fecha_checkin,
      hora_checkin,
      fecha_checkout,
      hora_checkout,
      ubicacion_descripcion,
      monto_total_ars,
      monto_total_clp,
      monto_total_usd,
      monto_pagado_ars,
      id_usuario_reserva,
      miembros_asignados
    } = req.body;

    // Get alojamiento
    const alojamiento = await Alojamiento.findOne({
      where: {
        id_alojamiento: idAlojamiento,
        id_viaje: id
      }
    });

    if (!alojamiento) {
      throw new NotFoundError('Alojamiento not found');
    }

    // Check permission
    const { canModify } = await canModifyAlojamiento(alojamiento, idUsuario);
    if (!canModify) {
      throw new ForbiddenError('Only admins or the creator can edit this accommodation');
    }

    // Validate franja if being changed
    if (id_franja !== undefined) {
      const franja = await validateFranjaForTrip(id, id_franja);

      const newFechaCheckin = fecha_checkin || alojamiento.fecha_checkin;
      const newFechaCheckout = fecha_checkout || alojamiento.fecha_checkout;

      if (franja) {
        validateDatesWithinFranja(franja, newFechaCheckin, newFechaCheckout);
      } else {
        await validateDatesWithinTrip(id, newFechaCheckin, newFechaCheckout);
      }
    } else if (fecha_checkin || fecha_checkout) {
      // Dates are being updated but franja is not
      const newFechaCheckin = fecha_checkin || alojamiento.fecha_checkin;
      const newFechaCheckout = fecha_checkout || alojamiento.fecha_checkout;

      if (alojamiento.id_franja) {
        const franja = await validateFranjaForTrip(id, alojamiento.id_franja);
        validateDatesWithinFranja(franja, newFechaCheckin, newFechaCheckout);
      } else {
        await validateDatesWithinTrip(id, newFechaCheckin, newFechaCheckout);
      }
    }

    // Validate assigned members
    if (miembros_asignados !== undefined) {
      await validateMiembrosAsignados(id, miembros_asignados);
    }

    // Validate usuario_reserva
    if (id_usuario_reserva !== undefined) {
      await validateUsuarioReserva(id, id_usuario_reserva);
    }

    // Build update object
    const updateData = {};
    if (id_franja !== undefined) updateData.id_franja = id_franja;
    if (nombre) updateData.nombre = nombre;
    if (link_reserva !== undefined) updateData.link_reserva = link_reserva;
    if (fecha_checkin) updateData.fecha_checkin = fecha_checkin;
    if (hora_checkin !== undefined) updateData.hora_checkin = hora_checkin;
    if (fecha_checkout) updateData.fecha_checkout = fecha_checkout;
    if (hora_checkout !== undefined) updateData.hora_checkout = hora_checkout;
    if (ubicacion_descripcion !== undefined) updateData.ubicacion_descripcion = ubicacion_descripcion;
    if (monto_total_ars !== undefined) updateData.monto_total_ars = monto_total_ars;
    if (monto_total_clp !== undefined) updateData.monto_total_clp = monto_total_clp;
    if (monto_total_usd !== undefined) updateData.monto_total_usd = monto_total_usd;
    if (monto_pagado_ars !== undefined) updateData.monto_pagado_ars = monto_pagado_ars;
    if (id_usuario_reserva !== undefined) updateData.id_usuario_reserva = id_usuario_reserva;
    if (miembros_asignados !== undefined) updateData.miembros_asignados = miembros_asignados;

    // Recalculate estado_pago and monto_faltante if amounts changed
    const newMontoTotal = monto_total_ars !== undefined ? monto_total_ars : alojamiento.monto_total_ars;
    const newMontoPagado = monto_pagado_ars !== undefined ? monto_pagado_ars : alojamiento.monto_pagado_ars;

    if (monto_total_ars !== undefined || monto_pagado_ars !== undefined) {
      updateData.monto_faltante_ars = calculateMontoFaltante(newMontoTotal, newMontoPagado);
      updateData.estado_pago = determineEstadoPago(newMontoTotal, newMontoPagado);
    }

    // Update alojamiento
    await alojamiento.update(updateData);
    await alojamiento.reload({
      include: [
        {
          model: Franja,
          as: 'franja',
          attributes: ['id_franja', 'nombre_lugar', 'fecha_inicio', 'fecha_fin']
        },
        {
          model: Usuario,
          as: 'usuarioReserva',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: alojamiento
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/viajes/:id/alojamientos/:idAlojamiento
 * Delete an accommodation
 * @access Admin or creator
 */
const eliminarAlojamiento = async (req, res, next) => {
  try {
    const { id, idAlojamiento } = req.params;
    const idUsuario = req.user.id_usuario;

    // Get alojamiento
    const alojamiento = await Alojamiento.findOne({
      where: {
        id_alojamiento: idAlojamiento,
        id_viaje: id
      }
    });

    if (!alojamiento) {
      throw new NotFoundError('Alojamiento not found');
    }

    // Check permission
    const { canModify } = await canModifyAlojamiento(alojamiento, idUsuario);
    if (!canModify) {
      throw new ForbiddenError('Only admins or the creator can delete this accommodation');
    }

    // Delete alojamiento
    await alojamiento.destroy();

    res.json({
      success: true,
      message: 'Alojamiento deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/viajes/:id/alojamientos/:idAlojamiento/pago
 * Update payment status of an accommodation
 * @access Admin or creator
 */
const actualizarPago = async (req, res, next) => {
  try {
    const { id, idAlojamiento } = req.params;
    const idUsuario = req.user.id_usuario;
    const { monto_pagado_ars } = req.body;

    // Get alojamiento
    const alojamiento = await Alojamiento.findOne({
      where: {
        id_alojamiento: idAlojamiento,
        id_viaje: id
      }
    });

    if (!alojamiento) {
      throw new NotFoundError('Alojamiento not found');
    }

    // Check permission
    const { canModify } = await canModifyAlojamiento(alojamiento, idUsuario);
    if (!canModify) {
      throw new ForbiddenError('Only admins or the creator can update payment');
    }

    // Calculate new values
    const montoFaltante = calculateMontoFaltante(alojamiento.monto_total_ars, monto_pagado_ars);
    const estadoPago = determineEstadoPago(alojamiento.monto_total_ars, monto_pagado_ars);

    // Update payment info
    await alojamiento.update({
      monto_pagado_ars,
      monto_faltante_ars: montoFaltante,
      estado_pago: estadoPago
    });

    await alojamiento.reload();

    res.json({
      success: true,
      data: alojamiento
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/viajes/:id/alojamientos/estadisticas
 * Get statistics for accommodations in a trip
 * @access Members
 */
const obtenerEstadisticasAlojamientos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id_usuario;

    // Check access
    await checkUserAccessToTrip(id, idUsuario);

    // Count total
    const totalAlojamientos = await Alojamiento.count({
      where: { id_viaje: id }
    });

    // Count by payment status
    const noPagado = await Alojamiento.count({
      where: { id_viaje: id, estado_pago: 'no_pagado' }
    });

    const parcialmentePagado = await Alojamiento.count({
      where: { id_viaje: id, estado_pago: 'parcialmente_pagado' }
    });

    const pagado = await Alojamiento.count({
      where: { id_viaje: id, estado_pago: 'pagado' }
    });

    // Calculate total amounts
    const alojamientos = await Alojamiento.findAll({
      where: { id_viaje: id },
      attributes: ['monto_total_ars', 'monto_pagado_ars', 'monto_faltante_ars']
    });

    let totalMontoArs = 0;
    let totalPagadoArs = 0;
    let totalFaltanteArs = 0;

    alojamientos.forEach(aloj => {
      totalMontoArs += parseFloat(aloj.monto_total_ars || 0);
      totalPagadoArs += parseFloat(aloj.monto_pagado_ars || 0);
      totalFaltanteArs += parseFloat(aloj.monto_faltante_ars || 0);
    });

    res.json({
      success: true,
      data: {
        total_alojamientos: totalAlojamientos,
        por_estado_pago: {
          no_pagado: noPagado,
          parcialmente_pagado: parcialmentePagado,
          pagado: pagado
        },
        montos_ars: {
          total: parseFloat(totalMontoArs.toFixed(2)),
          pagado: parseFloat(totalPagadoArs.toFixed(2)),
          faltante: parseFloat(totalFaltanteArs.toFixed(2))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearAlojamiento,
  listarAlojamientos,
  obtenerAlojamiento,
  editarAlojamiento,
  eliminarAlojamiento,
  actualizarPago,
  obtenerEstadisticasAlojamientos
};
