/**
 * Franja Model
 * Represents time periods at different locations during a trip
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Franja = sequelize.define('franjas', {
  id_franja: {
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
  id_cronograma: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cronograma',
      key: 'id_cronograma'
    }
  },
  nombre_lugar: {
    type: DataTypes.STRING,
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
  orden_secuencia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estado_franja: {
    type: DataTypes.ENUM('programada', 'en_curso', 'completada', 'cancelada'),
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
  tableName: 'franjas',
  timestamps: false,
  indexes: [
    {
      fields: ['id_viaje', 'orden_secuencia']
    },
    {
      fields: ['fecha_inicio', 'fecha_fin']
    }
  ]
});

module.exports = Franja;
