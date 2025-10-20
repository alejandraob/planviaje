/**
 * Auditoria Model
 * Audit log for all changes in the system
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Auditoria = sequelize.define('auditoria', {
  id_auditoria: {
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
  id_usuario_accion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  tipo_evento: {
    type: DataTypes.ENUM('crear', 'editar', 'eliminar', 'pausar'),
    allowNull: false
  },
  tabla_afectada: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the affected table (e.g. "GASTOS", "FRANJAS")'
  },
  id_registro_afectado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID of the affected record'
  },
  cambio_anterior: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Previous state of the record'
  },
  cambio_nuevo: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'New state of the record'
  },
  timestamp_accion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'auditoria',
  timestamps: false,
  indexes: [
    {
      fields: ['id_viaje', 'timestamp_accion']
    },
    {
      fields: ['id_usuario_accion', 'timestamp_accion']
    }
  ]
});

module.exports = Auditoria;
