import { NextResponse } from 'next/server';
import { verifyPassword, createSession } from '@/lib/auth';
import { getContent } from '@/lib/directus';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find user by email in Directus
    const users = await getContent('users', { filter: { email: { _eq: email } } });
    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    const user = users[0];

    // Verify password
    const isPasswordCorrect = await verifyPassword(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session for the user
    const session = await createSession(user.id);

    // Return session token and user info (exclude password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ success: true, session: session.token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
