const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pago = sequelize.define('Pago', {
    id_pago: {
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
    id_deuda: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'deudas',
        key: 'id_deuda'
      },
      comment: 'Deuda que este pago liquida (puede ser null si es pago directo)'
    },
    id_usuario_paga: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_usuario'
      },
      comment: 'Usuario que realiza el pago'
    },
    id_usuario_recibe: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_usuario'
      },
      comment: 'Usuario que recibe el pago'
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
    metodo_pago: {
      type: DataTypes.ENUM('efectivo', 'transferencia', 'mercado_pago', 'tarjeta'),
      allowNull: false,
      defaultValue: 'efectivo'
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    confirmado_por_receptor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'True cuando el receptor confirma que recibi├│ el dinero'
    },
    fecha_confirmacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    comprobante_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    id_transaccion_externa: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'ID de transacci├│n de Mercado Pago u otro proveedor'
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'pagos',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['id_viaje'] },
      { fields: ['id_deuda'] },
      { fields: ['id_usuario_paga'] },
      { fields: ['id_usuario_recibe'] },
      { fields: ['fecha_pago'] },
      { fields: ['id_transaccion_externa'] }
    ]
  });

  Pago.associate = (models) => {
    // Pago pertenece a un viaje
    Pago.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje',
      as: 'viaje'
    });

    // Pago pertenece a una deuda (opcional)
    Pago.belongsTo(models.Deuda, {
      foreignKey: 'id_deuda',
      as: 'deuda'
    });

    // Pago realizado por un usuario
    Pago.belongsTo(models.User, {
      foreignKey: 'id_usuario_paga',
      as: 'usuarioPaga'
    });

    // Pago recibido por un usuario
    Pago.belongsTo(models.User, {
      foreignKey: 'id_usuario_recibe',
      as: 'usuarioRecibe'
    });
  };

  return Pago;
};
