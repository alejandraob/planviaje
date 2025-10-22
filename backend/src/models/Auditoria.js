const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Auditoria = sequelize.define('Auditoria', {
    id_auditoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_viaje: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'viajes',
        key: 'id_viaje'
      },
      comment: 'Viaje relacionado (puede ser null)'
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_usuario'
      },
      comment: 'Usuario que realiz├│ la acci├│n'
    },
    tipo_accion: {
      type: DataTypes.ENUM('crear', 'editar', 'eliminar', 'cambio_estado'),
      allowNull: false
    },
    entidad_afectada: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Ej: gasto, viaje, miembro, franja, etc.'
    },
    id_entidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID del registro afectado'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Descripci├│n de la acci├│n realizada'
    },
    datos_anteriores: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Snapshot de datos antes del cambio'
    },
    datos_nuevos: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Snapshot de datos despu├®s del cambio'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'auditoria',
    timestamps: true,
    createdAt: 'fecha_accion',
    updatedAt: false, // No necesitamos updatedAt en auditor├¡a
    indexes: [
      { fields: ['id_viaje'] },
      { fields: ['id_usuario'] },
      { fields: ['tipo_accion'] },
      { fields: ['entidad_afectada'] },
      { fields: ['id_entidad'] },
      { fields: ['fecha_accion'] }
    ]
  });

  Auditoria.associate = (models) => {
    // Auditor├¡a pertenece a un viaje (opcional)
    Auditoria.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje',
      as: 'viaje'
    });

    // Auditor├¡a realizada por un usuario
    Auditoria.belongsTo(models.User, {
      foreignKey: 'id_usuario',
      as: 'usuario'
    });
  };

  return Auditoria;
};
