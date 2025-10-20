/**
 * Deuda Model
 * Represents debts between users in the main group
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Deuda = sequelize.define('deudas', {
  id_deuda: {
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
  id_acreedor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    },
    comment: 'User who should receive money'
  },
  id_deudor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    },
    comment: 'User who owes money'
  },
  id_gasto: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'gastos',
      key: 'id_gasto'
    }
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
  estado_deuda: {
    type: DataTypes.ENUM('pendiente', 'pagada', 'cancelada', 'pausada'),
    defaultValue: 'pendiente'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_vencimiento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_pago: {
    type: DataTypes.DATE,
    allowNull: true
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'deudas',
  timestamps: false,
  indexes: [
    {
      fields: ['id_viaje', 'estado_deuda']
    },
    {
      fields: ['id_acreedor', 'estado_deuda']
    },
    {
      fields: ['id_deudor', 'estado_deuda']
    },
    {
      unique: true,
      fields: ['id_viaje', 'id_acreedor', 'id_deudor', 'id_gasto']
    }
  ],
  validate: {
    acreedorNotDeudor() {
      if (this.id_acreedor === this.id_deudor) {
        throw new Error('id_acreedor cannot be the same as id_deudor');
      }
    },
    montoPositivo() {
      if (this.monto_ars <= 0) {
        throw new Error('monto_ars must be greater than 0');
      }
    }
  }
});

module.exports = Deuda;
