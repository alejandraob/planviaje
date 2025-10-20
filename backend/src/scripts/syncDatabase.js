/**
 * Database Sync Script
 * Creates all tables based on Sequelize models
 * WARNING: Use only in development!
 */

const { sequelize } = require('../config/database');
const models = require('../models');
const logger = require('../utils/logger');

async function syncDatabase() {
  try {
    logger.info('🔄 Starting database synchronization...');

    // Test connection first
    await sequelize.authenticate();
    logger.info('✅ Database connection established');

    // Sync all models (creates tables if they don't exist)
    // force: false means it won't drop existing tables
    // alter: true means it will modify tables to match models
    await sequelize.sync({ alter: true });

    logger.info('✅ All tables synchronized successfully!');
    logger.info('📊 Tables created/updated:');

    // List all models
    Object.keys(models).forEach(modelName => {
      if (modelName !== 'sequelize' && modelName !== 'Sequelize') {
        logger.info(`   - ${models[modelName].tableName}`);
      }
    });

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error synchronizing database:', error);
    process.exit(1);
  }
}

// Run sync
syncDatabase();
