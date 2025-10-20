/**
 * GastoSubgrupo Model
 * Represents private expenses within a subgroup
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GastoSubgrupo = sequelize.define('gastos_subgrupo', {
  id_gasto_subgrupo: {
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
  id_subgrupo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subgrupos',
      key: 'id_subgrupo'
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
  categoria: {
    type: DataTypes.ENUM('comida', 'transporte', 'alojamiento', 'entradas', 'otros'),
    allowNull: false
  },
  tipo_division: {
    type: DataTypes.ENUM('todos_subgrupo', 'miembros_especificos'),
    allowNull: false
  },
  es_compartible_grupo_gral: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  miembros_subgrupo_asignados: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of {id_miembro_viaje, monto_corresponde}'
  },
  estado_gasto: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'parcialmente_pagado', 'cancelado'),
    defaultValue: 'pendiente'
  }
}, {
  tableName: 'gastos_subgrupo',
  timestamps: false,
  indexes: [
    {
      fields: ['id_subgrupo', 'estado_gasto']
    },
    {
      fields: ['id_usuario_pagador', 'estado_gasto']
    }
  ]
});

module.exports = GastoSubgrupo;
