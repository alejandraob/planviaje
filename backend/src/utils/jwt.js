const jwt = require('jsonwebtoken');
const env = require('../config/environment');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, env.jwt.secret, {
    expiresIn: env.jwt.accessExpiration
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, env.jwt.secret, {
    expiresIn: env.jwt.refreshExpiration
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch (error) {
    throw new Error('Token inv├ílido o expirado');
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};
