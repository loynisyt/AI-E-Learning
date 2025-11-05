// lib/firebaseAdmin.js
import admin from 'firebase-admin';

function parseJsonString(value) {
  if (!value) return null;
  try { return JSON.parse(value); }
  catch (err) {
    try { return JSON.parse(value.replace(/\\n/g, '\n')); }
    catch (e) { throw new Error('Invalid JSON in Firebase service account env var'); }
  }
}

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return parseJsonString(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (err) { throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_BASE64'); }
  }
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return { project_id: FIREBASE_PROJECT_ID, client_email: FIREBASE_CLIENT_EMAIL, private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') };
  }
  throw new Error('Firebase service account config missing');
}

let serviceAccount;
try { serviceAccount = loadServiceAccount(); }
catch (err) { console.error('Failed to load Firebase service account:', err.message); throw err; }

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log('Firebase Admin initialized');
}

export const firebaseAdmin = admin;
export async function verifyIdToken(idToken) {
  if (!idToken) throw new Error('Missing ID token');
  return firebaseAdmin.auth().verifyIdToken(idToken);
}
