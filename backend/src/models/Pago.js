/**
 * Pago Model
 * Represents payment confirmations for debts
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pago = sequelize.define('pagos', {
  id_pago: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_deuda: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'deudas',
      key: 'id_deuda'
    }
  },
  id_pagador: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  id_confirmador: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'transferencia', 'tarjeta', 'otro'),
    defaultValue: 'transferencia',
    allowNull: false
  },
  monto_ars: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  monto_clp: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  monto_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  estado_pago: {
    type: DataTypes.ENUM('pendiente', 'confirmado', 'rechazado'),
    defaultValue: 'pendiente'
  },
  fecha_pago: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_confirmacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  referencia_mercadopago: {
    type: DataTypes.STRING,
    allowNull: true
  },
  comprobante_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'pagos',
  timestamps: false,
  indexes: [
    {
      fields: ['id_deuda', 'estado_pago']
    },
    {
      fields: ['id_pagador', 'estado_pago']
    }
  ]
});

module.exports = Pago;
