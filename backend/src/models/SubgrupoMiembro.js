/**
 * SubgrupoMiembro Model
 * Junction table between Subgrupos and MiembrosViaje
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SubgrupoMiembro = sequelize.define('subgrupo_miembros', {
  id_subgrupo_miembro: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_subgrupo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subgrupos',
      key: 'id_subgrupo'
    }
  },
  id_miembro_viaje: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'miembros_viaje',
      key: 'id_miembro_viaje'
    }
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'subgrupo_miembros',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_subgrupo', 'id_miembro_viaje']
    }
  ]
});

module.exports = SubgrupoMiembro;
