/**
 * Notificaciones Service
 * Business logic for notification management
 */

const { Notificacion, Usuario, Viaje, MiembroViaje } = require('../models');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');

/**
 * Check if user has access to trip
 */
const checkUserAccessToTrip = async (idUsuario, idViaje) => {
  const viaje = await Viaje.findByPk(idViaje);
  if (!viaje) {
    throw new NotFoundError('Trip not found');
  }

  const miembro = await MiembroViaje.findOne({
    where: {
      id_viaje: idViaje,
      id_usuario: idUsuario,
      estado_participacion: 'activo'
    }
  });

  if (!miembro) {
    throw new ForbiddenError('You do not have access to this trip');
  }

  return { viaje, miembro };
};

/**
 * Check if user owns the notification
 */
const checkNotificationOwnership = async (idNotificacion, idUsuario) => {
  const notificacion = await Notificacion.findByPk(idNotificacion);

  if (!notificacion) {
    throw new NotFoundError('Notification not found');
  }

  if (notificacion.id_usuario_destinatario !== idUsuario) {
    throw new ForbiddenError('You can only access your own notifications');
  }

  return notificacion;
};

/**
 * Validate notification channels
 */
const validateCanales = (canales) => {
  if (!canales || typeof canales !== 'object') {
    throw new BadRequestError('Canales must be an object');
  }

  const validChannels = ['push', 'email', 'whatsapp'];
  const providedChannels = Object.keys(canales);

  for (const channel of providedChannels) {
    if (!validChannels.includes(channel)) {
      throw new BadRequestError(`Invalid channel: ${channel}. Valid channels: ${validChannels.join(', ')}`);
    }
    if (typeof canales[channel] !== 'boolean') {
      throw new BadRequestError(`Channel ${channel} must be a boolean value`);
    }
  }

  return canales;
};

/**
 * Get all trip members for broadcasting
 */
const getTripMembers = async (idViaje, excludeUserId = null) => {
  const whereClause = {
    id_viaje: idViaje,
    estado_participacion: 'activo'
  };

  if (excludeUserId) {
    whereClause.id_usuario = { [require('sequelize').Op.ne]: excludeUserId };
  }

  const miembros = await MiembroViaje.findAll({
    where: whereClause,
    attributes: ['id_usuario']
  });

  return miembros.map(m => m.id_usuario);
};

/**
 * Create notification for specific user
 */
const crearNotificacion = async (data) => {
  const { id_usuario_destinatario, id_viaje, tipo_evento, titulo, contenido, canales, url_accion } = data;

  // Validate recipient exists and is member of trip
  const usuario = await Usuario.findByPk(id_usuario_destinatario);
  if (!usuario) {
    throw new NotFoundError('Recipient user not found');
  }

  await checkUserAccessToTrip(id_usuario_destinatario, id_viaje);

  // Validate channels
  const validatedCanales = validateCanales(canales);

  const notificacion = await Notificacion.create({
    id_usuario_destinatario,
    id_viaje,
    tipo_evento,
    titulo,
    contenido,
    canales: validatedCanales,
    url_accion,
    leida: false
  });

  return notificacion;
};

/**
 * Broadcast notification to all trip members
 */
const difundirNotificacion = async (data) => {
  const { id_viaje, tipo_evento, titulo, contenido, canales, url_accion, excluir_usuario } = data;

  // Validate trip exists
  const viaje = await Viaje.findByPk(id_viaje);
  if (!viaje) {
    throw new NotFoundError('Trip not found');
  }

  // Validate channels
  const validatedCanales = validateCanales(canales);

  // Get all members
  const usuariosIds = await getTripMembers(id_viaje, excluir_usuario);

  if (usuariosIds.length === 0) {
    throw new BadRequestError('No active members found to notify');
  }

  // Create notification for each member
  const notificaciones = await Promise.all(
    usuariosIds.map(idUsuario =>
      Notificacion.create({
        id_usuario_destinatario: idUsuario,
        id_viaje,
        tipo_evento,
        titulo,
        contenido,
        canales: validatedCanales,
        url_accion,
        leida: false
      })
    )
  );

  return {
    total_enviadas: notificaciones.length,
    destinatarios: usuariosIds
  };
};

/**
 * Mark notification as read
 */
const marcarComoLeida = async (idNotificacion, idUsuario) => {
  const notificacion = await checkNotificationOwnership(idNotificacion, idUsuario);

  if (notificacion.leida) {
    return notificacion; // Already read
  }

  await notificacion.update({
    leida: true,
    fecha_lectura: new Date()
  });

  return notificacion;
};

/**
 * Mark all user notifications as read
 */
const marcarTodasComoLeidas = async (idUsuario, idViaje = null) => {
  const whereClause = {
    id_usuario_destinatario: idUsuario,
    leida: false
  };

  if (idViaje) {
    whereClause.id_viaje = idViaje;
  }

  const result = await Notificacion.update(
    {
      leida: true,
      fecha_lectura: new Date()
    },
    { where: whereClause }
  );

  return {
    actualizadas: result[0]
  };
};

/**
 * Get unread count
 */
const obtenerConteoNoLeidas = async (idUsuario, idViaje = null) => {
  const whereClause = {
    id_usuario_destinatario: idUsuario,
    leida: false
  };

  if (idViaje) {
    whereClause.id_viaje = idViaje;
  }

  const count = await Notificacion.count({ where: whereClause });

  return { no_leidas: count };
};

module.exports = {
  checkUserAccessToTrip,
  checkNotificationOwnership,
  validateCanales,
  getTripMembers,
  crearNotificacion,
  difundirNotificacion,
  marcarComoLeida,
  marcarTodasComoLeidas,
  obtenerConteoNoLeidas
};
