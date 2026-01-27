import { NextRequest, NextResponse } from 'next/server';
import { getEnvVar } from '@/lib/db';
import { isSpamSubmission, sanitizeInput } from '@/lib/validation';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  website?: string;
  company?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json();

    // Spam check
    if (isSpamSubmission(data.website, data.company)) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }

    // Validate
    if (!data.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!data.email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }
    if (!data.message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');

    // Send email via Resend if configured
    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Bakes by Coral <noreply@bakesbycoral.com>',
            to: ['hello@bakesbycoral.com'],
            reply_to: data.email,
            subject: `New Contact Form Message from ${sanitizeInput(data.name)}`,
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>From:</strong> ${sanitizeInput(data.name)}</p>
              <p><strong>Email:</strong> ${sanitizeInput(data.email)}</p>
              <hr />
              <p><strong>Message:</strong></p>
              <p>${sanitizeInput(data.message).replace(/\n/g, '<br>')}</p>
            `,
          }),
        });

        if (!response.ok) {
          console.error('Failed to send email:', await response.text());
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
