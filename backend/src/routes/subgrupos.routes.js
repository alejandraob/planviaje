/**
 * Subgrupos Routes
 * Routes for subgroup management
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateBody, validateParams } = require('../middleware/validation');
const {
  crearSubgrupoSchema,
  editarSubgrupoSchema,
  agregarMiembroSubgrupoSchema,
  idSubgrupoParamSchema,
  idSubgrupoMiembroParamSchema
} = require('../utils/validationSchemas');
const {
  crearSubgrupo,
  listarSubgrupos,
  obtenerSubgrupo,
  editarSubgrupo,
  eliminarSubgrupo,
  agregarMiembro,
  removerMiembro
} = require('../controllers/subgruposController');

// CRUD routes
router.post(
  '/',
  authenticate,
  validateBody(crearSubgrupoSchema),
  asyncHandler(crearSubgrupo)
);

router.get(
  '/',
  authenticate,
  asyncHandler(listarSubgrupos)
);

router.get(
  '/:idSubgrupo',
  authenticate,
  validateParams(idSubgrupoParamSchema),
  asyncHandler(obtenerSubgrupo)
);

router.put(
  '/:idSubgrupo',
  authenticate,
  validateParams(idSubgrupoParamSchema),
  validateBody(editarSubgrupoSchema),
  asyncHandler(editarSubgrupo)
);

router.delete(
  '/:idSubgrupo',
  authenticate,
  validateParams(idSubgrupoParamSchema),
  asyncHandler(eliminarSubgrupo)
);

// Member management routes
router.post(
  '/:idSubgrupo/miembros',
  authenticate,
  validateParams(idSubgrupoParamSchema),
  validateBody(agregarMiembroSubgrupoSchema),
  asyncHandler(agregarMiembro)
);

router.delete(
  '/:idSubgrupo/miembros/:idMiembro',
  authenticate,
  validateParams(idSubgrupoMiembroParamSchema),
  asyncHandler(removerMiembro)
);

module.exports = router;
