const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SubgrupoMiembro = sequelize.define('SubgrupoMiembro', {
    id: {
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
    id_miembro: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'miembros_viaje',
        key: 'id_miembro'
      }
    }
  }, {
    tableName: 'subgrupo_miembros',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['id_subgrupo'] },
      { fields: ['id_miembro'] },
      {
        unique: true,
        fields: ['id_subgrupo', 'id_miembro'],
        name: 'unique_subgrupo_miembro'
      }
    ]
  });

  SubgrupoMiembro.associate = (models) => {
    // Asociaciones ya definidas en Subgrupo y MiembroViaje
  };

  return SubgrupoMiembro;
};
