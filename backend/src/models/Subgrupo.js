const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Subgrupo = sequelize.define('Subgrupo', {
    id_subgrupo: {
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
    nombre_subgrupo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Ej: Familia Ruiz, Familia Pati├▒o, Amigos del trabajo'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color_identificacion: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#3B82F6',
      comment: 'Color hex para identificar visualmente el subgrupo'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'subgrupos',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['id_viaje'] }
    ]
  });

  Subgrupo.associate = (models) => {
    // Subgrupo pertenece a un viaje
    Subgrupo.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje',
      as: 'viaje'
    });

    // Subgrupo tiene muchos miembros
    Subgrupo.belongsToMany(models.MiembroViaje, {
      through: models.SubgrupoMiembro,
      foreignKey: 'id_subgrupo',
      otherKey: 'id_miembro',
      as: 'miembros'
    });

    // Subgrupo tiene muchos gastos
    Subgrupo.hasMany(models.GastoSubgrupo, {
      foreignKey: 'id_subgrupo',
      as: 'gastos'
    });
  };

  return Subgrupo;
};
