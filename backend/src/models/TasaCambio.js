const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TasaCambio = sequelize.define('TasaCambio', {
    id_tasa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    moneda_base: {
      type: DataTypes.ENUM('ARS', 'CLP', 'USD'),
      allowNull: false,
      defaultValue: 'ARS'
    },
    moneda_destino: {
      type: DataTypes.ENUM('ARS', 'CLP', 'USD'),
      allowNull: false
    },
    tasa: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      comment: 'Tasa de conversi├│n (ej: 1 USD = 900 ARS)'
    },
    fecha_vigencia: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fuente: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'API de donde se obtuvo (ej: ExchangeRate-API) o "manual"'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'tasas_cambio',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
      { fields: ['moneda_base', 'moneda_destino'] },
      { fields: ['fecha_vigencia'] },
      { fields: ['activo'] }
    ]
  });

  TasaCambio.associate = (models) => {
    // Sin asociaciones directas con otras tablas
  };

  return TasaCambio;
};
