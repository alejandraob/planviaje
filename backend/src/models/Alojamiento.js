/**
 * Alojamiento Model
 * Represents lodging/accommodation bookings
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alojamiento = sequelize.define('alojamientos', {
  id_alojamiento: {
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
  link_reserva: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fecha_checkin: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_checkin: {
    type: DataTypes.TIME,
    allowNull: true
  },
  fecha_checkout: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_checkout: {
    type: DataTypes.TIME,
    allowNull: true
  },
  ubicacion_descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado_pago: {
    type: DataTypes.ENUM('no_pagado', 'pagado', 'parcialmente_pagado'),
    allowNull: false
  },
  monto_total_ars: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  monto_total_clp: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  monto_total_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  monto_pagado_ars: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  monto_faltante_ars: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  id_usuario_reserva: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  id_usuario_creador: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  miembros_asignados: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of id_miembro_viaje assigned to this accommodation'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'alojamientos',
  timestamps: false,
  indexes: [
    {
      fields: ['id_viaje', 'id_franja']
    },
    {
      fields: ['fecha_checkin', 'fecha_checkout']
    }
  ]
});

module.exports = Alojamiento;
