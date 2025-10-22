const { sequelize } = require('../models');
const logger = require('./logger');

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Ô£à Conexi├│n a PostgreSQL establecida correctamente');
    return true;
  } catch (error) {
    logger.error('ÔØî No se pudo conectar a la base de datos:', error);
    return false;
  }
};

const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    if (force) {
      logger.warn('ÔÜá´©Å  Base de datos sincronizada (FORCE MODE - tablas recreadas)');
    } else {
      logger.info('Ô£à Base de datos sincronizada correctamente');
    }
    return true;
  } catch (error) {
    logger.error('ÔØî Error sincronizando base de datos:', error);
    return false;
  }
};

const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('Ô£à Conexi├│n a base de datos cerrada');
  } catch (error) {
    logger.error('ÔØî Error cerrando conexi├│n:', error);
  }
};

module.exports = {
  testConnection,
  syncDatabase,
  closeConnection
};
