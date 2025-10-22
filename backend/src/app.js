const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const env = require('./config/environment');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: env.app.frontendUrl,
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Plan Viaje API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: env.app.env
  });
});

// API Routes
app.use('/api/viajes', require('./routes/viajes.routes'));
app.use('/api/tasas-cambio', require('./routes/tasas-cambio.routes'));
app.use('/api/deudas', require('./routes/deudas.routes'));
// Rutas de gastos están anidadas en /api/viajes/:viajeId/gastos
// app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/usuarios', require('./routes/usuarios.routes'));
// ... more routes

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
