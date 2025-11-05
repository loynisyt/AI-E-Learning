// lib/firebaseClient.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';

const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (typeof window !== 'undefined' && !getApps().length) {
  initializeApp(clientConfig);
}

export const getAuthInstance = () => {
  if (typeof window === 'undefined') throw new Error('Firebase auth not available on server');
  if (!getApps().length) initializeApp(clientConfig);
  return getAuth();
};

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

export async function signInWithGooglePopup() {
  try {
    const auth = getAuthInstance();
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

export async function signInWithFacebookPopup() {
  try {
    const auth = getAuthInstance();
    const result = await signInWithPopup(auth, facebookProvider);
    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (error) {
    console.error('Facebook sign-in error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const auth = getAuthInstance();
    await auth.signOut();
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}
