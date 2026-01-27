import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import Stripe from 'stripe';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number | null;
  deposit_amount: number | null;
  stripe_invoice_id: string | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const db = getDB();

    // Get the order
    const order = await db.prepare(`
      SELECT id, order_number, customer_name, customer_email, total_amount, deposit_amount, stripe_invoice_id
      FROM orders WHERE id = ?
    `).bind(orderId).first<Order>();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (!order.total_amount) {
      return NextResponse.json(
        { error: 'Order does not have a total amount set' },
        { status: 400 }
      );
    }

    if (!order.deposit_amount) {
      return NextResponse.json(
        { error: 'Order does not have a deposit amount' },
        { status: 400 }
      );
    }

    const balanceDue = order.total_amount - order.deposit_amount;
    if (balanceDue <= 0) {
      return NextResponse.json(
        { error: 'No balance remaining' },
        { status: 400 }
      );
    }

    // Initialize Stripe
    const stripeKey = getEnvVar('bakesbycoral_stripe_secret_key');
    if (!stripeKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia' });

    // Create or get customer
    const customers = await stripe.customers.list({
      email: order.customer_email,
      limit: 1,
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: order.customer_email,
        name: order.customer_name,
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
        },
      });
      customerId = customer.id;
    }

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 7,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        invoice_type: 'balance',
      },
    });

    // Add invoice item for balance
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: balanceDue,
      currency: 'usd',
      description: `Balance due for order ${order.order_number}`,
    });

    // Finalize and send invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(invoice.id);

    // Update order with balance invoice info
    await db.prepare(`
      UPDATE orders
      SET updated_at = datetime("now")
      WHERE id = ?
    `).bind(orderId).run();

    return NextResponse.json({
      success: true,
      invoiceId: finalizedInvoice.id,
      invoiceUrl: finalizedInvoice.hosted_invoice_url,
      balanceDue: balanceDue / 100,
    });
  } catch (error) {
    console.error('Error creating balance invoice:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create balance invoice' },
      { status: 500 }
    );
  }
}
