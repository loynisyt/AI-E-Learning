const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const https = require('https');
const {
  authenticateSession,
  authenticateFirebaseToken,
  requirePermissions,
  createOrUpdateUserFromFirebase,
  verifyIdToken,
  registerUser,
  loginUser,
  verifyEmailToken,
  connectOAuthProvider,
  disconnectOAuthProvider,
  revokeSession,
  createSession
} = require('./lib/auth');
const { authenticateDirectus, getContent, createContent, updateContent, deleteContent } = require('./lib/directus');
const stripeRoutes = require('./app/api/stripe/route');

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const app = express();

// CORS Configuration - Allow frontend to reach backend
const allowedOrigins = [
  'https://127.0.0.1:443',
  'https://127.0.0.1:3000',
  'https://127.0.0.1',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://localhost:3000',
  process.env.FRONTEND_URL || 'https://127.0.0.1:443'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Mount Stripe routes
app.use('/api/stripe', stripeRoutes);

// Initialize Directus authentication on startup
authenticateDirectus();

// ============ NEW SESSION-BASED AUTH ENDPOINTS ============

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }

    const result = await registerUser(email, name, password);

    // Set session cookie
    res.cookie('sessionToken', result.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      user: result.user,
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await loginUser(email, password);

    // Set session cookie
    res.cookie('sessionToken', result.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      user: result.user,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message || 'Login failed' });
  }
});

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ error: 'Token and email are required' });
    }

    const user = await verifyEmailToken(token, email);

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified
      },
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

/**
 * GET /api/auth/session
 * Get current authenticated user from session
 */
app.get('/api/auth/session', authenticateSession, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        emailVerified: req.user.emailVerified,
        subscription: req.user.subscription,
        googleId: req.user.googleId || null,
        facebookId: req.user.facebookId || null
      }
    });
  } catch (error) {
    console.error('Session fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

/**
 * POST /api/auth/logout
 * Logout user and revoke session
 */
app.post('/api/auth/logout', authenticateSession, async (req, res) => {
  try {
    await revokeSession(req.sessionToken);

    res.clearCookie('sessionToken');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * POST /api/auth/connect-provider
 * Connect OAuth provider to existing user account
 */
app.post('/api/auth/connect-provider', authenticateSession, async (req, res) => {
  try {
    const { provider, providerId, providerEmail } = req.body;

    if (!provider || !providerId || !providerEmail) {
      return res.status(400).json({ error: 'Provider, providerId, and providerEmail are required' });
    }

    const updatedUser = await connectOAuthProvider(
      req.user.id,
      provider.toLowerCase(),
      providerId,
      providerEmail
    );

    res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        googleId: updatedUser.googleId || null,
        facebookId: updatedUser.facebookId || null
      },
      message: `${provider} account connected successfully`
    });
  } catch (error) {
    console.error('Provider connection error:', error);
    res.status(400).json({ error: error.message || 'Failed to connect provider' });
  }
});

/**
 * POST /api/auth/disconnect-provider
 * Disconnect OAuth provider from user account
 */
app.post('/api/auth/disconnect-provider', authenticateSession, async (req, res) => {
  try {
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    const updatedUser = await disconnectOAuthProvider(req.user.id, provider.toLowerCase());

    res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        googleId: updatedUser.googleId || null,
        facebookId: updatedUser.facebookId || null
      },
      message: `${provider} account disconnected successfully`
    });
  } catch (error) {
    console.error('Provider disconnection error:', error);
    res.status(400).json({ error: error.message || 'Failed to disconnect provider' });
  }
});

// ============ LEGACY AUTH ENDPOINTS (Backward compatibility) ============

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (user && user.password && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your_jwt_secret_here', { expiresIn: '1h' });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        provider: 'credentials',
      },
    });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your_jwt_secret_here', { expiresIn: '1h' });
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'User already exists' });
  }
});

app.post('/api/auth/create-oauth-user', async (req, res) => {
  const { email, name, provider } = req.body;
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        provider,
        password: null, // OAuth users have no password
      },
    });
    res.status(201).json({ user });
  } else {
    res.status(200).json({ user: existingUser });
  }
});

app.post('/api/auth/session', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify Firebase ID token
    const decodedToken = await verifyIdToken(idToken);

    // Create or update user in database
    const user = await createOrUpdateUserFromFirebase(decodedToken);

    // Generate JWT token for session
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your_jwt_secret_here', { expiresIn: '7d' });

    // Set HTTP-only cookie
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// ============ LESSON ENDPOINTS ============

app.get('/api/lessons', async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: { createdBy: { select: { name: true } } },
    });
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

app.post('/api/lessons', authenticateFirebaseToken, requirePermissions(['write']), async (req, res) => {
  try {
    const { title, description, videoUrl, exerciseTitle, exerciseDescription, links } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        videoUrl,
        exerciseTitle,
        exerciseDescription,
        links,
        createdById: req.user.id,
      },
    });
    res.status(201).json(lesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

app.put('/api/lessons/:id', authenticateFirebaseToken, requirePermissions(['write']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, exerciseTitle, exerciseDescription, links } = req.body;

    const lesson = await prisma.lesson.findUnique({ where: { id: parseInt(id) } });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    // Check if user can edit (owner or admin)
    if (lesson.createdById !== req.user.id && !req.user.role.permissions.includes('manage_content')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: parseInt(id) },
      data: { title, description, videoUrl, exerciseTitle, exerciseDescription, links },
    });
    res.json(updatedLesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

app.delete('/api/lessons/:id', authenticateFirebaseToken, requirePermissions(['delete']), async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({ where: { id: parseInt(id) } });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    // Check if user can delete (owner or admin)
    if (lesson.createdById !== req.user.id && !req.user.role.permissions.includes('manage_content')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.lesson.delete({ where: { id: parseInt(id) } });
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// ============ DIRECTUS CMS ENDPOINTS ============

app.get('/api/content/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const query = req.query;
    const content = await getContent(collection, query);
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

app.post('/api/content/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const data = req.body;
    const content = await createContent(collection, data);
    res.status(201).json(content);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

app.put('/api/content/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const data = req.body;
    const content = await updateContent(collection, id, data);
    res.json(content);
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

app.delete('/api/content/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    await deleteContent(collection, id);
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// ============ AI CHAT ENDPOINT ============

app.post('/api/ai-chat', authenticateFirebaseToken, requirePermissions(['read']), async (req, res) => {
  try {
    const { message, mode = 'teacher', temperature = 0.7 } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = mode === 'teacher'
      ? 'You are a helpful AI teacher specializing in teaching AI tools and prompting techniques. Provide educational, structured responses.'
      : 'You are a friendly AI companion specializing in AI tools and prompting. Be conversational and supportive.';

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: temperature,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;
    res.json({ response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

const PORT = process.env.PORT || 4000;

// Check if running in HTTPS mode (development with certificates)
const certsDir = path.join(__dirname, '..', 'certs');
const certPath = path.join(certsDir, 'localhost-cert.pem');
const keyPath = path.join(certsDir, 'localhost-key.pem');
const useHttps = fs.existsSync(certPath) && fs.existsSync(keyPath);

if (useHttps) {
  try {
    const certificate = fs.readFileSync(certPath, 'utf8');
    const key = fs.readFileSync(keyPath, 'utf8');
    const httpsServer = https.createServer({ cert: certificate, key }, app);
    httpsServer.listen(PORT, '127.0.0.1', () => {
      console.log(`🔒 Backend HTTPS server running on https://127.0.0.1:${PORT}`);
      console.log(`✅ CORS enabled for: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ HTTPS setup failed:', error.message);
    console.log('🔄 Falling back to HTTP...');
    app.listen(PORT, () => {
      console.log(`Backend HTTP server running on http://localhost:${PORT}`);
    });
  }
} else {
  app.listen(PORT, () => {
    console.log(`Backend HTTP server running on http://localhost:${PORT}`);
    console.log(`📝 Note: HTTPS certificates not found. To enable HTTPS, create ${certPath} and ${keyPath}`);
  });
}
