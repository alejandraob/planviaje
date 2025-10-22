const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ConfiguracionViaje = sequelize.define('ConfiguracionViaje', {
    id_configuracion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_viaje: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'viajes',
        key: 'id_viaje'
      }
    },
    permitir_gastos_individuales: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    permitir_gastos_grupales: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    permitir_subgrupos: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    limite_miembros: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      comment: 'L├¡mite m├íximo de miembros para este viaje'
    },
    requiere_confirmacion_gastos: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si true, los gastos requieren confirmaci├│n de otros miembros'
    },
    requiere_confirmacion_pagos: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si true, los pagos requieren confirmaci├│n mutua'
    },
    notificaciones_habilitadas: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    canales_notificacion_permitidos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['push', 'email'],
      comment: 'Canales permitidos para este viaje'
    },
    division_automatica_habilitada: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si true, divide gastos autom├íticamente'
    },
    presupuesto_alertas_habilitadas: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si true, env├¡a alertas cuando se excede presupuesto'
    },
    presupuesto_limite_alertas: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'L├¡mite en ARS para enviar alertas'
    },
    configuracion_adicional: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Configuraciones adicionales personalizadas'
    }
  }, {
    tableName: 'configuracion_viaje',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['id_viaje'], unique: true }
    ]
  });

  ConfiguracionViaje.associate = (models) => {
    // Configuraci├│n pertenece a un viaje
    ConfiguracionViaje.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje',
      as: 'viaje'
    });
  };

  return ConfiguracionViaje;
};
