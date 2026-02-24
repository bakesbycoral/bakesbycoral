import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import { rateLimit, RATE_LIMITS, getClientIp } from '@/lib/rate-limit';
import { sendEmail, buildContractSignedFromTemplate, parseAdminEmails } from '@/lib/email';
import type { Contract } from '@/types';

interface SignContractRequest {
  signer_name: string;
  agreed: boolean;
}

// POST /api/contracts/[token]/sign - Sign the contract
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const rateLimitResponse = rateLimit(request, 'contract-token', RATE_LIMITS.contractToken);
    if (rateLimitResponse) return rateLimitResponse;

    const { token } = await params;
    const body: SignContractRequest = await request.json();

    if (!body.signer_name?.trim()) {
      return NextResponse.json({ error: 'Signer name is required' }, { status: 400 });
    }

    if (!body.agreed) {
      return NextResponse.json({ error: 'You must agree to the contract terms' }, { status: 400 });
    }

    const db = getDB();

    // Get contract with order details
    const contract = await db.prepare(`
      SELECT c.*, o.order_number, o.customer_name, o.customer_email
      FROM contracts c
      JOIN orders o ON c.order_id = o.id
      WHERE c.signing_token = ?
    `).bind(token).first<Contract & {
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

    if (contract.status === 'expired') {
      return NextResponse.json({ error: 'Contract has expired' }, { status: 400 });
    }

    if (contract.status === 'draft') {
      return NextResponse.json({ error: 'Contract has not been sent yet' }, { status: 400 });
    }

    // Check expiry
    if (contract.valid_until) {
      const validUntil = new Date(contract.valid_until);
      validUntil.setHours(23, 59, 59, 999);
      if (new Date() > validUntil) {
        await db.prepare(`
          UPDATE contracts SET status = 'expired', updated_at = datetime('now') WHERE id = ?
        `).bind(contract.id).run();
        return NextResponse.json({ error: 'Contract has expired' }, { status: 400 });
      }
    }

    // Capture IP and sign
    const signerIp = getClientIp(request);

    await db.prepare(`
      UPDATE contracts
      SET status = 'signed',
          signed_at = datetime('now'),
          signer_name = ?,
          signer_ip = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(body.signer_name.trim(), signerIp, contract.id).run();

    // Send confirmation emails
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      // Get email template from settings
      const signedTemplate = await db.prepare('SELECT value FROM settings WHERE key = ?')
        .bind('email_template_contract_signed')
        .first<{ value: string }>();
      const signedSubject = await db.prepare('SELECT value FROM settings WHERE key = ?')
        .bind('email_subject_contract_signed')
        .first<{ value: string }>();

      const emailData = {
        customerName: contract.customer_name,
        contractNumber: contract.contract_number,
      };

      const emailContent = buildContractSignedFromTemplate(
        signedTemplate?.value,
        signedSubject?.value,
        emailData
      );

      // Send to customer
      await sendEmail(resendApiKey, {
        to: contract.customer_email,
        subject: emailContent.subject,
        html: emailContent.html,
        replyTo: 'hello@bakesbycoral.com',
      });

      // Send notification to admin
      const adminEmailSetting = await db.prepare('SELECT value FROM settings WHERE key = ?')
        .bind('admin_email')
        .first<{ value: string }>();
      const adminEmails = parseAdminEmails(adminEmailSetting?.value);

      await sendEmail(resendApiKey, {
        to: adminEmails,
        subject: `Contract Signed - ${contract.contract_number} - ${contract.customer_name}`,
        html: emailContent.html,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign contract error:', error);
    const message = error instanceof Error ? error.message : 'Failed to sign contract';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
