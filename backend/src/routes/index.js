/**
 * Routes Index
 * Central router that imports all route modules
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const viajesRoutes = require('./viajes.routes');
const notificacionesRoutes = require('./notificaciones.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/viajes', viajesRoutes);
router.use('/notificaciones', notificacionesRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
