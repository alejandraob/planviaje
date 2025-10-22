const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeudaSubgrupo = sequelize.define('DeudaSubgrupo', {
    id_deuda_subgrupo: {
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
    id_gasto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'gastos',
        key: 'id_gasto'
      }
    },
    id_subgrupo_acreedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subgrupos',
        key: 'id_subgrupo'
      },
      comment: 'Subgrupo que pag├│'
    },
    id_miembro_deudor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'miembros_viaje',
        key: 'id_miembro'
      },
      comment: 'Miembro individual que debe dentro del subgrupo'
    },
    monto_ars: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    monto_clp: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    monto_usd: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    estado_deuda: {
      type: DataTypes.ENUM('pendiente', 'pagado', 'confirmado'),
      allowNull: false,
      defaultValue: 'pendiente'
    }
  }, {
    tableName: 'deudas_subgrupo',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['id_viaje'] },
      { fields: ['id_gasto'] },
      { fields: ['id_subgrupo_acreedor'] },
      { fields: ['id_miembro_deudor'] },
      { fields: ['estado_deuda'] }
    ]
  });

  DeudaSubgrupo.associate = (models) => {
    // Deuda subgrupo pertenece a un viaje
    DeudaSubgrupo.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje',
      as: 'viaje'
    });

    // Deuda subgrupo pertenece a un gasto
    DeudaSubgrupo.belongsTo(models.Gasto, {
      foreignKey: 'id_gasto',
      as: 'gasto'
    });

    // Deuda subgrupo tiene subgrupo acreedor
    DeudaSubgrupo.belongsTo(models.Subgrupo, {
      foreignKey: 'id_subgrupo_acreedor',
      as: 'subgrupoAcreedor'
    });

    // Deuda subgrupo tiene miembro deudor
    DeudaSubgrupo.belongsTo(models.MiembroViaje, {
      foreignKey: 'id_miembro_deudor',
      as: 'miembroDeudor'
    });
  };

  return DeudaSubgrupo;
};
