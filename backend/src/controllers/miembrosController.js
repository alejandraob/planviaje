/**
 * Miembros Controller
 * Handles all trip members related HTTP requests
 */

const { MiembroViaje, Usuario, Viaje } = require('../models');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');
const {
  checkUserIsAdmin,
  checkUserIsPrincipalAdmin,
  checkUserIsMember,
  validateUserExists,
  checkUserNotAlreadyMember,
  checkTripCapacity,
  validateMinorMember,
  canRemoveMember,
  validateAdminChange
} = require('../services/miembrosService');

/**
 * Invite member to trip
 * @route POST /api/viajes/:id/miembros
 * @access Private (admin only)
 */
const invitarMiembro = async (req, res) => {
  const { id } = req.params;
  const {
    email,
    es_menor = false,
    id_responsable_legal,
    presupuesto_maximo_diario
  } = req.body;
  const idUsuario = req.user.id_usuario;

  // Check if current user is admin
  await checkUserIsAdmin(id, idUsuario);

  // Get trip
  const viaje = await Viaje.findByPk(id);
  if (!viaje) {
    throw new NotFoundError('Trip not found');
  }

  // Validate user exists
  const usuarioInvitado = await validateUserExists(email);

  // Check if user is already a member
  await checkUserNotAlreadyMember(id, usuarioInvitado.id_usuario);

  // Check trip capacity
  await checkTripCapacity(viaje);

  // Validate minor member
  validateMinorMember(es_menor, id_responsable_legal);

  // If legal guardian is specified, validate it's a member
  if (id_responsable_legal) {
    await checkUserIsMember(id, id_responsable_legal);
  }

  // Create member
  const miembro = await MiembroViaje.create({
    id_viaje: id,
    id_usuario: usuarioInvitado.id_usuario,
    rol: 'miembro',
    es_menor,
    id_responsable_legal,
    presupuesto_maximo_diario,
    estado_participacion: 'activo'
  });

  // Fetch member with user info
  const miembroCompleto = await MiembroViaje.findByPk(miembro.id_miembro_viaje, {
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'avatar_url']
      }
    ]
  });

  logger.info(`User ${usuarioInvitado.id_usuario} added to trip ${id} by admin ${idUsuario}`);

  res.status(201).json({
    success: true,
    message: 'Member added successfully',
    data: {
      miembro: miembroCompleto
    }
  });
};

/**
 * List trip members
 * @route GET /api/viajes/:id/miembros
 * @access Private (trip members only)
 */
const listarMiembros = async (req, res) => {
  const { id } = req.params;
  const idUsuario = req.user.id_usuario;
  const { estado_participacion, rol } = req.query;

  // Check if user is member
  await checkUserIsMember(id, idUsuario);

  // Build where clause
  const whereClause = { id_viaje: id };
  if (estado_participacion) whereClause.estado_participacion = estado_participacion;
  if (rol) whereClause.rol = rol;

  const miembros = await MiembroViaje.findAll({
    where: whereClause,
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'telefono', 'avatar_url']
      },
      {
        model: Usuario,
        as: 'responsableLegal',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email'],
        required: false
      }
    ],
    order: [
      ['rol', 'ASC'],
      ['fecha_union', 'ASC']
    ]
  });

  res.json({
    success: true,
    data: {
      miembros,
      total: miembros.length
    }
  });
};

/**
 * Get member details
 * @route GET /api/viajes/:id/miembros/:memberId
 * @access Private (trip members only)
 */
const obtenerMiembro = async (req, res) => {
  const { id, memberId } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check if user is member
  await checkUserIsMember(id, idUsuario);

  const miembro = await MiembroViaje.findOne({
    where: {
      id_miembro_viaje: memberId,
      id_viaje: id
    },
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'telefono', 'avatar_url', 'cbu_argentina']
      },
      {
        model: Usuario,
        as: 'responsableLegal',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email'],
        required: false
      }
    ]
  });

  if (!miembro) {
    throw new NotFoundError('Member not found');
  }

  res.json({
    success: true,
    data: {
      miembro
    }
  });
};

/**
 * Update member
 * @route PUT /api/viajes/:id/miembros/:memberId
 * @access Private (admin only)
 */
const actualizarMiembro = async (req, res) => {
  const { id, memberId } = req.params;
  const {
    presupuesto_maximo_diario,
    id_responsable_legal,
    es_menor
  } = req.body;
  const idUsuario = req.user.id_usuario;

  // Check if current user is admin
  await checkUserIsAdmin(id, idUsuario);

  const miembro = await MiembroViaje.findOne({
    where: {
      id_miembro_viaje: memberId,
      id_viaje: id
    }
  });

  if (!miembro) {
    throw new NotFoundError('Member not found');
  }

  // Cannot modify principal admin
  if (miembro.rol === 'admin_principal') {
    throw new BadRequestError('Cannot modify principal admin');
  }

  // Validate minor if provided
  if (es_menor !== undefined) {
    validateMinorMember(es_menor, id_responsable_legal || miembro.id_responsable_legal);
  }

  // Update fields
  const updateData = {};
  if (presupuesto_maximo_diario !== undefined) updateData.presupuesto_maximo_diario = presupuesto_maximo_diario;
  if (id_responsable_legal !== undefined) updateData.id_responsable_legal = id_responsable_legal;
  if (es_menor !== undefined) updateData.es_menor = es_menor;

  await miembro.update(updateData);

  // Fetch updated member
  const miembroActualizado = await MiembroViaje.findByPk(memberId, {
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'avatar_url']
      }
    ]
  });

  logger.info(`Member ${memberId} updated in trip ${id} by admin ${idUsuario}`);

  res.json({
    success: true,
    message: 'Member updated successfully',
    data: {
      miembro: miembroActualizado
    }
  });
};

/**
 * Remove member from trip
 * @route DELETE /api/viajes/:id/miembros/:memberId
 * @access Private (admin only)
 */
const removerMiembro = async (req, res) => {
  const { id, memberId } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check if current user is admin
  await checkUserIsAdmin(id, idUsuario);

  const miembro = await MiembroViaje.findOne({
    where: {
      id_miembro_viaje: memberId,
      id_viaje: id
    }
  });

  if (!miembro) {
    throw new NotFoundError('Member not found');
  }

  // Check if member can be removed
  await canRemoveMember(miembro);

  // Mark as retired instead of deleting
  await miembro.update({
    estado_participacion: 'retirado',
    fecha_pausa_retiro: new Date()
  });

  logger.info(`Member ${memberId} removed from trip ${id} by admin ${idUsuario}`);

  res.json({
    success: true,
    message: 'Member removed successfully'
  });
};

/**
 * Change secondary admin
 * @route PUT /api/viajes/:id/admin-secundario
 * @access Private (principal admin only)
 */
const cambiarAdminSecundario = async (req, res) => {
  const { id } = req.params;
  const { id_usuario_nuevo_admin } = req.body;
  const idUsuario = req.user.id_usuario;

  // Get trip
  const viaje = await Viaje.findByPk(id);
  if (!viaje) {
    throw new NotFoundError('Trip not found');
  }

  // Validate admin change
  const nuevoAdminMiembro = await validateAdminChange(viaje, id_usuario_nuevo_admin, idUsuario);

  // Update old secondary admin role to 'miembro' if exists
  if (viaje.id_admin_secundario_actual) {
    await MiembroViaje.update(
      { rol: 'miembro' },
      {
        where: {
          id_viaje: id,
          id_usuario: viaje.id_admin_secundario_actual
        }
      }
    );
  }

  // Update new admin role
  await nuevoAdminMiembro.update({ rol: 'admin_secundario' });

  // Update trip
  await viaje.update({ id_admin_secundario_actual: id_usuario_nuevo_admin });

  logger.info(`Secondary admin changed to user ${id_usuario_nuevo_admin} in trip ${id}`);

  res.json({
    success: true,
    message: 'Secondary admin changed successfully',
    data: {
      viaje: {
        id_viaje: viaje.id_viaje,
        id_admin_principal: viaje.id_admin_principal,
        id_admin_secundario_actual: viaje.id_admin_secundario_actual
      }
    }
  });
};

/**
 * Pause participation
 * @route PUT /api/viajes/:id/miembros/:memberId/pausar
 * @access Private (member themselves or admin)
 */
const pausarParticipacion = async (req, res) => {
  const { id, memberId } = req.params;
  const idUsuario = req.user.id_usuario;

  const miembro = await MiembroViaje.findOne({
    where: {
      id_miembro_viaje: memberId,
      id_viaje: id
    }
  });

  if (!miembro) {
    throw new NotFoundError('Member not found');
  }

  // Only the member themselves or an admin can pause
  const esAdmin = await checkUserIsAdmin(id, idUsuario).catch(() => false);
  if (miembro.id_usuario !== idUsuario && !esAdmin) {
    throw new ForbiddenError('You can only pause your own participation or be an admin');
  }

  // Cannot pause principal admin
  if (miembro.rol === 'admin_principal') {
    throw new BadRequestError('Cannot pause principal admin participation');
  }

  if (miembro.estado_participacion === 'pausado') {
    throw new BadRequestError('Participation is already paused');
  }

  await miembro.update({
    estado_participacion: 'pausado',
    fecha_pausa_retiro: new Date()
  });

  logger.info(`Member ${memberId} paused participation in trip ${id}`);

  res.json({
    success: true,
    message: 'Participation paused successfully'
  });
};

/**
 * Resume participation
 * @route PUT /api/viajes/:id/miembros/:memberId/reanudar
 * @access Private (member themselves or admin)
 */
const reanudarParticipacion = async (req, res) => {
  const { id, memberId } = req.params;
  const idUsuario = req.user.id_usuario;

  const miembro = await MiembroViaje.findOne({
    where: {
      id_miembro_viaje: memberId,
      id_viaje: id
    }
  });

  if (!miembro) {
    throw new NotFoundError('Member not found');
  }

  // Only the member themselves or an admin can resume
  const esAdmin = await checkUserIsAdmin(id, idUsuario).catch(() => false);
  if (miembro.id_usuario !== idUsuario && !esAdmin) {
    throw new ForbiddenError('You can only resume your own participation or be an admin');
  }

  if (miembro.estado_participacion !== 'pausado') {
    throw new BadRequestError('Participation is not paused');
  }

  await miembro.update({
    estado_participacion: 'activo',
    fecha_pausa_retiro: null
  });

  logger.info(`Member ${memberId} resumed participation in trip ${id}`);

  res.json({
    success: true,
    message: 'Participation resumed successfully'
  });
};

module.exports = {
  invitarMiembro,
  listarMiembros,
  obtenerMiembro,
  actualizarMiembro,
  removerMiembro,
  cambiarAdminSecundario,
  pausarParticipacion,
  reanudarParticipacion
};
