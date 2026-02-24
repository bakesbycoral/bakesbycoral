import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';
import { sendEmail, buildContractSentFromTemplate } from '@/lib/email';
import type { Contract } from '@/types';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// POST /api/admin/contracts/[id]/send - Send contract to customer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitResponse = rateLimit(request, 'email-send', RATE_LIMITS.emailSend);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const db = getDB();

    // Get contract with order details
    const contract = await db.prepare(`
      SELECT c.*, o.order_number, o.customer_name, o.customer_email
      FROM contracts c
      JOIN orders o ON c.order_id = o.id
      WHERE c.id = ? AND c.tenant_id = ?
    `).bind(id, session.tenantId).first<Contract & {
      order_number: string;
      customer_name: string;
      customer_email: string;
    }>();

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (contract.status === 'signed') {
      return NextResponse.json({ error: 'Contract has already been signed' }, { status: 400 });
    }

    if (!contract.contract_body) {
      return NextResponse.json({ error: 'Contract must have terms before sending' }, { status: 400 });
    }

    // Generate contract URL
    const siteUrl = getEnvVar('NEXT_PUBLIC_SITE_URL') || request.nextUrl.origin;
    const contractUrl = `${siteUrl}/contract/${contract.signing_token}`;

    // Send email
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (!resendApiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    // Get email template from settings
    const contractTemplate = await db.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('email_template_contract_sent')
      .first<{ value: string }>();
    const contractSubject = await db.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('email_subject_contract_sent')
      .first<{ value: string }>();

    const emailContent = buildContractSentFromTemplate(
      contractTemplate?.value,
      contractSubject?.value,
      {
        customerName: contract.customer_name,
        contractNumber: contract.contract_number,
        validUntil: contract.valid_until || '',
        contractUrl,
      }
    );

    const emailSent = await sendEmail(resendApiKey, {
      to: contract.customer_email,
      subject: emailContent.subject,
      html: emailContent.html,
      replyTo: 'hello@bakesbycoral.com',
    });

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Update contract status to sent
    await db.prepare(`
      UPDATE contracts SET status = 'sent', updated_at = datetime('now') WHERE id = ?
    `).bind(id).run();

    return NextResponse.json({
      success: true,
      contractUrl,
    });
  } catch (error) {
    console.error('Send contract error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send contract';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
