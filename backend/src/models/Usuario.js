/**
 * Usuario Model
 * Represents users in the system
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('usuarios', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cbu_argentina: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fecha_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_ultimo_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('activo', 'pausado', 'eliminado'),
    defaultValue: 'activo'
  },
  preferencias_privacidad: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      ver_cbu: 'admins',
      notificaciones: 'todos'
    }
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'fecha_registro',
  updatedAt: false
});

module.exports = Usuario;
