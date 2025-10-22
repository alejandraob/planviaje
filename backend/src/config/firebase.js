const admin = require('firebase-admin');
const env = require('./environment');
const logger = require('../utils/logger');

let firebaseApp = null;

const initializeFirebase = () => {
  try {
    if (firebaseApp) {
      return firebaseApp;
    }

    // Verificar que las credenciales existen
    if (!env.firebase.projectId || !env.firebase.privateKey || !env.firebase.clientEmail) {
      logger.warn('Firebase credentials not configured. Firebase features will be disabled.');
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        privateKey: env.firebase.privateKey,
        clientEmail: env.firebase.clientEmail
      })
    });

    logger.info('Ô£à Firebase initialized successfully');
    return firebaseApp;
  } catch (error) {
    logger.error('ÔØî Error initializing Firebase:', error);
    return null;
  }
};

const getFirebaseAuth = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp ? admin.auth() : null;
};

const verifyFirebaseToken = async (token) => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    logger.error('Error verifying Firebase token:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  getFirebaseAuth,
  verifyFirebaseToken
};
