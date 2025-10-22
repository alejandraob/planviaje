const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MiembroViaje = sequelize.define('MiembroViaje', {
    id_miembro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_viaje: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'viajes',
        key: 'id_viaje'
      }
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_usuario'
      }
    },
    rol: {
      type: DataTypes.ENUM('admin_principal', 'admin_secundario', 'miembro'),
      allowNull: false,
      defaultValue: 'miembro'
    },
    estado_participacion: {
      type: DataTypes.ENUM('activo', 'pausado', 'retirado'),
      allowNull: false,
      defaultValue: 'activo'
    },
    fecha_invitacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fecha_aceptacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_retiro: {
      type: DataTypes.DATE,
      allowNull: true
    },
    motivo_retiro: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    token_invitacion: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      comment: 'Token ├║nico para aceptar invitaci├│n'
    },
    invitacion_aceptada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    presupuesto_personal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Presupuesto l├¡mite personal (opcional, para menores)'
    },
    balance_actual: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Balance calculado (positivo = le deben, negativo = debe)'
    }
  }, {
    tableName: 'miembros_viaje',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['id_viaje'] },
      { fields: ['id_usuario'] },
      { fields: ['rol'] },
      { fields: ['estado_participacion'] },
      { fields: ['token_invitacion'] },
      {
        unique: true,
        fields: ['id_viaje', 'id_usuario'],
        name: 'unique_viaje_usuario'
      }
    ]
  });

  MiembroViaje.associate = (models) => {
    // Miembro pertenece a un viaje
    MiembroViaje.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje',
      as: 'viaje'
    });

    // Miembro pertenece a un usuario
    MiembroViaje.belongsTo(models.User, {
      foreignKey: 'id_usuario',
      as: 'usuario'
    });

    // Miembro pertenece a muchos subgrupos
    MiembroViaje.belongsToMany(models.Subgrupo, {
      through: models.SubgrupoMiembro,
      foreignKey: 'id_miembro',
      otherKey: 'id_subgrupo',
      as: 'subgrupos'
    });
  };

  return MiembroViaje;
};
