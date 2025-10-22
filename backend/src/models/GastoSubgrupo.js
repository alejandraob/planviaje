const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GastoSubgrupo = sequelize.define('GastoSubgrupo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_gasto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'gastos',
        key: 'id_gasto'
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
    monto_asignado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Monto que corresponde pagar a este subgrupo'
    }
  }, {
    tableName: 'gastos_subgrupo',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['id_gasto'] },
      { fields: ['id_subgrupo'] }
    ]
  });

  GastoSubgrupo.associate = (models) => {
    // Asociaci├│n ya definida en Gasto y Subgrupo
  };

  return GastoSubgrupo;
};
