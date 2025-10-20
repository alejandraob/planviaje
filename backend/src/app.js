/**
 * Express Application Configuration
 * Main app setup with middleware and routes
 */

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const corsMiddleware = require('./middleware/cors');
const { generalLimiter } = require('./middleware/rateLimit');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');
const config = require('./config/environment');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(corsMiddleware);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logger
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Rate limiting
app.use('/api/', generalLimiter);

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Plan Viaje API',
    version: '1.0.0',
    environment: config.nodeEnv,
    documentation: '/api/docs'
  });
});

// Handle 404 errors
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
