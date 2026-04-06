import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import Stripe from 'stripe';

interface QuoteOrderRow {
  id: string;
  quote_id: string;
  quote_status: string;
  total_amount: number;
  deposit_amount: number | null;
  customer_name: string;
  customer_email: string;
  order_number: string;
  pickup_date: string | null;
  paid_at: string | null;
  deposit_paid_at: string | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const db = getDB();

    const quote = await db.prepare(`
      SELECT
        o.id,
        q.id as quote_id,
        q.status as quote_status,
        o.total_amount,
        o.deposit_amount,
        o.customer_name,
        o.customer_email,
        o.order_number,
        o.pickup_date,
        o.paid_at,
        o.deposit_paid_at
      FROM quotes q
      JOIN orders o ON q.order_id = o.id
      WHERE q.approval_token = ?
    `).bind(token).first<QuoteOrderRow>();

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (!['approved', 'converted'].includes(quote.quote_status)) {
      return NextResponse.json({ error: 'Quote must be approved before paying the balance' }, { status: 400 });
    }

    if (!quote.deposit_paid_at) {
      return NextResponse.json({ error: 'Deposit must be paid before paying the remaining balance' }, { status: 400 });
    }

    if (quote.paid_at) {
      return NextResponse.json({ error: 'This order has already been paid in full' }, { status: 400 });
    }

    const totalAmount = quote.total_amount || 0;
    const depositAmount = quote.deposit_amount || 0;
    const balanceDue = totalAmount - depositAmount;

    if (balanceDue <= 0) {
      return NextResponse.json({ error: 'No balance remaining' }, { status: 400 });
    }

    const stripeKey = getEnvVar('bakesbycoral_stripe_secret_key');
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const customers = await stripe.customers.list({
      email: quote.customer_email,
      limit: 10,
    });

    let customerId: string | null = null;
    for (const customer of customers.data) {
      if (customer.metadata?.order_id === quote.id || customer.email === quote.customer_email) {
        customerId = customer.id;
        break;
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: quote.customer_email,
        name: quote.customer_name,
        metadata: {
          order_id: quote.id,
          order_number: quote.order_number,
          quote_id: quote.quote_id,
        },
      });
      customerId = customer.id;
    }

    const existingInvoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100,
    });

    const existingBalanceInvoice = existingInvoices.data.find((invoice) => (
      invoice.metadata?.order_id === quote.id &&
      invoice.metadata?.invoice_type === 'balance' &&
      invoice.status !== 'paid' &&
      invoice.status !== 'void'
    ));

    if (existingBalanceInvoice) {
      if (existingBalanceInvoice.status === 'draft') {
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(existingBalanceInvoice.id);
        return NextResponse.json({
          success: true,
          invoice_url: finalizedInvoice.hosted_invoice_url,
        });
      }

      return NextResponse.json({
        success: true,
        invoice_url: existingBalanceInvoice.hosted_invoice_url,
      });
    }

    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 7,
      metadata: {
        order_id: quote.id,
        order_number: quote.order_number,
        quote_id: quote.quote_id,
        invoice_type: 'balance',
      },
    });

    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: balanceDue,
      currency: 'usd',
      description: `Balance due for order ${quote.order_number}`,
    });

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    await db.prepare(`
      UPDATE orders
      SET updated_at = datetime('now')
      WHERE id = ?
    `).bind(quote.id).run();

    return NextResponse.json({
      success: true,
      invoice_url: finalizedInvoice.hosted_invoice_url,
    });
  } catch (error) {
    console.error('Create quote balance invoice error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create balance invoice' },
      { status: 500 }
    );
  }
}
