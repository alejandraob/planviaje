const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firebase_uid: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: true,
      comment: 'UID de Firebase Authentication'
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      validate: {
        is: /^\+?[0-9\s\-()]+$/
      }
    },
    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    es_menor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'True si es menor de 18 a├▒os'
    },
    id_responsable_legal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id_usuario'
      },
      comment: 'ID del usuario responsable legal (si es menor)'
    },
    metodo_autenticacion: {
      type: DataTypes.ENUM('email', 'google', 'facebook', 'telefono'),
      allowNull: false,
      defaultValue: 'email'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    ultima_conexion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    preferencias_notificaciones: {
      type: DataTypes.JSONB,
      defaultValue: {
        push: true,
        email: true,
        whatsapp: false
      }
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['email'] },
      { fields: ['telefono'] },
      { fields: ['firebase_uid'] }
    ]
  });

  User.associate = (models) => {
    // Usuario tiene muchos viajes (como creador)
    User.hasMany(models.Viaje, {
      foreignKey: 'id_usuario_creador',
      as: 'viajesCreados'
    });

    // Usuario es miembro de muchos viajes
    User.belongsToMany(models.Viaje, {
      through: models.MiembroViaje,
      foreignKey: 'id_usuario',
      otherKey: 'id_viaje',
      as: 'viajes'
    });

    // Usuario responsable legal de menores
    User.hasMany(User, {
      foreignKey: 'id_responsable_legal',
      as: 'menoresResponsable'
    });

    User.belongsTo(User, {
      foreignKey: 'id_responsable_legal',
      as: 'responsableLegal'
    });

    // Usuario tiene muchos gastos (como pagador)
    User.hasMany(models.Gasto, {
      foreignKey: 'id_usuario_pagador',
      as: 'gastosPagados'
    });

    // Usuario tiene muchas notificaciones
    User.hasMany(models.Notificacion, {
      foreignKey: 'id_usuario_destino',
      as: 'notificaciones'
    });
  };

  return User;
};
