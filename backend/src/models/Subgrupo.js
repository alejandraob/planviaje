/**
 * Subgrupo Model
 * Represents subgroups within a trip (families, friend circles, etc.)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subgrupo = sequelize.define('subgrupos', {
  id_subgrupo: {
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
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  id_representante: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('activo', 'pausado', 'eliminado'),
    defaultValue: 'activo'
  }
}, {
  tableName: 'subgrupos',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_viaje', 'nombre']
    },
    {
      fields: ['id_viaje', 'estado']
    }
  ]
});

module.exports = Subgrupo;
