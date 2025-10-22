const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Actividad = sequelize.define('Actividad', {
    id_actividad: {
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
    id_franja: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'franjas',
        key: 'id_franja'
      },
      comment: 'Puede ser null si es actividad en d├¡a intermedio'
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Ej: Parque Dinosaurios, Cerro Campanario'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: true
    },
    tipo_actividad: {
      type: DataTypes.ENUM('gratuita', 'paga'),
      allowNull: false,
      defaultValue: 'gratuita'
    },
    valor_referencial_ars: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    valor_referencial_clp: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    valor_referencial_usd: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    esta_pagada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    id_gasto_asociado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'gastos',
        key: 'id_gasto'
      },
      comment: 'Gasto generado si se marca como pagada'
    },
    estado: {
      type: DataTypes.ENUM('programada', 'completada', 'cancelada', 'suspendida'),
      allowNull: false,
      defaultValue: 'programada'
    },
    id_usuario_creador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_usuario'
      }
    },
    miembros_asignados: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
      defaultValue: [],
      comment: 'Array de IDs de miembros asignados (vac├¡o = todos)'
    },
    ubicacion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    link_info: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Link a sitio web de la actividad'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'actividades',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['id_viaje'] },
      { fields: ['id_franja'] },
      { fields: ['fecha'] },
      { fields: ['estado'] }
    ]
  });

  Actividad.associate = (models) => {
    // Actividad pertenece a un viaje
    Actividad.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje',
      as: 'viaje'
    });

    // Actividad pertenece a una franja (opcional)
    Actividad.belongsTo(models.Franja, {
      foreignKey: 'id_franja',
      as: 'franja'
    });

    // Actividad creada por un usuario
    Actividad.belongsTo(models.User, {
      foreignKey: 'id_usuario_creador',
      as: 'creador'
    });

    // Actividad puede tener un gasto asociado
    Actividad.belongsTo(models.Gasto, {
      foreignKey: 'id_gasto_asociado',
      as: 'gastoAsociado'
    });
  };

  return Actividad;
};
