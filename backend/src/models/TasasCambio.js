/**
 * TasasCambio Model
 * Exchange rates for currency conversion
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TasasCambio = sequelize.define('tasas_cambio', {
  id_tasa_cambio: {
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
  tasa_usd_ars: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    comment: '1 USD = X ARS'
  },
  tasa_clp_ars: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    comment: '1 CLP = X ARS'
  },
  tipo_fuente: {
    type: DataTypes.ENUM('api', 'manual'),
    allowNull: false
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_proxima_actualizacion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Next expected update (if automatic)'
  }
}, {
  tableName: 'tasas_cambio',
  timestamps: false,
  validate: {
    tasasPositivas() {
      if (this.tasa_usd_ars <= 0 || this.tasa_clp_ars <= 0) {
        throw new Error('Exchange rates must be greater than 0');
      }
    }
  }
});

module.exports = TasasCambio;
