import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import { isSpamSubmission, sanitizeInput } from '@/lib/validation';
import { sendEmail, buildContactFormNotification } from '@/lib/email';

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
        const db = getDB();

        // Get email template from settings
        const contactTemplate = await db.prepare('SELECT value FROM settings WHERE key = ?')
          .bind('email_template_contact_form')
          .first<{ value: string }>();
        const contactSubject = await db.prepare('SELECT value FROM settings WHERE key = ?')
          .bind('email_subject_contact_form')
          .first<{ value: string }>();

        const email = buildContactFormNotification(
          contactTemplate?.value,
          contactSubject?.value,
          {
            customerName: sanitizeInput(data.name),
            customerEmail: sanitizeInput(data.email),
            message: sanitizeInput(data.message),
          }
        );

        await sendEmail(resendApiKey, {
          to: 'coral@bakesbycoral.com',
          subject: email.subject,
          html: email.html,
          replyTo: data.email,
        });
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
