import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { getContent, createContent } from '@/lib/directus';

export async function POST(request) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUsers = await getContent('users', { filter: { email: { _eq: email } } });
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password for storage
    const hashedPassword = await hashPassword(password);

    // Create new user in Directus (no firebaseUid for normal email registration)
    const newUser = await createContent('users', {
      email,
      first_name: name,
      password: hashedPassword,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
