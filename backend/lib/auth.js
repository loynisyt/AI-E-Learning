// lib/auth.js
const { verifyIdToken } = require('./firebaseAdmin');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

// Configure Nodemailer for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'your-email@gmail.com',
    pass: process.env.GMAIL_PASSWORD || 'your-app-password'
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const SESSION_EXPIRY_DAYS = 7;


/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a password against its hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Create a JWT session token
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
function createSessionToken(userId) {
  return jwt.sign(
    { userId, type: 'session' },
    JWT_SECRET,
    { expiresIn: `${SESSION_EXPIRY_DAYS}d` }
  );
}

/**
 * Verify and decode a JWT session token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token or null if invalid
 */
function verifySessionToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Create and save a session to the database
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Session object with token
 */
async function createSession(userId) {
  const token = createSessionToken(userId);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt
    }
  });

  return session;
}

/**
 * Retrieve and validate a session from the database
 * @param {string} token - Session token
 * @returns {Promise<Object|null>} Session object or null if invalid/expired
 */
async function getSession(token) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!session) {
    return null;
  }

  // Check if session has expired
  if (new Date() > session.expiresAt) {
    // Delete expired session
    await prisma.session.delete({
      where: { token }
    });
    return null;
  }

  return session;
}

/**
 * Revoke a session (logout)
 * @param {string} token - Session token
 * @returns {Promise<void>}
 */
async function revokeSession(token) {
  await prisma.session.delete({
    where: { token }
  }).catch(() => {
    // Session might already be deleted, ignore error
  });
}

/**
 * Generate a random email verification token
 * @returns {string} Random token
 */
function generateEmailToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash an email verification token for database storage
 * @param {string} token - Token to hash
 * @returns {string} Hashed token
 */
function hashEmailToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Send email verification token via Gmail
 * @param {string} email - Recipient email
 * @param {string} userName - User name for personalization
 * @param {string} token - Verification token
 * @returns {Promise<void>}
 */
async function sendEmailVerificationToken(email, userName, token) {
  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: process.env.GMAIL_USER || 'noreply@ai-elearning.com',
    to: email,
    subject: 'Verify Your Email - AI E-Learning Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to AI E-Learning!</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
        <p>
          <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p>Or enter this verification code if prompted:</p>
        <p style="font-family: monospace; font-size: 18px; letter-spacing: 2px; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
          ${token.substring(0, 8).toUpperCase()}
        </p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create this account, you can ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">AI E-Learning Platform © 2024</p>
      </div>
    `
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email send error:', error);
        reject(error);
      } else {
        console.log('Verification email sent:', info.response);
        resolve();
      }
    });
  });
}

/**
 * Verify an email token and activate user
 * @param {string} token - Email verification token
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null if token invalid
 */
async function verifyEmailToken(token, email) {
  const tokenHash = hashEmailToken(token);

  const emailToken = await prisma.emailVerificationToken.findFirst({
    where: {
      email,
      tokenHash
    }
  });

  if (!emailToken) {
    return null;
  }

  // Check if token has expired
  if (new Date() > emailToken.expiresAt) {
    // Delete expired token
    await prisma.emailVerificationToken.delete({
      where: { id: emailToken.id }
    });
    return null;
  }

  // Update user as verified and delete token
  const user = await prisma.user.update({
    where: { id: emailToken.userId },
    data: { emailVerified: true }
  });

  await prisma.emailVerificationToken.delete({
    where: { id: emailToken.id }
  });

  // Clean up other expired tokens for this user
  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId: user.id,
      expiresAt: { lt: new Date() }
    }
  });

  return user;
}

/**
 * Register a new user with email/password
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} Session object with token
 */
async function registerUser(email, name, password) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: passwordHash,
      emailVerified: false,
      provider: 'email'
    }
  });

  // Generate and send verification email
  const token = generateEmailToken();
  const tokenHash = hashEmailToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      email,
      tokenHash,
      expiresAt
    }
  });

  await sendEmailVerificationToken(email, name, token);

  // Create session
  const session = await createSession(user.id);

  return {
    session,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified
    }
  };
}

/**
 * Login user with email/password
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} Session object with token
 */
async function loginUser(email, password) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || !user.passwordHash) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Create session
  const session = await createSession(user.id);

  return {
    session,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified
    }
  };
}

/**
 * Connect an OAuth provider to a user account
 * @param {string} userId - User ID
 * @param {string} provider - OAuth provider ('google' or 'facebook')
 * @param {string} providerId - Provider-specific user ID
 * @param {string} providerEmail - Email from provider
 * @returns {Promise<Object>} Updated user object
 */
async function connectOAuthProvider(userId, provider, providerId, providerEmail) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Validate email match if user has an email
  if (user.email && user.email !== providerEmail) {
    throw new Error(`Email mismatch: ${user.email} != ${providerEmail}. Please use the same email as your account.`);
  }

  // Check if this provider is already connected to another user
  const existingConnection = await prisma.user.findFirst({
    where: {
      [provider === 'google' ? 'googleId' : 'facebookId']: providerId,
      NOT: { id: userId }
    }
  });

  if (existingConnection) {
    throw new Error(`This ${provider} account is already connected to another user`);
  }

  // Connect provider to user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      [provider === 'google' ? 'googleId' : 'facebookId']: providerId,
      [provider === 'google' ? 'googleEmail' : 'facebookEmail']: providerEmail
    }
  });

  return updatedUser;
}

/**
 * Disconnect an OAuth provider from a user account
 * @param {string} userId - User ID
 * @param {string} provider - OAuth provider ('google' or 'facebook')
 * @returns {Promise<Object>} Updated user object
 */
async function disconnectOAuthProvider(userId, provider) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Don't allow disconnect if user has no password (can't login otherwise)
  if (!user.passwordHash && ((provider === 'google' && user.facebookId) || (provider === 'facebook' && user.googleId))) {
    // User has another provider, so allow disconnection
  } else if (!user.passwordHash) {
    throw new Error('Cannot disconnect your only login method. Please set a password first.');
  }

  // Disconnect provider
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      [provider === 'google' ? 'googleId' : 'facebookId']: null,
      [provider === 'google' ? 'googleEmail' : 'facebookEmail']: null
    }
  });

  return updatedUser;
}

/**
 * Middleware to verify session cookie and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
async function authenticateSession(req, res, next) {
  try {
    const token = req.cookies?.sessionToken;

    if (!token) {
      return res.status(401).json({ error: 'Session required' });
    }

    const session = await getSession(token);

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.user = session.user;
    req.sessionToken = token;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware to verify Firebase ID token (legacy, kept for compatibility)
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
  // Password hashing
  hashPassword,
  verifyPassword,
  
  // Session management
  createSessionToken,
  verifySessionToken,
  createSession,
  getSession,
  revokeSession,
  
  // Email verification
  generateEmailToken,
  hashEmailToken,
  sendEmailVerificationToken,
  verifyEmailToken,
  
  // User authentication
  registerUser,
  loginUser,
  
  // OAuth providers
  connectOAuthProvider,
  disconnectOAuthProvider,
  
  // Middleware
  authenticateSession,
  authenticateFirebaseToken,
  requirePermissions,
  
  // Firebase
  createOrUpdateUserFromFirebase,
  verifyIdToken
};
