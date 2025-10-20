/**
 * Notificacion Model
 * Represents notifications sent to users
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notificacion = sequelize.define('notificaciones', {
  id_notificacion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario_destinatario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  id_viaje: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'viajes',
      key: 'id_viaje'
    }
  },
  tipo_evento: {
    type: DataTypes.ENUM('nuevo_gasto', 'pago_pendiente', 'cambio_cronograma', 'miembro_retiro', 'nuevo_miembro', 'otra'),
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  canales: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: '{push: true, email: true, whatsapp: false}'
  },
  leida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_lectura: {
    type: DataTypes.DATE,
    allowNull: true
  },
  url_accion: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Direct link to the related element'
  }
}, {
  tableName: 'notificaciones',
  timestamps: false,
  indexes: [
    {
      fields: ['id_usuario_destinatario', 'leida']
    },
    {
      fields: ['id_viaje', 'fecha_creacion']
    }
  ]
});

module.exports = Notificacion;
