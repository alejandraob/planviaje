/**
 * Gastos Controller
 * HTTP request handlers for expense management
 */

const { Gasto, Viaje, MiembroViaje, Usuario, Alojamiento, Actividad } = require('../models');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../middleware/errorHandler');
const {
  checkUserAccessToTrip,
  isUserAdmin,
  validateExpenseDateWithinTrip,
  validateMiembrosAsignados,
  validateExpenseReferences,
  validatePagador,
  determineEstadoGasto,
  validateTipoDivision,
  autoDistributeExpense,
  canDeleteExpense
} = require('../services/gastosService');

/**
 * POST /api/viajes/:id/gastos
 * Create a new expense
 */
const crearGasto = async (req, res, next) => {
  const { id } = req.params;
  const idUsuario = req.user.id_usuario;
  const {
    id_usuario_pagador,
    descripcion,
    monto_ars,
    monto_clp,
    monto_usd,
    categoria,
    tipo_gasto,
    tipo_division,
    fecha,
    miembros_asignados,
    id_gasto_padre,
    observacion_diferencia,
    url_comprobante,
    id_alojamiento_referencia,
    id_actividad_referencia
  } = req.body;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Validate date within trip
  await validateExpenseDateWithinTrip(id, fecha);

  // Validate tipo_division matches tipo_gasto
  validateTipoDivision(tipo_gasto, tipo_division);

  // Validate pagador belongs to trip
  await validatePagador(id, id_usuario_pagador);

  // Validate references if provided
  await validateExpenseReferences(id, id_alojamiento_referencia, id_actividad_referencia);

  // Auto-distribute if tipo_division is 'todos_miembros' and no miembros_asignados provided
  let assignedMembers = miembros_asignados;
  if (tipo_division === 'todos_miembros' && (!miembros_asignados || miembros_asignados.length === 0)) {
    assignedMembers = await autoDistributeExpense(id, monto_ars);
  }

  // Validate assigned members
  if (tipo_division !== 'individual') {
    await validateMiembrosAsignados(id, assignedMembers);
  }

  // Validate parent expense if provided
  if (id_gasto_padre) {
    const parentExpense = await Gasto.findOne({
      where: {
        id_gasto: id_gasto_padre,
        id_viaje: id
      }
    });

    if (!parentExpense) {
      throw new NotFoundError('Parent expense not found');
    }
  }

  // Determine estado_gasto
  const estadoGasto = determineEstadoGasto(tipo_gasto, monto_ars, assignedMembers);

  // Create expense
  const gasto = await Gasto.create({
    id_viaje: parseInt(id),
    id_usuario_creador: idUsuario,
    id_usuario_pagador,
    descripcion,
    monto_ars: parseFloat(monto_ars),
    monto_clp: monto_clp ? parseFloat(monto_clp) : null,
    monto_usd: monto_usd ? parseFloat(monto_usd) : null,
    categoria,
    tipo_gasto,
    tipo_division,
    fecha,
    miembros_asignados: assignedMembers,
    id_gasto_padre,
    observacion_diferencia,
    url_comprobante,
    estado_gasto: estadoGasto,
    id_alojamiento_referencia,
    id_actividad_referencia
  });

  res.status(201).json({
    success: true,
    data: gasto
  });
};

/**
 * GET /api/viajes/:id/gastos
 * List expenses with filters and pagination
 */
const listarGastos = async (req, res, next) => {
  const { id } = req.params;
  const idUsuario = req.user.id_usuario;
  const {
    categoria,
    tipo_gasto,
    estado_gasto,
    fecha_desde,
    fecha_hasta,
    id_usuario_pagador,
    page = 1,
    limit = 20
  } = req.query;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Build where clause
  const whereClause = { id_viaje: id };

  if (categoria) whereClause.categoria = categoria;
  if (tipo_gasto) whereClause.tipo_gasto = tipo_gasto;
  if (estado_gasto) whereClause.estado_gasto = estado_gasto;
  if (id_usuario_pagador) whereClause.id_usuario_pagador = parseInt(id_usuario_pagador);

  if (fecha_desde && fecha_hasta) {
    whereClause.fecha = {
      [require('sequelize').Op.between]: [fecha_desde, fecha_hasta]
    };
  } else if (fecha_desde) {
    whereClause.fecha = {
      [require('sequelize').Op.gte]: fecha_desde
    };
  } else if (fecha_hasta) {
    whereClause.fecha = {
      [require('sequelize').Op.lte]: fecha_hasta
    };
  }

  // Get expenses with pagination
  const offset = (page - 1) * limit;
  const { count, rows: gastos } = await Gasto.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Usuario,
        as: 'creador',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email']
      },
      {
        model: Usuario,
        as: 'pagador',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email']
      },
      {
        model: Gasto,
        as: 'gastoPadre',
        attributes: ['id_gasto', 'descripcion', 'monto_ars']
      },
      {
        model: Alojamiento,
        as: 'alojamientoReferencia',
        attributes: ['id_alojamiento', 'nombre'],
        required: false
      },
      {
        model: Actividad,
        as: 'actividadReferencia',
        attributes: ['id_actividad', 'nombre'],
        required: false
      }
    ],
    order: [['fecha', 'DESC'], ['timestamp_creacion', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });

  res.json({
    success: true,
    data: gastos,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  });
};

/**
 * GET /api/viajes/:id/gastos/:idGasto
 * Get expense details
 */
const obtenerGasto = async (req, res, next) => {
  const { id, idGasto } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get expense
  const gasto = await Gasto.findOne({
    where: {
      id_gasto: idGasto,
      id_viaje: id
    },
    include: [
      {
        model: Usuario,
        as: 'creador',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email']
      },
      {
        model: Usuario,
        as: 'pagador',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email']
      },
      {
        model: Gasto,
        as: 'gastoPadre',
        attributes: ['id_gasto', 'descripcion', 'monto_ars', 'fecha']
      },
      {
        model: Gasto,
        as: 'gastosHijos',
        attributes: ['id_gasto', 'descripcion', 'monto_ars', 'fecha']
      },
      {
        model: Alojamiento,
        as: 'alojamientoReferencia',
        attributes: ['id_alojamiento', 'nombre', 'fecha_checkin', 'fecha_checkout'],
        required: false
      },
      {
        model: Actividad,
        as: 'actividadReferencia',
        attributes: ['id_actividad', 'nombre', 'fecha', 'tipo_actividad'],
        required: false
      }
    ]
  });

  if (!gasto) {
    throw new NotFoundError('Expense not found');
  }

  // Get member details for assigned members
  if (gasto.miembros_asignados && gasto.miembros_asignados.length > 0) {
    const miembrosIds = gasto.miembros_asignados.map(m => m.id_miembro_viaje);
    const miembros = await MiembroViaje.findAll({
      where: {
        id_miembro_viaje: miembrosIds
      },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email']
        }
      ]
    });

    // Enrich miembros_asignados with user info
    gasto.miembros_asignados = gasto.miembros_asignados.map(asignacion => {
      const miembro = miembros.find(m => m.id_miembro_viaje === asignacion.id_miembro_viaje);
      return {
        ...asignacion,
        miembro: miembro ? {
          id_miembro_viaje: miembro.id_miembro_viaje,
          usuario: miembro.usuario
        } : null
      };
    });
  }

  res.json({
    success: true,
    data: gasto
  });
};

/**
 * PUT /api/viajes/:id/gastos/:idGasto
 * Update expense
 */
const editarGasto = async (req, res, next) => {
  const { id, idGasto } = req.params;
  const idUsuario = req.user.id_usuario;
  const {
    descripcion,
    monto_ars,
    monto_clp,
    monto_usd,
    categoria,
    fecha,
    miembros_asignados,
    observacion_diferencia,
    url_comprobante
  } = req.body;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get expense
  const gasto = await Gasto.findOne({
    where: {
      id_gasto: idGasto,
      id_viaje: id
    }
  });

  if (!gasto) {
    throw new NotFoundError('Expense not found');
  }

  // Only creator or admin can edit
  const isAdmin = await isUserAdmin(id, idUsuario);
  if (gasto.id_usuario_creador !== idUsuario && !isAdmin) {
    throw new ForbiddenError('Only the creator or admin can edit this expense');
  }

  // Can't edit cancelled expenses
  if (gasto.estado_gasto === 'cancelado') {
    throw new BadRequestError('Cannot edit cancelled expense');
  }

  // Prepare update data
  const updateData = {};

  if (descripcion !== undefined) updateData.descripcion = descripcion;
  if (categoria !== undefined) updateData.categoria = categoria;
  if (observacion_diferencia !== undefined) updateData.observacion_diferencia = observacion_diferencia;
  if (url_comprobante !== undefined) updateData.url_comprobante = url_comprobante;

  if (monto_ars !== undefined) {
    updateData.monto_ars = parseFloat(monto_ars);
  }
  if (monto_clp !== undefined) {
    updateData.monto_clp = monto_clp ? parseFloat(monto_clp) : null;
  }
  if (monto_usd !== undefined) {
    updateData.monto_usd = monto_usd ? parseFloat(monto_usd) : null;
  }

  if (fecha !== undefined) {
    await validateExpenseDateWithinTrip(id, fecha);
    updateData.fecha = fecha;
  }

  if (miembros_asignados !== undefined) {
    await validateMiembrosAsignados(id, miembros_asignados);
    updateData.miembros_asignados = miembros_asignados;

    // Recalculate estado_gasto
    const montoTotal = updateData.monto_ars || gasto.monto_ars;
    updateData.estado_gasto = determineEstadoGasto(gasto.tipo_gasto, montoTotal, miembros_asignados);
  }

  // Update expense
  await gasto.update(updateData);
  await gasto.reload({
    include: [
      {
        model: Usuario,
        as: 'creador',
        attributes: ['id_usuario', 'nombre', 'apellido']
      },
      {
        model: Usuario,
        as: 'pagador',
        attributes: ['id_usuario', 'nombre', 'apellido']
      }
    ]
  });

  res.json({
    success: true,
    data: gasto,
    message: 'Expense updated successfully'
  });
};

/**
 * DELETE /api/viajes/:id/gastos/:idGasto
 * Delete expense
 */
const eliminarGasto = async (req, res, next) => {
  const { id, idGasto } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get expense
  const gasto = await Gasto.findOne({
    where: {
      id_gasto: idGasto,
      id_viaje: id
    }
  });

  if (!gasto) {
    throw new NotFoundError('Expense not found');
  }

  // Only creator or admin can delete
  const isAdmin = await isUserAdmin(id, idUsuario);
  if (gasto.id_usuario_creador !== idUsuario && !isAdmin) {
    throw new ForbiddenError('Only the creator or admin can delete this expense');
  }

  // Check if can be deleted
  await canDeleteExpense(gasto);

  // Delete expense
  await gasto.destroy();

  res.json({
    success: true,
    message: 'Expense deleted successfully'
  });
};

/**
 * PUT /api/viajes/:id/gastos/:idGasto/estado
 * Update expense status (cancel/reactivate)
 */
const actualizarEstadoGasto = async (req, res, next) => {
  const { id, idGasto } = req.params;
  const idUsuario = req.user.id_usuario;
  const { estado_gasto, observacion } = req.body;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get expense
  const gasto = await Gasto.findOne({
    where: {
      id_gasto: idGasto,
      id_viaje: id
    }
  });

  if (!gasto) {
    throw new NotFoundError('Expense not found');
  }

  // Only creator or admin can change status
  const isAdmin = await isUserAdmin(id, idUsuario);
  if (gasto.id_usuario_creador !== idUsuario && !isAdmin) {
    throw new ForbiddenError('Only the creator or admin can change expense status');
  }

  // Update status
  await gasto.update({
    estado_gasto,
    observacion_diferencia: observacion || gasto.observacion_diferencia
  });

  res.json({
    success: true,
    data: gasto,
    message: 'Expense status updated successfully'
  });
};

/**
 * GET /api/viajes/:id/gastos/estadisticas
 * Get expense statistics
 */
const obtenerEstadisticasGastos = async (req, res, next) => {
  const { id } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Count by estado_gasto
  const estadoStats = await Gasto.findAll({
    where: { id_viaje: id },
    attributes: [
      'estado_gasto',
      [require('sequelize').fn('COUNT', require('sequelize').col('id_gasto')), 'count']
    ],
    group: ['estado_gasto']
  });

  // Count by categoria
  const categoriaStats = await Gasto.findAll({
    where: { id_viaje: id },
    attributes: [
      'categoria',
      [require('sequelize').fn('COUNT', require('sequelize').col('id_gasto')), 'count'],
      [require('sequelize').fn('SUM', require('sequelize').col('monto_ars')), 'total_ars']
    ],
    group: ['categoria']
  });

  // Count by tipo_gasto
  const tipoStats = await Gasto.findAll({
    where: { id_viaje: id },
    attributes: [
      'tipo_gasto',
      [require('sequelize').fn('COUNT', require('sequelize').col('id_gasto')), 'count'],
      [require('sequelize').fn('SUM', require('sequelize').col('monto_ars')), 'total_ars']
    ],
    group: ['tipo_gasto']
  });

  // Calculate total amounts
  const totals = await Gasto.findOne({
    where: { id_viaje: id },
    attributes: [
      [require('sequelize').fn('SUM', require('sequelize').col('monto_ars')), 'total_ars'],
      [require('sequelize').fn('SUM', require('sequelize').col('monto_clp')), 'total_clp'],
      [require('sequelize').fn('SUM', require('sequelize').col('monto_usd')), 'total_usd'],
      [require('sequelize').fn('COUNT', require('sequelize').col('id_gasto')), 'total_gastos']
    ]
  });

  res.json({
    success: true,
    data: {
      por_estado: estadoStats,
      por_categoria: categoriaStats,
      por_tipo: tipoStats,
      totales: {
        total_gastos: parseInt(totals.dataValues.total_gastos) || 0,
        total_ars: parseFloat(totals.dataValues.total_ars) || 0,
        total_clp: parseFloat(totals.dataValues.total_clp) || 0,
        total_usd: parseFloat(totals.dataValues.total_usd) || 0
      }
    }
  });
};

module.exports = {
  crearGasto,
  listarGastos,
  obtenerGasto,
  editarGasto,
  eliminarGasto,
  actualizarEstadoGasto,
  obtenerEstadisticasGastos
};
