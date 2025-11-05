// lib/auth.js
const { verifyIdToken } = require('./firebaseAdmin');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Middleware to verify Firebase ID token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
async function authenticateFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify Firebase token
    const decodedToken = await verifyIdToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: { role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Middleware to check if user has required permissions
 * @param {string[]} requiredPermissions - Array of required permissions
 */
function requirePermissions(requiredPermissions) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userPermissions = req.user.role.permissions || [];
    const hasPermission = requiredPermissions.every(perm => userPermissions.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

/**
 * Create or update user from Firebase token
 * @param {Object} tokenPayload - Decoded Firebase token
 * @returns {Object} User object
 */
async function createOrUpdateUserFromFirebase(tokenPayload) {
  const { email, name, uid: firebaseUid } = tokenPayload;

  if (!email) {
    throw new Error('Email is required from Firebase token');
  }

  // Get default student role
  const studentRole = await prisma.role.findUnique({
    where: { name: 'student' }
  });

  if (!studentRole) {
    throw new Error('Default student role not found');
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: name || null,
      firebaseUid,
      updatedAt: new Date()
    },
    create: {
      email,
      name: name || null,
      firebaseUid,
      roleId: studentRole.id,
      provider: 'firebase'
    },
    include: { role: true }
  });

  return user;
}

module.exports = {
  authenticateFirebaseToken,
  requirePermissions,
  createOrUpdateUserFromFirebase,
  verifyIdToken
};
