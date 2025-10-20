/**
 * Server Entry Point
 * Starts the Express server and connects to database
 */

const app = require('./src/app');
const { testConnection, closeConnection } = require('./src/config/database');
const logger = require('./src/utils/logger');
const config = require('./src/config/environment');

const PORT = config.port || 3001;

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Test database connection
    logger.info('🔍 Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      logger.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running in ${config.nodeEnv} mode`);
      logger.info(`📡 Server listening on port ${PORT}`);
      logger.info(`🌐 API URL: http://localhost:${PORT}/api`);
      logger.info(`🏠 Frontend URL: ${config.frontendUrl}`);
      logger.info('✅ Server started successfully');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('🔌 HTTP server closed');

        try {
          await closeConnection();
          logger.info('👋 Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('⚠️ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('💥 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
