import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import type { Contract } from '@/types';

// GET /api/contracts/[token] - Public: view contract by signing token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const rateLimitResponse = rateLimit(request, 'contract-token', RATE_LIMITS.contractToken);
    if (rateLimitResponse) return rateLimitResponse;

    const { token } = await params;
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

    // Check if expired
    if (contract.valid_until) {
      const validUntil = new Date(contract.valid_until);
      validUntil.setHours(23, 59, 59, 999);
      if (new Date() > validUntil && contract.status === 'sent') {
        await db.prepare(`
          UPDATE contracts SET status = 'expired', updated_at = datetime('now') WHERE id = ?
        `).bind(contract.id).run();
        contract.status = 'expired';
      }
    }

    // Replace {{variables}} in contract_body with actual values
    let renderedBody = contract.contract_body || '';
    const replacements: Record<string, string> = {
      '{{event_date}}': contract.event_date ? new Date(contract.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD',
      '{{venue_name}}': contract.venue_name || 'TBD',
      '{{venue_address}}': contract.venue_address || 'TBD',
      '{{guest_count}}': contract.guest_count || 'TBD',
      '{{ceremony_time}}': contract.ceremony_time || 'TBD',
      '{{reception_time}}': contract.reception_time || 'TBD',
      '{{services_description}}': contract.services_description || 'TBD',
      '{{total_amount}}': `$${(contract.total_amount / 100).toFixed(2)}`,
      '{{deposit_percentage}}': String(contract.deposit_percentage),
      '{{deposit_amount}}': `$${((contract.deposit_amount || 0) / 100).toFixed(2)}`,
      '{{payment_schedule}}': contract.payment_schedule || 'TBD',
    };

    for (const [key, value] of Object.entries(replacements)) {
      renderedBody = renderedBody.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return NextResponse.json({
      contract: {
        id: contract.id,
        contract_number: contract.contract_number,
        status: contract.status,
        event_date: contract.event_date,
        venue_name: contract.venue_name,
        venue_address: contract.venue_address,
        guest_count: contract.guest_count,
        ceremony_time: contract.ceremony_time,
        reception_time: contract.reception_time,
        services_description: contract.services_description,
        total_amount: contract.total_amount,
        deposit_percentage: contract.deposit_percentage,
        deposit_amount: contract.deposit_amount,
        payment_schedule: contract.payment_schedule,
        contract_body: renderedBody,
        valid_until: contract.valid_until,
        signed_at: contract.signed_at,
        signer_name: contract.signer_name,
        order_number: contract.order_number,
        customer_name: contract.customer_name,
      },
    });
  } catch (error) {
    console.error('Get contract by token error:', error);
    return NextResponse.json({ error: 'Failed to get contract' }, { status: 500 });
  }
}
