/**
 * Firebase Admin SDK Configuration
 */

const admin = require('firebase-admin');
const config = require('./environment');
const logger = require('../utils/logger');

// Initialize Firebase Admin with service account
const initializeFirebase = () => {
  try {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebase.projectId,
          privateKey: config.firebase.privateKey,
          clientEmail: config.firebase.clientEmail
        })
      });
      logger.info('✅ Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    logger.error('❌ Firebase Admin SDK initialization failed:', error);
    throw error;
  }
};

// Initialize Firebase
initializeFirebase();

/**
 * Verify Firebase ID Token
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<object>} Decoded token
 */
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    logger.error('Error verifying Firebase token:', error);
    throw new Error('Invalid Firebase token');
  }
};

/**
 * Create Firebase user
 * @param {object} userData - User data
 * @returns {Promise<object>} Created user
 */
const createFirebaseUser = async (userData) => {
  try {
    const userRecord = await admin.auth().createUser({
      email: userData.email,
      password: userData.password,
      displayName: `${userData.nombre} ${userData.apellido}`,
      phoneNumber: userData.telefono || undefined
    });
    logger.info(`Firebase user created: ${userRecord.uid}`);
    return userRecord;
  } catch (error) {
    logger.error('Error creating Firebase user:', error);
    throw error;
  }
};

/**
 * Get Firebase user by UID
 * @param {string} uid - Firebase UID
 * @returns {Promise<object>} User record
 */
const getFirebaseUser = async (uid) => {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    logger.error('Error getting Firebase user:', error);
    throw error;
  }
};

/**
 * Update Firebase user
 * @param {string} uid - Firebase UID
 * @param {object} updates - Updates to apply
 * @returns {Promise<object>} Updated user
 */
const updateFirebaseUser = async (uid, updates) => {
  try {
    const userRecord = await admin.auth().updateUser(uid, updates);
    logger.info(`Firebase user updated: ${uid}`);
    return userRecord;
  } catch (error) {
    logger.error('Error updating Firebase user:', error);
    throw error;
  }
};

/**
 * Delete Firebase user
 * @param {string} uid - Firebase UID
 * @returns {Promise<void>}
 */
const deleteFirebaseUser = async (uid) => {
  try {
    await admin.auth().deleteUser(uid);
    logger.info(`Firebase user deleted: ${uid}`);
  } catch (error) {
    logger.error('Error deleting Firebase user:', error);
    throw error;
  }
};

module.exports = {
  admin,
  verifyIdToken,
  createFirebaseUser,
  getFirebaseUser,
  updateFirebaseUser,
  deleteFirebaseUser
};
