import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Here you would typically send the email or save to database
    // For now, just log it
    console.log('Contact form submission:', { name, email, message });

    // Simulate email sending
    // await sendEmail({ to: 'support@ai-elearning.com', subject: 'New Contact Form Submission', body: `Name: ${name}\nEmail: ${email}\nMessage: ${message}` });

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
