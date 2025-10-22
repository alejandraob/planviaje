const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Franja = sequelize.define('Franja', {
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
    nombre_lugar: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Ej: Villa Traful, Bariloche, Buenos Aires'
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isAfterStart(value) {
          if (value < this.fecha_inicio) {
            throw new Error('Fecha fin debe ser posterior o igual a fecha inicio');
          }
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Orden de la franja en el cronograma'
    },
    estado: {
      type: DataTypes.ENUM('programada', 'en_curso', 'completada', 'cancelada'),
      allowNull: false,
      defaultValue: 'programada'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'franjas',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['id_viaje'] },
      { fields: ['fecha_inicio', 'fecha_fin'] },
      { fields: ['orden'] }
    ]
  });

  Franja.associate = (models) => {
    // Franja pertenece a un viaje
    Franja.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje',
      as: 'viaje'
    });

    // Franja tiene muchos alojamientos
    Franja.hasMany(models.Alojamiento, {
      foreignKey: 'id_franja',
      as: 'alojamientos'
    });

    // Franja tiene muchas actividades
    Franja.hasMany(models.Actividad, {
      foreignKey: 'id_franja',
      as: 'actividades'
    });
  };

  return Franja;
};
