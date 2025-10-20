/**
 * MiembroViaje Model
 * Represents trip members and their roles
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MiembroViaje = sequelize.define('miembros_viaje', {
  id_miembro_viaje: {
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
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  rol: {
    type: DataTypes.ENUM('admin_principal', 'admin_secundario', 'miembro'),
    allowNull: false
  },
  fecha_union: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  es_menor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  id_responsable_legal: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  presupuesto_maximo_diario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  estado_participacion: {
    type: DataTypes.ENUM('activo', 'pausado', 'retirado'),
    defaultValue: 'activo'
  },
  fecha_pausa_retiro: {
    type: DataTypes.DATE,
    allowNull: true
  },
  opcion_retiro_generoso: {
    type: DataTypes.ENUM('generoso', 'estricto'),
    allowNull: true
  }
}, {
  tableName: 'miembros_viaje',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_viaje', 'id_usuario']
    },
    {
      fields: ['id_viaje', 'estado_participacion']
    }
  ],
  validate: {
    menorRequiresResponsable() {
      if (this.es_menor && !this.id_responsable_legal) {
        throw new Error('Minors must have a legal guardian (id_responsable_legal)');
      }
    }
  }
});

module.exports = MiembroViaje;
