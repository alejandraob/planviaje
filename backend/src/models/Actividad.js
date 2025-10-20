/**
 * Actividad Model
 * Represents activities/events during the trip
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Actividad = sequelize.define('actividades', {
  id_actividad: {
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
  id_franja: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'franjas',
      key: 'id_franja'
    }
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo_actividad: {
    type: DataTypes.ENUM('entrada', 'visita', 'comida', 'transporte', 'otro'),
    allowNull: false
  },
  es_paga: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  valor_referencial_ars: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  valor_referencial_clp: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  valor_referencial_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  estado_pago: {
    type: DataTypes.ENUM('no_pagada', 'pagada', 'confirmada'),
    defaultValue: 'no_pagada'
  },
  id_usuario_pago: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  miembros_asignados: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Array of id_miembro_viaje participating in this activity'
  },
  estado_actividad: {
    type: DataTypes.ENUM('programada', 'en_curso', 'completada', 'cancelada', 'suspendida'),
    defaultValue: 'programada'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  id_usuario_creador: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  }
}, {
  tableName: 'actividades',
  timestamps: false,
  indexes: [
    {
      fields: ['id_viaje', 'fecha']
    },
    {
      fields: ['id_franja', 'estado_actividad']
    }
  ]
});

module.exports = Actividad;
