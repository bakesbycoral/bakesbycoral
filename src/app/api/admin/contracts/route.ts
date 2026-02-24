import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';
import { getTenantSetting } from '@/lib/db/settings';
import type { WeddingInquiryData } from '@/types';

interface CreateContractRequest {
  order_id: string;
  valid_days?: number;
}

function generateContractNumber(): string {
  return `WC-${Date.now().toString(36).toUpperCase()}`;
}

// GET /api/admin/contracts - List contracts for an order
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    const db = getDB();

    let query = `
      SELECT c.*, o.order_number as order_order_number, o.customer_name
      FROM contracts c
      JOIN orders o ON c.order_id = o.id
      WHERE c.tenant_id = ?
    `;
    const bindings: string[] = [session.tenantId];

    if (orderId) {
      query += ` AND c.order_id = ?`;
      bindings.push(orderId);
    }

    query += ` ORDER BY c.created_at DESC`;

    const result = await db.prepare(query).bind(...bindings).all();

    return NextResponse.json({ contracts: result.results || [] });
  } catch (error) {
    console.error('List contracts error:', error);
    return NextResponse.json({ error: 'Failed to list contracts' }, { status: 500 });
  }
}

// POST /api/admin/contracts - Create a new contract
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateContractRequest = await request.json();

    if (!body.order_id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const db = getDB();

    // Verify order exists, belongs to this tenant, and is a wedding
    const order = await db.prepare(
      'SELECT id, status, order_type, event_date, form_data FROM orders WHERE id = ? AND tenant_id = ?'
    )
      .bind(body.order_id, session.tenantId)
      .first<{ id: string; status: string; order_type: string; event_date: string | null; form_data: string | null }>();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.order_type !== 'wedding') {
      return NextResponse.json({ error: 'Contracts are only available for wedding orders' }, { status: 400 });
    }

    // Parse wedding form data to pre-populate
    let formData: Partial<WeddingInquiryData> = {};
    if (order.form_data) {
      try {
        formData = JSON.parse(order.form_data) as Partial<WeddingInquiryData>;
      } catch {
        // ignore parse errors
      }
    }

    // Get validity days and default contract body from settings
    const validityDaysSetting = await getTenantSetting(session.tenantId, 'contract_validity_days');
    const validityDays = body.valid_days ?? (validityDaysSetting ? parseInt(validityDaysSetting) : 30);

    const defaultBodySetting = await getTenantSetting(session.tenantId, 'default_contract_body');
    const defaultBody = defaultBodySetting || '';

    // Calculate valid_until date
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    const contractId = crypto.randomUUID();
    const contractNumber = generateContractNumber();
    const signingToken = crypto.randomUUID();

    await db.prepare(`
      INSERT INTO contracts (
        id, order_id, contract_number, tenant_id, status,
        event_date, venue_name, venue_address, guest_count,
        ceremony_time, reception_time, services_description,
        total_amount, deposit_percentage, deposit_amount, payment_schedule,
        contract_body, notes, signing_token, valid_until,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, 0, 50, 0, ?, ?, NULL, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      contractId,
      body.order_id,
      contractNumber,
      session.tenantId,
      formData.wedding_date || order.event_date || null,
      formData.venue_name || null,
      formData.venue_address || null,
      formData.guest_count || null,
      formData.ceremony_time || null,
      formData.reception_time || null,
      formData.services_needed || null,
      'Deposit due upon signing. Remaining balance due 2 weeks before event.',
      defaultBody,
      signingToken,
      validUntil.toISOString().split('T')[0]
    ).run();

    return NextResponse.json({
      success: true,
      contract: {
        id: contractId,
        contract_number: contractNumber,
        signing_token: signingToken,
      },
    });
  } catch (error) {
    console.error('Create contract error:', error);
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }
}
