/**
 * Deudas Controller
 * HTTP request handlers for debt management
 */

const { Deuda, Usuario, Gasto, Viaje } = require('../models');
const { NotFoundError, ForbiddenError } = require('../middleware/errorHandler');
const {
  checkUserAccessToTrip,
  isUserAdmin,
  validateParticipants,
  validateGasto,
  checkDuplicateDebt,
  calculateDebtBalance,
  canDeleteDebt,
  updateDebtStatus,
  getUserDebtSummary
} = require('../services/deudasService');

/**
 * POST /api/viajes/:id/deudas
 * Create a new debt
 */
const crearDeuda = async (req, res, next) => {
  const { id } = req.params;
  const idUsuario = req.user.id_usuario;
  const {
    id_acreedor,
    id_deudor,
    id_gasto,
    monto_ars,
    monto_clp,
    monto_usd,
    fecha_vencimiento,
    observacion
  } = req.body;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Validate participants belong to trip
  await validateParticipants(id, id_acreedor, id_deudor);

  // Validate gasto belongs to trip
  await validateGasto(id, id_gasto);

  // Check for duplicate debt
  await checkDuplicateDebt(id, id_acreedor, id_deudor, id_gasto);

  // Create debt
  const deuda = await Deuda.create({
    id_viaje: parseInt(id),
    id_acreedor,
    id_deudor,
    id_gasto,
    monto_ars: parseFloat(monto_ars),
    monto_clp: monto_clp ? parseFloat(monto_clp) : null,
    monto_usd: monto_usd ? parseFloat(monto_usd) : null,
    estado_deuda: 'pendiente',
    fecha_vencimiento,
    observacion
  });

  res.status(201).json({
    success: true,
    data: deuda
  });
};

/**
 * GET /api/viajes/:id/deudas
 * List debts with filters and pagination
 */
const listarDeudas = async (req, res, next) => {
  const { id } = req.params;
  const idUsuario = req.user.id_usuario;
  const {
    estado_deuda,
    id_acreedor,
    id_deudor,
    id_gasto,
    page = 1,
    limit = 20
  } = req.query;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Build where clause
  const whereClause = { id_viaje: id };

  if (estado_deuda) whereClause.estado_deuda = estado_deuda;
  if (id_acreedor) whereClause.id_acreedor = parseInt(id_acreedor);
  if (id_deudor) whereClause.id_deudor = parseInt(id_deudor);
  if (id_gasto) whereClause.id_gasto = parseInt(id_gasto);

  // Get debts with pagination
  const offset = (page - 1) * limit;
  const { count, rows: deudas } = await Deuda.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Usuario,
        as: 'acreedor',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email']
      },
      {
        model: Usuario,
        as: 'deudor',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email']
      },
      {
        model: Gasto,
        as: 'gasto',
        attributes: ['id_gasto', 'descripcion', 'monto_ars', 'categoria', 'fecha']
      }
    ],
    order: [['fecha_creacion', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });

  // Enrich with balance information
  const enrichedDeudas = await Promise.all(
    deudas.map(async (deuda) => {
      const balance = await calculateDebtBalance(deuda);
      return {
        ...deuda.toJSON(),
        balance
      };
    })
  );

  res.json({
    success: true,
    data: enrichedDeudas,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  });
};

/**
 * GET /api/viajes/:id/deudas/:idDeuda
 * Get debt details
 */
const obtenerDeuda = async (req, res, next) => {
  const { id, idDeuda } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get debt
  const deuda = await Deuda.findOne({
    where: {
      id_deuda: idDeuda,
      id_viaje: id
    },
    include: [
      {
        model: Usuario,
        as: 'acreedor',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'telefono']
      },
      {
        model: Usuario,
        as: 'deudor',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'telefono']
      },
      {
        model: Gasto,
        as: 'gasto',
        attributes: ['id_gasto', 'descripcion', 'monto_ars', 'categoria', 'tipo_gasto', 'fecha']
      }
    ]
  });

  if (!deuda) {
    throw new NotFoundError('Debt not found');
  }

  // Get balance information
  const balance = await calculateDebtBalance(deuda);

  res.json({
    success: true,
    data: {
      ...deuda.toJSON(),
      balance
    }
  });
};

/**
 * PUT /api/viajes/:id/deudas/:idDeuda
 * Update debt
 */
const editarDeuda = async (req, res, next) => {
  const { id, idDeuda } = req.params;
  const idUsuario = req.user.id_usuario;
  const {
    monto_ars,
    monto_clp,
    monto_usd,
    fecha_vencimiento,
    observacion
  } = req.body;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get debt
  const deuda = await Deuda.findOne({
    where: {
      id_deuda: idDeuda,
      id_viaje: id
    }
  });

  if (!deuda) {
    throw new NotFoundError('Debt not found');
  }

  // Only admin or participants can edit
  const isAdmin = await isUserAdmin(id, idUsuario);
  const isParticipant = deuda.id_acreedor === idUsuario || deuda.id_deudor === idUsuario;

  if (!isAdmin && !isParticipant) {
    throw new ForbiddenError('Only admin or participants can edit this debt');
  }

  // Can't edit paid or cancelled debts
  if (deuda.estado_deuda === 'pagada' || deuda.estado_deuda === 'cancelada') {
    throw new ForbiddenError(`Cannot edit ${deuda.estado_deuda} debt`);
  }

  // Prepare update data
  const updateData = {};

  if (monto_ars !== undefined) updateData.monto_ars = parseFloat(monto_ars);
  if (monto_clp !== undefined) updateData.monto_clp = monto_clp ? parseFloat(monto_clp) : null;
  if (monto_usd !== undefined) updateData.monto_usd = monto_usd ? parseFloat(monto_usd) : null;
  if (fecha_vencimiento !== undefined) updateData.fecha_vencimiento = fecha_vencimiento;
  if (observacion !== undefined) updateData.observacion = observacion;

  // Update debt
  await deuda.update(updateData);
  await deuda.reload({
    include: [
      {
        model: Usuario,
        as: 'acreedor',
        attributes: ['id_usuario', 'nombre', 'apellido']
      },
      {
        model: Usuario,
        as: 'deudor',
        attributes: ['id_usuario', 'nombre', 'apellido']
      }
    ]
  });

  res.json({
    success: true,
    data: deuda,
    message: 'Debt updated successfully'
  });
};

/**
 * DELETE /api/viajes/:id/deudas/:idDeuda
 * Delete debt
 */
const eliminarDeuda = async (req, res, next) => {
  const { id, idDeuda } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get debt
  const deuda = await Deuda.findOne({
    where: {
      id_deuda: idDeuda,
      id_viaje: id
    }
  });

  if (!deuda) {
    throw new NotFoundError('Debt not found');
  }

  // Only admin can delete
  const isAdmin = await isUserAdmin(id, idUsuario);
  if (!isAdmin) {
    throw new ForbiddenError('Only admin can delete debts');
  }

  // Check if can be deleted
  await canDeleteDebt(deuda);

  // Delete debt
  await deuda.destroy();

  res.json({
    success: true,
    message: 'Debt deleted successfully'
  });
};

/**
 * PUT /api/viajes/:id/deudas/:idDeuda/estado
 * Update debt status
 */
const actualizarEstadoDeuda = async (req, res, next) => {
  const { id, idDeuda } = req.params;
  const idUsuario = req.user.id_usuario;
  const { estado_deuda, observacion } = req.body;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get debt
  const deuda = await Deuda.findOne({
    where: {
      id_deuda: idDeuda,
      id_viaje: id
    }
  });

  if (!deuda) {
    throw new NotFoundError('Debt not found');
  }

  // Only admin or participants can change status
  const isAdmin = await isUserAdmin(id, idUsuario);
  const isParticipant = deuda.id_acreedor === idUsuario || deuda.id_deudor === idUsuario;

  if (!isAdmin && !isParticipant) {
    throw new ForbiddenError('Only admin or participants can change debt status');
  }

  // Update status
  const updateData = { estado_deuda };

  if (observacion !== undefined) {
    updateData.observacion = observacion;
  }

  if (estado_deuda === 'pagada') {
    updateData.fecha_pago = new Date();
  }

  await deuda.update(updateData);

  res.json({
    success: true,
    data: deuda,
    message: 'Debt status updated successfully'
  });
};

/**
 * GET /api/viajes/:id/deudas/estadisticas
 * Get debt statistics
 */
const obtenerEstadisticasDeudas = async (req, res, next) => {
  const { id } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Count by estado_deuda
  const estadoStats = await Deuda.findAll({
    where: { id_viaje: id },
    attributes: [
      'estado_deuda',
      [require('sequelize').fn('COUNT', require('sequelize').col('id_deuda')), 'count'],
      [require('sequelize').fn('SUM', require('sequelize').col('monto_ars')), 'total_ars']
    ],
    group: ['estado_deuda']
  });

  // Calculate total amounts
  const totals = await Deuda.findOne({
    where: { id_viaje: id },
    attributes: [
      [require('sequelize').fn('SUM', require('sequelize').col('monto_ars')), 'total_ars'],
      [require('sequelize').fn('SUM', require('sequelize').col('monto_clp')), 'total_clp'],
      [require('sequelize').fn('SUM', require('sequelize').col('monto_usd')), 'total_usd'],
      [require('sequelize').fn('COUNT', require('sequelize').col('id_deuda')), 'total_deudas']
    ]
  });

  res.json({
    success: true,
    data: {
      por_estado: estadoStats,
      totales: {
        total_deudas: parseInt(totals.dataValues.total_deudas) || 0,
        total_ars: parseFloat(totals.dataValues.total_ars) || 0,
        total_clp: parseFloat(totals.dataValues.total_clp) || 0,
        total_usd: parseFloat(totals.dataValues.total_usd) || 0
      }
    }
  });
};

/**
 * GET /api/viajes/:id/deudas/resumen
 * Get debt summary for current user
 */
const obtenerResumenDeudas = async (req, res, next) => {
  const { id } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get user debt summary
  const summary = await getUserDebtSummary(id, idUsuario);

  res.json({
    success: true,
    data: summary
  });
};

module.exports = {
  crearDeuda,
  listarDeudas,
  obtenerDeuda,
  editarDeuda,
  eliminarDeuda,
  actualizarEstadoDeuda,
  obtenerEstadisticasDeudas,
  obtenerResumenDeudas
};
