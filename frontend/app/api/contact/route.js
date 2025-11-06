import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Here you can integrate with your email service or support system
    // For now, just log it
    console.log('Contact message:', message);

    // Simulate sending email or storing in database
    // e.g., await sendEmail({ to: 'support@yourapp.com', subject: 'Support Request', body: message });

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
