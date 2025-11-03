// backend/app/api/auth/session/route.js
const { verifyIdToken } = require('../../../lib/firebaseAdmin');
const { createOrUpdateUserFromFirebase } = require('../../../lib/auth');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return Response.json({ error: 'ID token is required' }, { status: 400 });
    }

    // Verify Firebase token
    const tokenPayload = await verifyIdToken(idToken);

    // Create or update user from Firebase token
    const user = await createOrUpdateUserFromFirebase(tokenPayload);

    // Create a session JWT
    const sessionToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        role: user.role.name
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production',
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    const response = Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        role: user.role.name
      },
      success: true
    });

    response.headers.set('Set-Cookie',
      `session=${sessionToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );

    return response;

  } catch (error) {
    console.error('Session creation error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

// Optional: GET endpoint to verify current session
export async function GET(request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return Response.json({ error: 'No session cookie' }, { status: 401 });
    }

    const sessionCookie = cookieHeader.split(';').find(c => c.trim().startsWith('session='));
    if (!sessionCookie) {
      return Response.json({ error: 'No session cookie' }, { status: 401 });
    }

    const sessionToken = sessionCookie.split('=')[1];

    // Verify JWT
    const decoded = jwt.verify(sessionToken, process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production');

    // Fetch user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, provider: true }
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 401 });
    }

    return Response.json({ user });

  } catch (error) {
    console.error('Session verification error:', error);
    return Response.json({ error: 'Invalid session' }, { status: 401 });
  } finally {
    await prisma.$disconnect();
  }
}
