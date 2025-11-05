const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');
const { authenticateFirebaseToken, requirePermissions, createOrUpdateUserFromFirebase, verifyIdToken } = require('./lib/auth');
const { authenticateDirectus, getContent, createContent, updateContent, deleteContent } = require('./lib/directus');

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const app = express();

app.use(cors());
app.use(express.json());

// Initialize Directus authentication on startup
authenticateDirectus();

// Auth endpoints
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

// Lesson endpoints (Prisma-based)
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

// Directus CMS endpoints for educational content (proxy)
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

// AI Chat endpoint with OpenAI integration
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
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
