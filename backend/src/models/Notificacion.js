const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notificacion = sequelize.define('Notificacion', {
    id_notificacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_viaje: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'viajes',
        key: 'id_viaje'
      },
      comment: 'Puede ser null si es notificaci├│n general'
    },
    id_usuario_destino: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_usuario'
      },
      comment: 'Usuario que recibe la notificaci├│n'
    },
    id_usuario_origen: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id_usuario'
      },
      comment: 'Usuario que gener├│ la acci├│n (puede ser null si es del sistema)'
    },
    tipo_notificacion: {
      type: DataTypes.ENUM(
        'nuevo_gasto',
        'pago_pendiente',
        'pago_confirmado',
        'invitacion_viaje',
        'cambio_cronograma',
        'miembro_retirado',
        'cambio_rol'
      ),
      allowNull: false
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    leida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    fecha_lectura: {
      type: DataTypes.DATE,
      allowNull: true
    },
    canal: {
      type: DataTypes.ENUM('push', 'email', 'whatsapp'),
      allowNull: false,
      defaultValue: 'push'
    },
    enviada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'True cuando se envi├│ exitosamente por el canal'
    },
    fecha_envio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    data_adicional: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Datos adicionales como ID de gasto, deuda, etc.'
    }
  }, {
    tableName: 'notificaciones',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['id_viaje'] },
      { fields: ['id_usuario_destino'] },
      { fields: ['id_usuario_origen'] },
      { fields: ['tipo_notificacion'] },
      { fields: ['leida'] },
      { fields: ['enviada'] }
    ]
  });

  Notificacion.associate = (models) => {
    // Notificaci├│n pertenece a un viaje (opcional)
    Notificacion.belongsTo(models.Viaje, {
      foreignKey: 'id_viaje',
      as: 'viaje'
    });

    // Notificaci├│n para un usuario
    Notificacion.belongsTo(models.User, {
      foreignKey: 'id_usuario_destino',
      as: 'usuarioDestino'
    });

    // Notificaci├│n originada por un usuario
    Notificacion.belongsTo(models.User, {
      foreignKey: 'id_usuario_origen',
      as: 'usuarioOrigen'
    });
  };

  return Notificacion;
};
