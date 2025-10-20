/**
 * Gasto Model
 * Represents expenses/costs for the main group
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Gasto = sequelize.define('gastos', {
  id_gasto: {
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
  id_usuario_creador: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  id_usuario_pagador: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  descripcion: {
    type: DataTypes.STRING,
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
  categoria: {
    type: DataTypes.ENUM('comida', 'transporte', 'alojamiento', 'entradas', 'otros'),
    allowNull: false
  },
  tipo_gasto: {
    type: DataTypes.ENUM('personal', 'grupal', 'subgrupo_privado', 'actividad_compartida'),
    allowNull: false
  },
  tipo_division: {
    type: DataTypes.ENUM('todos_miembros', 'miembros_especificos', 'subgrupos', 'individual'),
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  timestamp_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  miembros_asignados: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of {id_miembro_viaje, monto_corresponde}'
  },
  id_gasto_padre: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'gastos',
      key: 'id_gasto'
    }
  },
  observacion_diferencia: {
    type: DataTypes.STRING,
    allowNull: true
  },
  url_comprobante: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado_gasto: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'parcialmente_pagado', 'cancelado'),
    defaultValue: 'pendiente'
  },
  id_alojamiento_referencia: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'alojamientos',
      key: 'id_alojamiento'
    }
  },
  id_actividad_referencia: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'actividades',
      key: 'id_actividad'
    }
  }
}, {
  tableName: 'gastos',
  timestamps: false,
  indexes: [
    {
      fields: ['id_viaje', 'estado_gasto']
    },
    {
      fields: ['id_usuario_pagador', 'estado_gasto']
    },
    {
      fields: ['id_gasto_padre']
    },
    {
      fields: ['fecha']
    }
  ]
});

module.exports = Gasto;
