// lib/firebaseAdmin.js
const admin = require('firebase-admin');

function loadServiceAccount() {
  // 1) If user provided full JSON string in env
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    // Try parse directly
    try { return JSON.parse(raw); }
    catch (e) {
      // Try replacing escaped newlines (common when storing in env)
      try { return JSON.parse(raw.replace(/\\n/g, '\n')); }
      catch (err) {
        // If it looks like base64, try decode as base64
        try {
          const decoded = Buffer.from(raw, 'base64').toString('utf8');
          return JSON.parse(decoded);
        } catch (err2) {
          throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON: not valid JSON or base64 JSON');
        }
      }
    }
  }

  // 2) If user provided base64 explicitly
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (e) {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_BASE64: not valid base64 JSON');
    }
  }

  // 3) Individual env vars fallback
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return {
      project_id: FIREBASE_PROJECT_ID,
      client_email: FIREBASE_CLIENT_EMAIL,
      private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  throw new Error('Firebase service account configuration missing. Set FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_SERVICE_ACCOUNT_JSON or individual FIREBASE_* vars.');
}

const serviceAccount = loadServiceAccount();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin initialized');
}

const verifyIdToken = async (idToken) => {
  if (!idToken) throw new Error('Missing ID token');
  return admin.auth().verifyIdToken(idToken);
};

module.exports = {
  admin,
  verifyIdToken
};
