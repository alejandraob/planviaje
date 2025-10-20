/**
 * Create Test User Script
 * Creates a test user directly in the database for development testing
 */

const { Usuario } = require('../models');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

async function createTestUser() {
  try {
    logger.info('🔄 Creating test user...');

    // Test connection first
    await sequelize.authenticate();
    logger.info('✅ Database connection established');

    // Check if user already exists
    const existingUser = await Usuario.findOne({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      logger.info('ℹ️  Test user already exists');
      logger.info('User details:');
      logger.info(`   ID: ${existingUser.id_usuario}`);
      logger.info(`   Email: ${existingUser.email}`);
      logger.info(`   Nombre: ${existingUser.nombre} ${existingUser.apellido}`);
      logger.info(`   Teléfono: ${existingUser.telefono}`);
      process.exit(0);
    }

    // Create test user
    const usuario = await Usuario.create({
      email: 'test@example.com',
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '+541112345678',
      estado: 'activo'
    });

    logger.info('✅ Test user created successfully!');
    logger.info('User details:');
    logger.info(`   ID: ${usuario.id_usuario}`);
    logger.info(`   Email: ${usuario.email}`);
    logger.info(`   Nombre: ${usuario.nombre} ${usuario.apellido}`);
    logger.info(`   Teléfono: ${usuario.telefono}`);
    logger.info('');
    logger.info('💡 You can now use this email to login with /auth/dev-login');
    logger.info('');
    logger.info('Example:');
    logger.info('POST http://localhost:3001/api/auth/dev-login');
    logger.info(JSON.stringify({
      email: 'test@example.com',
      password: 'any'
    }, null, 2));

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

// Run
createTestUser();
