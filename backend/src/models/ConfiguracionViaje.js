/**
 * ConfiguracionViaje Model
 * Trip-specific configuration settings
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConfiguracionViaje = sequelize.define('configuracion_viaje', {
  id_config_viaje: {
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
  canales_notificacion: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Notification channel configuration per event type'
  },
  permite_edicion_pasado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dias_anticipacion_notificacion: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    comment: 'Days before to notify about pending payments'
  },
  moneda_base: {
    type: DataTypes.ENUM('ARS', 'CLP', 'USD'),
    defaultValue: 'ARS'
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'configuracion_viaje',
  timestamps: false
});

module.exports = ConfiguracionViaje;
