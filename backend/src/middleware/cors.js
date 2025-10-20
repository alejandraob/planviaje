/**
 * CORS Middleware Configuration
 */

const cors = require('cors');
const config = require('../config/environment');

const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [config.frontendUrl, 'http://localhost:5173', 'http://localhost:3000'];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = cors(corsOptions);
