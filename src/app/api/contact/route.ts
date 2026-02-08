import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar, generateId } from '@/lib/db';
import { isSpamSubmission, sanitizeInput } from '@/lib/validation';
import { sendEmail, buildContactFormNotification, parseAdminEmails } from '@/lib/email';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  website?: string;
  company?: string;
  phone?: string;
  subject?: string;
  tenantId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 'contact', RATE_LIMITS.contact);
    if (rateLimitResponse) return rateLimitResponse;

    const data: ContactFormData = await request.json();
    const tenantId = data.tenantId || 'bakes-by-coral';

    // Spam check (only for non-LeanGo, since LeanGo uses company field legitimately)
    if (tenantId === 'bakes-by-coral' && isSpamSubmission(data.website, data.company)) {
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

    const db = getDB();
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');

    // For LeanGo tenant, save to contact_submissions table
    if (tenantId === 'leango') {
      const id = generateId();
      const forwardedFor = request.headers.get('x-forwarded-for');
      const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      await db.prepare(`
        INSERT INTO contact_submissions (
          id, tenant_id, name, email, phone, company, subject, message,
          source, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'website', ?, ?)
      `).bind(
        id,
        tenantId,
        sanitizeInput(data.name),
        sanitizeInput(data.email),
        data.phone ? sanitizeInput(data.phone) : null,
        data.company ? sanitizeInput(data.company) : null,
        data.subject ? sanitizeInput(data.subject) : null,
        sanitizeInput(data.message),
        ipAddress,
        userAgent.substring(0, 500)
      ).run();
    }

    // Send email via Resend if configured
    if (resendApiKey) {
      try {
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

        // Determine recipient based on tenant
        let toEmail: string | string[];
        if (tenantId === 'leango') {
          const adminEmailSetting = await db.prepare('SELECT value FROM settings WHERE key = ?').bind('admin_email').first<{ value: string }>();
          toEmail = parseAdminEmails(adminEmailSetting?.value, 'hello@leango.com');
        } else {
          toEmail = 'coral@bakesbycoral.com';
        }

        await sendEmail(resendApiKey, {
          to: toEmail,
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
