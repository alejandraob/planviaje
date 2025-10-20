/**
 * Database Reset Script
 * DROPS all tables and recreates them
 * WARNING: This will DELETE ALL DATA! Use only in development!
 */

const { sequelize } = require('../config/database');
const models = require('../models');
const logger = require('../utils/logger');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetDatabase() {
  try {
    logger.info('⚠️  DATABASE RESET SCRIPT ⚠️');
    logger.info('This will DROP all tables and recreate them.');
    logger.info('ALL DATA WILL BE LOST!');
    logger.info('');

    // Check if in production
    if (process.env.NODE_ENV === 'production') {
      logger.error('❌ Cannot run this script in production!');
      process.exit(1);
    }

    // Test connection first
    await sequelize.authenticate();
    logger.info('✅ Database connection established');

    // Force sync (drops and recreates all tables)
    logger.info('🔄 Dropping and recreating all tables...');
    await sequelize.sync({ force: true });

    logger.info('✅ All tables reset successfully!');
    logger.info('📊 Tables created:');

    // List all models
    Object.keys(models).forEach(modelName => {
      if (modelName !== 'sequelize' && modelName !== 'Sequelize') {
        logger.info(`   - ${models[modelName].tableName}`);
      }
    });

    logger.info('');
    logger.info('✅ Database reset complete!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

// Run reset
logger.info('Starting in 2 seconds...');
setTimeout(() => {
  resetDatabase();
}, 2000);
