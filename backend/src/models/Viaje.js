const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Viaje = sequelize.define('Viaje', {
    id_viaje: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_viaje: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isAfterStart(value) {
          if (value <= this.fecha_inicio) {
            throw new Error('Fecha fin debe ser posterior a fecha inicio');
          }
        }
      }
    },
    tipo_viaje: {
      type: DataTypes.ENUM('individual', 'amigos', 'familia'),
      allowNull: false,
      defaultValue: 'amigos'
    },
    alcance: {
      type: DataTypes.ENUM('nacional', 'internacional'),
      allowNull: false,
      defaultValue: 'nacional'
    },
    id_usuario_creador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_usuario'
      }
    },
    estado_viaje: {
      type: DataTypes.ENUM('planificacion', 'en_curso', 'finalizado', 'cancelado'),
      allowNull: false,
      defaultValue: 'planificacion'
    },
    imagen_portada_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    moneda_principal: {
      type: DataTypes.ENUM('ARS', 'CLP', 'USD'),
      allowNull: false,
      defaultValue: 'ARS'
    },
    presupuesto_estimado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    total_gastos: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Total de gastos registrados (calculado)'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'viajes',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['id_usuario_creador'] },
      { fields: ['estado_viaje'] },
      { fields: ['fecha_inicio', 'fecha_fin'] }
    ]
  });

  Viaje.associate = (models) => {
    // Viaje pertenece a un usuario creador
    Viaje.belongsTo(models.User, {
      foreignKey: 'id_usuario_creador',
      as: 'creador'
    });

    // Viaje tiene muchos miembros
    Viaje.belongsToMany(models.User, {
      through: models.MiembroViaje,
      foreignKey: 'id_viaje',
      otherKey: 'id_usuario',
      as: 'miembros'
    });

    // Viaje tiene muchas franjas
    Viaje.hasMany(models.Franja, {
      foreignKey: 'id_viaje',
      as: 'franjas'
    });

    // Viaje tiene muchos subgrupos
    Viaje.hasMany(models.Subgrupo, {
      foreignKey: 'id_viaje',
      as: 'subgrupos'
    });

    // Viaje tiene muchos gastos
    Viaje.hasMany(models.Gasto, {
      foreignKey: 'id_viaje',
      as: 'gastos'
    });

    // Viaje tiene muchas actividades
    Viaje.hasMany(models.Actividad, {
      foreignKey: 'id_viaje',
      as: 'actividades'
    });

    // Viaje tiene una configuraci├│n
    Viaje.hasOne(models.ConfiguracionViaje, {
      foreignKey: 'id_viaje',
      as: 'configuracion'
    });

    // Viaje tiene muchas notificaciones
    Viaje.hasMany(models.Notificacion, {
      foreignKey: 'id_viaje',
      as: 'notificaciones'
    });
  };

  return Viaje;
};
