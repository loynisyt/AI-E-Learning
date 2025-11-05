// lib/jwtServer.js
import jwt from 'jsonwebtoken';
const SECRET = process.env.NEXTAUTH_SECRET;
if (!SECRET) console.warn('NEXTAUTH_SECRET not set');

export function signSession(payload, expiresIn = '7d') {
  if (!SECRET) throw new Error('NEXTAUTH_SECRET not set');
  return jwt.sign(payload, SECRET, { expiresIn });
}
export function verifySession(token) {
  if (!SECRET) throw new Error('NEXTAUTH_SECRET not set');
  return jwt.verify(token, SECRET);
}
