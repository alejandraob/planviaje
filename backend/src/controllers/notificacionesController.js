/**
 * Notificaciones Controller
 * HTTP request handlers for notification management
 */

const { Notificacion, Usuario, Viaje } = require('../models');
const { NotFoundError } = require('../utils/errors');
const {
  crearNotificacion,
  difundirNotificacion,
  marcarComoLeida,
  marcarTodasComoLeidas,
  obtenerConteoNoLeidas,
  checkNotificationOwnership
} = require('../services/notificacionesService');
const { Op } = require('sequelize');

/**
 * @route   POST /api/notificaciones
 * @desc    Create notification for specific user
 * @access  Private (Admin of trip)
 */
const enviarNotificacion = async (req, res, next) => {
  try {
    const { id_usuario_destinatario, id_viaje, tipo_evento, titulo, contenido, canales, url_accion } = req.body;

    const notificacion = await crearNotificacion({
      id_usuario_destinatario,
      id_viaje,
      tipo_evento,
      titulo,
      contenido,
      canales,
      url_accion
    });

    // Fetch full notification with associations
    const notificacionCompleta = await Notificacion.findByPk(notificacion.id_notificacion, {
      include: [
        {
          model: Usuario,
          as: 'destinatario',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email']
        },
        {
          model: Viaje,
          as: 'viaje',
          attributes: ['id_viaje', 'nombre']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: notificacionCompleta
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/notificaciones/difundir
 * @desc    Broadcast notification to all trip members
 * @access  Private (Admin of trip)
 */
const difundirNotificacionController = async (req, res, next) => {
  try {
    const { id_viaje, tipo_evento, titulo, contenido, canales, url_accion, excluir_usuario } = req.body;

    const resultado = await difundirNotificacion({
      id_viaje,
      tipo_evento,
      titulo,
      contenido,
      canales,
      url_accion,
      excluir_usuario
    });

    res.status(201).json({
      success: true,
      message: `Notification broadcasted to ${resultado.total_enviadas} members`,
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/notificaciones
 * @desc    Get user's notifications
 * @access  Private
 */
const listarNotificaciones = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const { id_viaje, tipo_evento, leida, page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {
      id_usuario_destinatario: idUsuario
    };

    if (id_viaje) {
      whereClause.id_viaje = parseInt(id_viaje);
    }

    if (tipo_evento) {
      whereClause.tipo_evento = tipo_evento;
    }

    if (leida !== undefined) {
      whereClause.leida = leida === 'true';
    }

    // Count total
    const total = await Notificacion.count({ where: whereClause });

    // Fetch notifications
    const notificaciones = await Notificacion.findAll({
      where: whereClause,
      include: [
        {
          model: Viaje,
          as: 'viaje',
          attributes: ['id_viaje', 'nombre', 'estado']
        }
      ],
      order: [['fecha_creacion', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: notificaciones,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/notificaciones/:id
 * @desc    Get notification details
 * @access  Private (Owner only)
 */
const obtenerNotificacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id_usuario;

    const notificacion = await checkNotificationOwnership(parseInt(id), idUsuario);

    // Fetch with associations
    const notificacionCompleta = await Notificacion.findByPk(notificacion.id_notificacion, {
      include: [
        {
          model: Viaje,
          as: 'viaje',
          attributes: ['id_viaje', 'nombre', 'estado', 'fecha_inicio', 'fecha_fin']
        }
      ]
    });

    res.json({
      success: true,
      data: notificacionCompleta
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notificaciones/:id/leer
 * @desc    Mark notification as read
 * @access  Private (Owner only)
 */
const marcarNotificacionLeida = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id_usuario;

    const notificacion = await marcarComoLeida(parseInt(id), idUsuario);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notificacion
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notificaciones/leer-todas
 * @desc    Mark all notifications as read
 * @access  Private
 */
const marcarTodasLeidas = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const { id_viaje } = req.query;

    const resultado = await marcarTodasComoLeidas(idUsuario, id_viaje ? parseInt(id_viaje) : null);

    res.json({
      success: true,
      message: `${resultado.actualizadas} notifications marked as read`,
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/notificaciones/:id
 * @desc    Delete notification
 * @access  Private (Owner only)
 */
const eliminarNotificacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id_usuario;

    const notificacion = await checkNotificationOwnership(parseInt(id), idUsuario);

    await notificacion.destroy();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/notificaciones/no-leidas/conteo
 * @desc    Get unread notifications count
 * @access  Private
 */
const obtenerConteoNoLeidasController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const { id_viaje } = req.query;

    const resultado = await obtenerConteoNoLeidas(idUsuario, id_viaje ? parseInt(id_viaje) : null);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/notificaciones/estadisticas
 * @desc    Get notifications statistics
 * @access  Private
 */
const obtenerEstadisticasNotificaciones = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const { id_viaje } = req.query;

    const whereClause = {
      id_usuario_destinatario: idUsuario
    };

    if (id_viaje) {
      whereClause.id_viaje = parseInt(id_viaje);
    }

    // Total notifications
    const total = await Notificacion.count({ where: whereClause });

    // Unread notifications
    const noLeidas = await Notificacion.count({
      where: { ...whereClause, leida: false }
    });

    // Read notifications
    const leidas = await Notificacion.count({
      where: { ...whereClause, leida: true }
    });

    // By event type
    const porTipo = await Notificacion.findAll({
      where: whereClause,
      attributes: [
        'tipo_evento',
        [require('sequelize').fn('COUNT', require('sequelize').col('id_notificacion')), 'cantidad']
      ],
      group: ['tipo_evento']
    });

    // Recent notifications (last 7 days)
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const recientes = await Notificacion.count({
      where: {
        ...whereClause,
        fecha_creacion: {
          [Op.gte]: hace7Dias
        }
      }
    });

    res.json({
      success: true,
      data: {
        totales: {
          total,
          leidas,
          no_leidas: noLeidas
        },
        por_tipo: porTipo.reduce((acc, item) => {
          acc[item.tipo_evento] = parseInt(item.dataValues.cantidad);
          return acc;
        }, {}),
        ultimos_7_dias: recientes
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enviarNotificacion,
  difundirNotificacionController,
  listarNotificaciones,
  obtenerNotificacion,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
  obtenerConteoNoLeidasController,
  obtenerEstadisticasNotificaciones
};
