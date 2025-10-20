/**
 * Cronograma Model
 * Represents the overall trip timeline
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cronograma = sequelize.define('cronograma', {
  id_cronograma: {
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
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('activo', 'finalizado', 'cancelado'),
    defaultValue: 'activo'
  }
}, {
  tableName: 'cronograma',
  timestamps: false
});

module.exports = Cronograma;
