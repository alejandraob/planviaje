const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Deuda = sequelize.define('Deuda', {
    id_deuda: {
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
    id_gasto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'gastos',
        key: 'id_gasto'
      },
      comment: 'Gasto que gener├│ esta deuda'
    },
    id_acreedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_usuario'
      },
      comment: 'Usuario que pag├│ y al que le deben'
    },
    id_deudor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_usuario'
      },
      comment: 'Usuario que debe pagar'
    },
    monto_ars: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    monto_clp: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    monto_usd: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    estado_deuda: {
      type: DataTypes.ENUM('pendiente', 'pagado', 'confirmado'),
      allowNull: false,
      defaultValue: 'pendiente',
      comment: 'pendiente -> pagado (por deudor) -> confirmado (por acreedor)'
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que el deudor marc├│ como pagado'
    },
    fecha_confirmacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que el acreedor confirm├│ el pago'
    },
    metodo_pago: {
      type: DataTypes.ENUM('efectivo', 'transferencia', 'mercado_pago', 'tarjeta'),
      allowNull: true
    },
    comprobante_pago_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'deudas',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['id_viaje'] },
      { fields: ['id_gasto'] },
      { fields: ['id_acreedor'] },
      { fields: ['id_deudor'] },
      { fields: ['estado_deuda'] },
      { fields: ['id_acreedor', 'id_deudor'] }
    ]
  });

  Deuda.associate = (models) => {
    // Deuda pertenece a un viaje
    Deuda.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje',
      as: 'viaje'
    });

    // Deuda pertenece a un gasto
    Deuda.belongsTo(models.Gasto, {
      foreignKey: 'id_gasto',
      as: 'gasto'
    });

    // Deuda tiene un acreedor (usuario)
    Deuda.belongsTo(models.User, {
      foreignKey: 'id_acreedor',
      as: 'acreedor'
    });

    // Deuda tiene un deudor (usuario)
    Deuda.belongsTo(models.User, {
      foreignKey: 'id_deudor',
      as: 'deudor'
    });

    // Deuda puede tener un pago asociado
    Deuda.hasOne(models.Pago, {
      foreignKey: 'id_deuda',
      as: 'pago'
    });
  };

  return Deuda;
};
