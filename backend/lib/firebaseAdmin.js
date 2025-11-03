// lib/firebaseAdmin.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  let serviceAccount;

  // Try to get service account from environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      // If it's base64 encoded, decode it
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON.includes('-----BEGIN PRIVATE KEY-----')) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      } else {
        // Assume it's base64 encoded JSON
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
      }
    } catch (error) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', error);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON format');
    }
  } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    // Use individual environment variables
    serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };
  } else {
    throw new Error('Firebase service account configuration missing. Please set FIREBASE_SERVICE_ACCOUNT_JSON or individual FIREBASE_* environment variables.');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const firebaseAdmin = admin;

/**
 * Verify Firebase ID token
 * @param {string} token - The Firebase ID token to verify
 * @returns {Promise<Object>} - The decoded token payload
 */
async function verifyIdToken(token) {
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw new Error('Invalid Firebase token');
  }
}

module.exports = {
  firebaseAdmin,
  verifyIdToken
};
