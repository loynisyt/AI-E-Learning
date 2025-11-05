// app/api/auth/session/route.js
import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebaseAdmin';
import { signSession } from '@/lib/jwtServer';

export async function POST(request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });

    const decoded = await verifyIdToken(idToken);
    const sessionToken = signSession({ uid: decoded.uid, email: decoded.email });

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: 'session',
      value: sessionToken,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    console.error('session POST error', err);
    return NextResponse.json({ error: err.message || 'Invalid token' }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: 'session', value: '', path: '/', maxAge: 0 });
  return res;
}
      