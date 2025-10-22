const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Gasto = sequelize.define('Gasto', {
    id_gasto: {
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
    id_usuario_pagador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_usuario'
      },
      comment: 'Usuario que realiz├│ el pago'
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    categoria: {
      type: DataTypes.ENUM('comida', 'transporte', 'alojamiento', 'entradas', 'otros'),
      allowNull: false,
      defaultValue: 'otros'
    },
    tipo_gasto: {
      type: DataTypes.ENUM('individual', 'grupal', 'subgrupo'),
      allowNull: false,
      defaultValue: 'individual'
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
    moneda_original: {
      type: DataTypes.ENUM('ARS', 'CLP', 'USD'),
      allowNull: false,
      defaultValue: 'ARS'
    },
    fecha_gasto: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    id_gasto_padre: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'gastos',
        key: 'id_gasto'
      },
      comment: 'Si es gasto hijo (diferencia encontrada despu├®s)'
    },
    es_gasto_hijo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    comprobante_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    confirmado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si otros miembros confirmaron el gasto'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'gastos',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['id_viaje'] },
      { fields: ['id_usuario_pagador'] },
      { fields: ['tipo_gasto'] },
      { fields: ['categoria'] },
      { fields: ['fecha_gasto'] },
      { fields: ['id_gasto_padre'] }
    ]
  });

  Gasto.associate = (models) => {
    // Gasto pertenece a un viaje
    Gasto.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje',
      as: 'viaje'
    });

    // Gasto pagado por un usuario
    Gasto.belongsTo(models.User, {
      foreignKey: 'id_usuario_pagador',
      as: 'pagador'
    });

    // Gasto padre (para gastos hijo)
    Gasto.belongsTo(Gasto, {
      foreignKey: 'id_gasto_padre',
      as: 'gastoPadre'
    });

    // Gastos hijos
    Gasto.hasMany(Gasto, {
      foreignKey: 'id_gasto_padre',
      as: 'gastosHijos'
    });

    // Gasto tiene muchas deudas
    Gasto.hasMany(models.Deuda, {
      foreignKey: 'id_gasto',
      as: 'deudas'
    });

    // Gasto puede estar asociado a subgrupos (tabla intermedia)
    Gasto.hasMany(models.GastoSubgrupo, {
      foreignKey: 'id_gasto',
      as: 'subgruposAsociados'
    });
  };

  return Gasto;
};
