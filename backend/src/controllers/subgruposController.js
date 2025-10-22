/**
 * Subgrupos Controller
 * HTTP request handlers for subgroup management
 */

const { Subgrupo, SubgrupoMiembro, MiembroViaje, Usuario } = require('../models');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');
const {
  checkUserAccessToTrip,
  isUserAdmin,
  validateSubgroupName,
  validateMaxSubgroups,
  validateRepresentative,
  validateMiembros,
  canDeleteSubgroup,
  getSubgroupStats
} = require('../services/subgruposService');

/**
 * POST /api/viajes/:id/subgrupos
 * Create a new subgroup
 */
const crearSubgrupo = async (req, res, next) => {
  const { id } = req.params;
  const idUsuario = req.user.id_usuario;
  const {
    nombre,
    descripcion,
    id_representante,
    miembros
  } = req.body;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Validate max subgroups
  await validateMaxSubgroups(id);

  // Validate unique name
  await validateSubgroupName(id, nombre);

  // Validate representative
  await validateRepresentative(id, id_representante);

  // Validate members
  await validateMiembros(id, miembros);

  // Create subgroup
  const subgrupo = await Subgrupo.create({
    id_viaje: parseInt(id),
    nombre,
    descripcion,
    id_representante,
    estado: 'activo'
  });

  // Add members
  const miembrosData = miembros.map(idMiembro => ({
    id_subgrupo: subgrupo.id_subgrupo,
    id_miembro_viaje: idMiembro
  }));

  await SubgrupoMiembro.bulkCreate(miembrosData);

  // Reload with members
  await subgrupo.reload({
    include: [
      {
        model: MiembroViaje,
        as: 'representante',
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'nombre', 'apellido']
          }
        ]
      }
    ]
  });

  res.status(201).json({
    success: true,
    data: subgrupo
  });
};

/**
 * GET /api/viajes/:id/subgrupos
 * List subgroups with filters
 */
const listarSubgrupos = async (req, res, next) => {
  const { id } = req.params;
  const idUsuario = req.user.id_usuario;
  const {
    estado,
    page = 1,
    limit = 20
  } = req.query;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Build where clause
  const whereClause = { id_viaje: id };

  if (estado) whereClause.estado = estado;

  // Get subgroups with pagination
  const offset = (page - 1) * limit;
  const { count, rows: subgrupos } = await Subgrupo.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: MiembroViaje,
        as: 'representante',
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'nombre', 'apellido', 'email']
          }
        ]
      },
      {
        model: SubgrupoMiembro,
        as: 'miembros',
        include: [
          {
            model: MiembroViaje,
            as: 'miembroViaje',
            include: [
              {
                model: Usuario,
                as: 'usuario',
                attributes: ['id_usuario', 'nombre', 'apellido']
              }
            ]
          }
        ]
      }
    ],
    order: [['fecha_creacion', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });

  res.json({
    success: true,
    data: subgrupos,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  });
};

/**
 * GET /api/viajes/:id/subgrupos/:idSubgrupo
 * Get subgroup details
 */
const obtenerSubgrupo = async (req, res, next) => {
  const { id, idSubgrupo } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get subgroup
  const subgrupo = await Subgrupo.findOne({
    where: {
      id_subgrupo: idSubgrupo,
      id_viaje: id
    },
    include: [
      {
        model: MiembroViaje,
        as: 'representante',
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'nombre', 'apellido', 'email']
          }
        ]
      },
      {
        model: SubgrupoMiembro,
        as: 'miembros',
        include: [
          {
            model: MiembroViaje,
            as: 'miembroViaje',
            include: [
              {
                model: Usuario,
                as: 'usuario',
                attributes: ['id_usuario', 'nombre', 'apellido', 'email']
              }
            ]
          }
        ]
      }
    ]
  });

  if (!subgrupo) {
    throw new NotFoundError('Subgroup not found');
  }

  // Get statistics
  const stats = await getSubgroupStats(idSubgrupo);

  res.json({
    success: true,
    data: {
      ...subgrupo.toJSON(),
      estadisticas: stats
    }
  });
};

/**
 * PUT /api/viajes/:id/subgrupos/:idSubgrupo
 * Update subgroup
 */
const editarSubgrupo = async (req, res, next) => {
  const { id, idSubgrupo } = req.params;
  const idUsuario = req.user.id_usuario;
  const {
    nombre,
    descripcion,
    id_representante
  } = req.body;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get subgroup
  const subgrupo = await Subgrupo.findOne({
    where: {
      id_subgrupo: idSubgrupo,
      id_viaje: id
    }
  });

  if (!subgrupo) {
    throw new NotFoundError('Subgroup not found');
  }

  // Only admin or representative can edit
  const isAdmin = await isUserAdmin(id, idUsuario);
  const isRepresentative = subgrupo.id_representante === idUsuario;

  if (!isAdmin && !isRepresentative) {
    throw new ForbiddenError('Only admin or representative can edit this subgroup');
  }

  // Prepare update data
  const updateData = {};

  if (nombre !== undefined) {
    await validateSubgroupName(id, nombre, idSubgrupo);
    updateData.nombre = nombre;
  }
  if (descripcion !== undefined) updateData.descripcion = descripcion;
  if (id_representante !== undefined) {
    await validateRepresentative(id, id_representante);
    updateData.id_representante = id_representante;
  }

  // Update subgroup
  await subgrupo.update(updateData);
  await subgrupo.reload({
    include: [
      {
        model: MiembroViaje,
        as: 'representante',
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'nombre', 'apellido']
          }
        ]
      }
    ]
  });

  res.json({
    success: true,
    data: subgrupo,
    message: 'Subgroup updated successfully'
  });
};

/**
 * DELETE /api/viajes/:id/subgrupos/:idSubgrupo
 * Delete subgroup
 */
const eliminarSubgrupo = async (req, res, next) => {
  const { id, idSubgrupo } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get subgroup
  const subgrupo = await Subgrupo.findOne({
    where: {
      id_subgrupo: idSubgrupo,
      id_viaje: id
    }
  });

  if (!subgrupo) {
    throw new NotFoundError('Subgroup not found');
  }

  // Only admin can delete
  const isAdmin = await isUserAdmin(id, idUsuario);
  if (!isAdmin) {
    throw new ForbiddenError('Only admin can delete subgroups');
  }

  // Check if can be deleted
  await canDeleteSubgroup(subgrupo);

  // Delete members first
  await SubgrupoMiembro.destroy({
    where: { id_subgrupo: idSubgrupo }
  });

  // Delete subgroup
  await subgrupo.destroy();

  res.json({
    success: true,
    message: 'Subgroup deleted successfully'
  });
};

/**
 * POST /api/viajes/:id/subgrupos/:idSubgrupo/miembros
 * Add member to subgroup
 */
const agregarMiembro = async (req, res, next) => {
  const { id, idSubgrupo } = req.params;
  const idUsuario = req.user.id_usuario;
  const { id_miembro_viaje } = req.body;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get subgroup
  const subgrupo = await Subgrupo.findOne({
    where: {
      id_subgrupo: idSubgrupo,
      id_viaje: id
    }
  });

  if (!subgrupo) {
    throw new NotFoundError('Subgroup not found');
  }

  // Validate member
  await validateMiembros(id, [id_miembro_viaje]);

  // Check if already member
  const existing = await SubgrupoMiembro.findOne({
    where: {
      id_subgrupo: idSubgrupo,
      id_miembro_viaje
    }
  });

  if (existing) {
    throw new ForbiddenError('Member already in subgroup');
  }

  // Add member
  await SubgrupoMiembro.create({
    id_subgrupo: idSubgrupo,
    id_miembro_viaje
  });

  res.json({
    success: true,
    message: 'Member added to subgroup successfully'
  });
};

/**
 * DELETE /api/viajes/:id/subgrupos/:idSubgrupo/miembros/:idMiembro
 * Remove member from subgroup
 */
const removerMiembro = async (req, res, next) => {
  const { id, idSubgrupo, idMiembro } = req.params;
  const idUsuario = req.user.id_usuario;

  // Check user access
  await checkUserAccessToTrip(id, idUsuario);

  // Get subgroup
  const subgrupo = await Subgrupo.findOne({
    where: {
      id_subgrupo: idSubgrupo,
      id_viaje: id
    }
  });

  if (!subgrupo) {
    throw new NotFoundError('Subgroup not found');
  }

  // Find member in subgroup
  const miembro = await SubgrupoMiembro.findOne({
    where: {
      id_subgrupo: idSubgrupo,
      id_miembro_viaje: idMiembro
    }
  });

  if (!miembro) {
    throw new NotFoundError('Member not found in subgroup');
  }

  // Delete member
  await miembro.destroy();

  res.json({
    success: true,
    message: 'Member removed from subgroup successfully'
  });
};

module.exports = {
  crearSubgrupo,
  listarSubgrupos,
  obtenerSubgrupo,
  editarSubgrupo,
  eliminarSubgrupo,
  agregarMiembro,
  removerMiembro
};
