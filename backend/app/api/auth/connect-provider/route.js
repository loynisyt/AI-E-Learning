import { NextResponse } from 'next/server';
import { getContent, updateContent } from '@/lib/directus';

export async function POST(request) {
  try {
    const { provider, providerId, providerEmail } = await request.json();

    if (!provider || !providerId || !providerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find user by email in Directus
    const users = await getContent('users', { filter: { email: { _eq: providerEmail } } });
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = users[0];

    // Update user with provider info to connect account
    const updateData = {};
    if (provider === 'google') {
      updateData.googleProviderId = providerId;
    } else if (provider === 'facebook') {
      updateData.facebookProviderId = providerId;
    } else {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    const updatedUser = await updateContent('users', user.id, updateData);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Connect provider error:', error);
    return NextResponse.json({ error: error.message || 'Provider connection failed' }, { status: 500 });
  }
}
