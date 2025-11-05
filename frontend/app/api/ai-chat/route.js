// app/api/ai-chat/route.js
import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebaseAdmin';
import { verifySession } from '@/lib/jwtServer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, mode = 'teacher', temperature = 0.7 } = body || {};
    if (!message || typeof message !== 'string') return NextResponse.json({ error: 'Missing message' }, { status: 400 });

    // auth: Bearer idToken OR cookie session
    const authHeader = request.headers.get('authorization') || '';
    const idTokenMatch = authHeader.match(/^Bearer (.*)$/);
    let user = null;

    if (idTokenMatch) {
      try { user = await verifyIdToken(idTokenMatch[1]); } catch (e) { user = null; }
    }

    if (!user) {
      const cookie = request.headers.get('cookie') || '';
      const sessionPair = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('session='));
      if (sessionPair) {
        const token = sessionPair.split('=')[1];
        try { const payload = verifySession(token); user = { uid: payload.uid, email: payload.email }; } catch (e) { user = null; }
      }
    }

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const systemPrompt = mode === 'friend'
      ? 'You are a friendly helpful assistant. Keep replies casual and concise.'
      : 'You are an expert teacher. Explain clearly, include examples and step-by-step instructions.';

    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
        temperature: Number(temperature) || 0.7,
        max_tokens: 900,
      }),
    });

    if (!openaiResp.ok) {
      const t = await openaiResp.text();
      console.error('OpenAI error', openaiResp.status, t);
      return NextResponse.json({ error: 'AI provider error' }, { status: 502 });
    }

    const data = await openaiResp.json();
    const aiText = data?.choices?.[0]?.message?.content ?? 'No response from AI';
    return NextResponse.json({ response: aiText });
  } catch (err) {
    console.error('ai-chat error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
