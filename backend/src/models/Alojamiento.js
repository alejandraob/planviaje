const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Alojamiento = sequelize.define('Alojamiento', {
    id_alojamiento: {
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
      comment: 'Puede ser null si es alojamiento sin franja espec├¡fica'
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Ej: Booking - Caba├▒a Villa Traful'
    },
    link_reserva: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL de Booking, Airbnb, etc.'
    },
    fecha_checkin: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_checkout: {
      type: DataTypes.DATE,
      allowNull: false
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado_pago: {
      type: DataTypes.ENUM('no_pagado', 'pagado', 'parcialmente_pagado'),
      allowNull: false,
      defaultValue: 'no_pagado'
    },
    monto_total_ars: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    monto_total_clp: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    monto_total_usd: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    monto_pagado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    monto_pendiente: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    id_usuario_reservo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id_usuario'
      },
      comment: 'Usuario que realiz├│ la reserva'
    },
    id_gasto_asociado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'gastos',
        key: 'id_gasto'
      },
      comment: 'Gasto generado autom├íticamente al marcar como pagado'
    },
    comprobante_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'alojamientos',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['id_viaje'] },
      { fields: ['id_franja'] },
      { fields: ['estado_pago'] },
      { fields: ['fecha_checkin', 'fecha_checkout'] }
    ]
  });

  Alojamiento.associate = (models) => {
    // Alojamiento pertenece a un viaje
    Alojamiento.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje',
      as: 'viaje'
    });

    // Alojamiento pertenece a una franja (opcional)
    Alojamiento.belongsTo(models.Franja, {
      foreignKey: 'id_franja',
      as: 'franja'
    });

    // Alojamiento fue reservado por un usuario
    Alojamiento.belongsTo(models.User, {
      foreignKey: 'id_usuario_reservo',
      as: 'usuarioReservo'
    });

    // Alojamiento puede tener un gasto asociado
    Alojamiento.belongsTo(models.Gasto, {
      foreignKey: 'id_gasto_asociado',
      as: 'gastoAsociado'
    });
  };

  return Alojamiento;
};
