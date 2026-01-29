import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { getDB, getEnvVar } from '@/lib/db';
import { verifySession } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await verifySession(sessionToken, getEnvVar('bakesbycoral_session_secret'));
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const user = await db.prepare('SELECT role FROM users WHERE id = ?')
      .bind(userId)
      .first<{ role: string }>();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const stripe = new Stripe(getEnvVar('bakesbycoral_stripe_secret_key'), {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const invoice = await stripe.invoices.retrieve(id);

    return NextResponse.json({
      id: invoice.id,
      status: invoice.status,
      hosted_invoice_url: invoice.hosted_invoice_url,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      due_date: invoice.due_date,
    });
  } catch (error) {
    console.error('Invoice fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}
