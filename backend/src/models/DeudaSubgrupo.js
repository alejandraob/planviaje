/**
 * DeudaSubgrupo Model
 * Represents internal debts within a subgroup
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DeudaSubgrupo = sequelize.define('deudas_subgrupo', {
  id_deuda_subgrupo: {
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
  id_acreedor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  id_deudor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  id_gasto_subgrupo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'gastos_subgrupo',
      key: 'id_gasto_subgrupo'
    }
  },
  monto_ars: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  estado_deuda: {
    type: DataTypes.ENUM('pendiente', 'pagada', 'cancelada'),
    defaultValue: 'pendiente'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_pago: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'deudas_subgrupo',
  timestamps: false,
  indexes: [
    {
      fields: ['id_subgrupo', 'estado_deuda']
    },
    {
      unique: true,
      fields: ['id_subgrupo', 'id_acreedor', 'id_deudor', 'id_gasto_subgrupo']
    }
  ],
  validate: {
    acreedorNotDeudor() {
      if (this.id_acreedor === this.id_deudor) {
        throw new Error('id_acreedor cannot be the same as id_deudor');
      }
    }
  }
});

module.exports = DeudaSubgrupo;
