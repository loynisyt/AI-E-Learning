const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const app = express();

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

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

// Lesson endpoints
app.get('/api/lessons', async (req, res) => {
  const lessons = await prisma.lesson.findMany({
    include: { createdBy: { select: { name: true } } },
  });
  res.json(lessons);
});

app.post('/api/lessons', authenticateToken, async (req, res) => {
  const { title, description, videoUrl, exerciseTitle, exerciseDescription, links } = req.body;
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
});

app.put('/api/lessons/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, videoUrl, exerciseTitle, exerciseDescription, links } = req.body;
  const lesson = await prisma.lesson.findUnique({ where: { id: parseInt(id) } });
  if (!lesson || lesson.createdById !== req.user.id) return res.sendStatus(403);
  const updatedLesson = await prisma.lesson.update({
    where: { id: parseInt(id) },
    data: { title, description, videoUrl, exerciseTitle, exerciseDescription, links },
  });
  res.json(updatedLesson);
});

app.delete('/api/lessons/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const lesson = await prisma.lesson.findUnique({ where: { id: parseInt(id) } });
  if (!lesson || lesson.createdById !== req.user.id) return res.sendStatus(403);
  await prisma.lesson.delete({ where: { id: parseInt(id) } });
  res.sendStatus(204);
});

// AI Chat endpoint with OpenAI integration
app.post('/api/ai-chat', authenticateToken, async (req, res) => {
  const { message, mode = 'teacher', temperature = 0.7 } = req.body;
  try {
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
