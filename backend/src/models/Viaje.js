/**
 * Viaje Model
 * Represents trips in the system
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Viaje = sequelize.define('viajes', {
  id_viaje: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_admin_principal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  id_admin_secundario_actual: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('individual', 'amigos', 'familia'),
    allowNull: false
  },
  alcance: {
    type: DataTypes.ENUM('nacional', 'internacional'),
    allowNull: false
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isAfterStartDate(value) {
        if (value <= this.fecha_inicio) {
          throw new Error('fecha_fin must be after fecha_inicio');
        }
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('planificacion', 'en_curso', 'finalizado', 'cancelado'),
    defaultValue: 'planificacion'
  },
  max_miembros: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  max_subgrupos: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  max_franjas: {
    type: DataTypes.INTEGER,
    defaultValue: 999
  }
}, {
  tableName: 'viajes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_admin_principal', 'nombre']
    },
    {
      fields: ['estado', 'fecha_inicio']
    }
  ]
});

module.exports = Viaje;
