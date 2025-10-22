const { Sequelize } = require('sequelize');
const env = require('../config/environment');

// Inicializar Sequelize
const sequelize = new Sequelize(
  env.database.name,
  env.database.user,
  env.database.password,
  {
    host: env.database.host,
    port: env.database.port,
    dialect: env.database.dialect,
    logging: env.database.logging,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Importar modelos
const models = {
  User: require('./User')(sequelize),
  Viaje: require('./Viaje')(sequelize),
  MiembroViaje: require('./MiembroViaje')(sequelize),
  Subgrupo: require('./Subgrupo')(sequelize),
  SubgrupoMiembro: require('./SubgrupoMiembro')(sequelize),
  Franja: require('./Franja')(sequelize),
  Alojamiento: require('./Alojamiento')(sequelize),
  Actividad: require('./Actividad')(sequelize),
  Gasto: require('./Gasto')(sequelize),
  GastoSubgrupo: require('./GastoSubgrupo')(sequelize),
  Deuda: require('./Deuda')(sequelize),
  DeudaSubgrupo: require('./DeudaSubgrupo')(sequelize),
  Pago: require('./Pago')(sequelize),
  Notificacion: require('./Notificacion')(sequelize),
  Auditoria: require('./Auditoria')(sequelize),
  TasaCambio: require('./TasaCambio')(sequelize),
  ConfiguracionViaje: require('./ConfiguracionViaje')(sequelize)
};

// Ejecutar asociaciones
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Agregar sequelize y Sequelize al objeto models
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
