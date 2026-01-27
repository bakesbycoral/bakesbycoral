import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { getDB, getEnvVar } from '@/lib/db';
import { verifySession } from '@/lib/auth/session';
import { getDepositPercentage } from '@/lib/db/settings';

interface CreateInvoiceRequest {
  orderId: string;
  totalAmountCents?: number;
  description?: string;
  daysUntilDue?: number;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const userId = await verifySession(sessionToken, getEnvVar('bakesbycoral_session_secret'));
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.prepare('SELECT role FROM users WHERE id = ?')
      .bind(userId)
      .first<{ role: string }>();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body: CreateInvoiceRequest = await request.json();
    if (!body.orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await db.prepare(`
      SELECT id, order_number, order_type, customer_name, customer_email, status, total_amount
      FROM orders WHERE id = ?
    `).bind(body.orderId).first<{
      id: string;
      order_number: string;
      order_type: string;
      customer_name: string;
      customer_email: string;
      status: string;
      total_amount: number | null;
    }>();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!['cookies_large', 'cake', 'wedding'].includes(order.order_type)) {
      return NextResponse.json({ error: 'Invoices are only for large cookies, cakes, and weddings' }, { status: 400 });
    }

    const totalAmountCents = body.totalAmountCents ?? order.total_amount;
    if (!totalAmountCents || totalAmountCents <= 0) {
      return NextResponse.json({ error: 'Total amount is required' }, { status: 400 });
    }

    const depositPercentage = await getDepositPercentage();
    const depositAmount = Math.round(totalAmountCents * (depositPercentage / 100));

    const stripe = new Stripe(getEnvVar('bakesbycoral_stripe_secret_key'), {
      apiVersion: '2025-12-15.clover',
    });

    // Create or reuse Stripe customer
    const customer = await stripe.customers.create({
      email: order.customer_email,
      name: order.customer_name,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
      },
    });

    // Create invoice item for deposit
    await stripe.invoiceItems.create({
      customer: customer.id,
      amount: depositAmount,
      currency: 'usd',
      description: body.description || `Deposit for ${order.order_number}`,
    });

    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: body.daysUntilDue ?? 7,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        payment_type: 'deposit',
      },
    });

    const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
    const sent = await stripe.invoices.sendInvoice(finalized.id);

    await db.prepare(`
      UPDATE orders
      SET status = 'pending_payment',
          total_amount = ?,
          deposit_amount = ?,
          stripe_invoice_id = ?,
          stripe_invoice_url = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      totalAmountCents,
      depositAmount,
      sent.id,
      sent.hosted_invoice_url,
      order.id
    ).run();

    return NextResponse.json({
      success: true,
      invoiceId: sent.id,
      invoiceUrl: sent.hosted_invoice_url,
      depositAmount,
    });
  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
