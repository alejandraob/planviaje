/**
 * Miembros Routes
 * Routes for trip members management
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :id from parent router
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');
const {
  invitarMiembroSchema,
  actualizarMiembroSchema,
  cambiarAdminSchema,
  idParamSchema
} = require('../utils/validationSchemas');
const {
  invitarMiembro,
  listarMiembros,
  obtenerMiembro,
  actualizarMiembro,
  removerMiembro,
  cambiarAdminSecundario,
  pausarParticipacion,
  reanudarParticipacion
} = require('../controllers/miembrosController');
const Joi = require('joi');

// Validation schemas
const memberIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  memberId: Joi.number().integer().positive().required()
});

const miembrosFiltrosSchema = Joi.object({
  estado_participacion: Joi.string().valid('activo', 'pausado', 'retirado').optional(),
  rol: Joi.string().valid('admin_principal', 'admin_secundario', 'miembro').optional()
});

/**
 * @route   POST /api/viajes/:id/miembros
 * @desc    Invite member to trip
 * @access  Private (admin only)
 */
router.post(
  '/',
  authenticate,
  validateBody(invitarMiembroSchema),
  asyncHandler(invitarMiembro)
);

/**
 * @route   GET /api/viajes/:id/miembros
 * @desc    List trip members
 * @access  Private (trip members only)
 */
router.get(
  '/',
  authenticate,
  validateQuery(miembrosFiltrosSchema),
  asyncHandler(listarMiembros)
);

/**
 * @route   GET /api/viajes/:id/miembros/:memberId
 * @desc    Get member details
 * @access  Private (trip members only)
 */
router.get(
  '/:memberId',
  authenticate,
  validateParams(memberIdSchema),
  asyncHandler(obtenerMiembro)
);

/**
 * @route   PUT /api/viajes/:id/miembros/:memberId
 * @desc    Update member
 * @access  Private (admin only)
 */
router.put(
  '/:memberId',
  authenticate,
  validateParams(memberIdSchema),
  validateBody(actualizarMiembroSchema),
  asyncHandler(actualizarMiembro)
);

/**
 * @route   DELETE /api/viajes/:id/miembros/:memberId
 * @desc    Remove member from trip
 * @access  Private (admin only)
 */
router.delete(
  '/:memberId',
  authenticate,
  validateParams(memberIdSchema),
  asyncHandler(removerMiembro)
);

/**
 * @route   PUT /api/viajes/:id/miembros/:memberId/pausar
 * @desc    Pause member participation
 * @access  Private (member themselves or admin)
 */
router.put(
  '/:memberId/pausar',
  authenticate,
  validateParams(memberIdSchema),
  asyncHandler(pausarParticipacion)
);

/**
 * @route   PUT /api/viajes/:id/miembros/:memberId/reanudar
 * @desc    Resume member participation
 * @access  Private (member themselves or admin)
 */
router.put(
  '/:memberId/reanudar',
  authenticate,
  validateParams(memberIdSchema),
  asyncHandler(reanudarParticipacion)
);

module.exports = router;
