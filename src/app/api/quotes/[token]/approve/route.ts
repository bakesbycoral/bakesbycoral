import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import Stripe from 'stripe';
import { sendEmail, quoteApprovedEmail } from '@/lib/email';
import type { Quote, QuoteLineItem } from '@/types';

// POST /api/quotes/[token]/approve - Approve quote and create Stripe invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const db = getDB();

    // Get quote with order details
    const quote = await db.prepare(`
      SELECT q.*, o.id as order_id, o.order_number, o.order_type, o.customer_name, o.customer_email
      FROM quotes q
      JOIN orders o ON q.order_id = o.id
      WHERE q.approval_token = ?
    `).bind(token).first<Quote & {
      order_id: string;
      order_number: string;
      order_type: string;
      customer_name: string;
      customer_email: string;
    }>();

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Check if already approved
    if (quote.status === 'approved' || quote.status === 'converted') {
      return NextResponse.json({
        error: 'Quote has already been approved',
        invoice_url: quote.stripe_invoice_url,
      }, { status: 400 });
    }

    // Check if expired
    if (quote.status === 'expired') {
      return NextResponse.json({ error: 'Quote has expired' }, { status: 400 });
    }

    if (quote.valid_until) {
      const validUntil = new Date(quote.valid_until);
      validUntil.setHours(23, 59, 59, 999);
      if (new Date() > validUntil) {
        await db.prepare(`
          UPDATE quotes SET status = 'expired', updated_at = datetime('now') WHERE id = ?
        `).bind(quote.id).run();
        return NextResponse.json({ error: 'Quote has expired' }, { status: 400 });
      }
    }

    // Get line items
    const lineItemsResult = await db.prepare(`
      SELECT * FROM quote_line_items WHERE quote_id = ? ORDER BY sort_order ASC
    `).bind(quote.id).all<QuoteLineItem>();

    const lineItems = lineItemsResult.results || [];

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'Quote has no line items' }, { status: 400 });
    }

    // Create Stripe invoice
    const stripe = new Stripe(getEnvVar('bakesbycoral_stripe_secret_key'), {
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Create or reuse Stripe customer
    const customer = await stripe.customers.create({
      email: quote.customer_email,
      name: quote.customer_name,
      metadata: {
        order_id: quote.order_id,
        order_number: quote.order_number,
        quote_id: quote.id,
        quote_number: quote.quote_number,
      },
    });

    // Create invoice items for deposit
    await stripe.invoiceItems.create({
      customer: customer.id,
      amount: quote.deposit_amount || 0,
      currency: 'usd',
      description: `Deposit (${quote.deposit_percentage}%) for ${quote.order_number}`,
    });

    // Create the invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: 7,
      metadata: {
        order_id: quote.order_id,
        order_number: quote.order_number,
        quote_id: quote.id,
        quote_number: quote.quote_number,
        payment_type: 'deposit',
      },
    });

    // Finalize and send the invoice
    const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(finalized.id);

    // Update quote status
    await db.prepare(`
      UPDATE quotes
      SET status = 'approved',
          approved_at = datetime('now'),
          stripe_invoice_id = ?,
          stripe_invoice_url = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(finalized.id, finalized.hosted_invoice_url, quote.id).run();

    // Update order status and amounts
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
      quote.total_amount,
      quote.deposit_amount,
      finalized.id,
      finalized.hosted_invoice_url,
      quote.order_id
    ).run();

    // Send confirmation email
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      await sendEmail(resendApiKey, {
        to: quote.customer_email,
        subject: `Quote Approved - ${quote.quote_number}`,
        html: quoteApprovedEmail({
          customerName: quote.customer_name,
          quoteNumber: quote.quote_number,
          orderNumber: quote.order_number,
          depositAmount: quote.deposit_amount || 0,
          totalAmount: quote.total_amount,
          invoiceUrl: finalized.hosted_invoice_url || '',
        }),
        replyTo: 'hello@bakesbycoral.com',
      });
    }

    return NextResponse.json({
      success: true,
      invoice_url: finalized.hosted_invoice_url,
    });
  } catch (error) {
    console.error('Approve quote error:', error);
    return NextResponse.json({ error: 'Failed to approve quote' }, { status: 500 });
  }
}
