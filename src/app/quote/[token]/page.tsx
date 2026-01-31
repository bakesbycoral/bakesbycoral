'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import type { QuoteStatus, QuoteLineItem } from '@/types';

interface QuoteData {
  id: string;
  quote_number: string;
  status: QuoteStatus;
  subtotal: number;
  deposit_percentage: number;
  deposit_amount: number | null;
  total_amount: number;
  customer_message: string | null;
  valid_until: string | null;
  approved_at: string | null;
  stripe_invoice_url: string | null;
  order_number: string;
  order_type: string;
  customer_name: string;
  pickup_date: string | null;
  event_date: string | null;
  line_items: QuoteLineItem[];
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  cookies: 'Cookie Order',
  cookies_large: 'Large Cookie Order',
  cake: 'Custom Cake',
  wedding: 'Wedding',
  tasting: 'Tasting',
};

export default function QuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuote();
  }, [token]);

  const fetchQuote = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quotes/${token}`);
      const data = await response.json() as { quote?: QuoteData; error?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load quote');
      }

      setQuote(data.quote || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quote');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);

    try {
      const response = await fetch(`/api/quotes/${token}/approve`, {
        method: 'POST',
      });

      const data = await response.json() as { success?: boolean; error?: string; invoice_url?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve quote');
      }

      // Redirect to Stripe invoice
      if (data.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        // Refresh quote data
        await fetchQuote();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve quote');
      setIsApproving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#541409] mx-auto"></div>
          <p className="mt-4 text-[#541409]/60">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center border border-[#EAD6D6]">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#541409] mb-2">Quote Not Found</h1>
          <p className="text-[#541409]/60 mb-6">
            {error || 'This quote may have expired or the link is invalid.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = quote.status === 'expired';
  const isApproved = quote.status === 'approved' || quote.status === 'converted';
  const canApprove = quote.status === 'sent';

  return (
    <div className="min-h-screen bg-[#F7F3ED]">
      {/* Header */}
      <header className="bg-[#541409] text-[#EAD6D6] py-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-serif">Bakes by Coral</h1>
          <p className="text-sm opacity-80 mt-1">100% Gluten-Free Home Bakery</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-[#EAD6D6] overflow-hidden">
          {/* Quote Header */}
          <div className="p-6 border-b border-[#EAD6D6]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#541409]">Quote {quote.quote_number}</h2>
                <p className="text-[#541409]/60 text-sm mt-1">
                  Order: {quote.order_number} • {ORDER_TYPE_LABELS[quote.order_type] || quote.order_type}
                </p>
              </div>
              <div className="text-right">
                {isExpired && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    Expired
                  </span>
                )}
                {isApproved && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Approved
                  </span>
                )}
                {canApprove && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
                    Pending Approval
                  </span>
                )}
              </div>
            </div>

            <p className="mt-4 text-[#541409]">Hi {quote.customer_name},</p>
            <p className="text-[#541409]/80 mt-2">
              Thank you for your interest! Here&apos;s your personalized quote:
            </p>

            {quote.customer_message && (
              <div className="mt-4 p-4 bg-[#EAD6D6]/30 rounded-lg">
                <p className="text-[#541409]">{quote.customer_message}</p>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[#541409]/60 border-b border-[#EAD6D6]">
                  <th className="pb-3 font-medium">Item</th>
                  <th className="pb-3 font-medium text-center w-20">Qty</th>
                  <th className="pb-3 font-medium text-right w-24">Price</th>
                  <th className="pb-3 font-medium text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.line_items.map((item) => (
                  <tr key={item.id} className="border-b border-[#EAD6D6]/50">
                    <td className="py-4 text-[#541409]">{item.description}</td>
                    <td className="py-4 text-center text-[#541409]/80">{item.quantity}</td>
                    <td className="py-4 text-right text-[#541409]/80">{formatCurrency(item.unit_price)}</td>
                    <td className="py-4 text-right font-medium text-[#541409]">{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#EAD6D6]">
                  <td colSpan={3} className="pt-4 text-right font-medium text-[#541409]">
                    Subtotal
                  </td>
                  <td className="pt-4 text-right font-semibold text-[#541409]">
                    {formatCurrency(quote.subtotal)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="pt-2 text-right text-[#541409]">
                    Deposit Due ({quote.deposit_percentage}%)
                  </td>
                  <td className="pt-2 text-right font-bold text-[#541409] text-lg">
                    {formatCurrency(quote.deposit_amount || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Valid Until */}
            {quote.valid_until && !isApproved && (
              <p className="mt-6 text-sm text-[#541409]/60">
                This quote is valid until <strong>{formatDate(quote.valid_until)}</strong>
              </p>
            )}

            {/* Event/Pickup Date */}
            {(quote.event_date || quote.pickup_date) && (
              <div className="mt-4 p-4 bg-[#EAD6D6]/20 rounded-lg">
                {quote.event_date && (
                  <p className="text-[#541409]">
                    <strong>Event Date:</strong> {formatDate(quote.event_date)}
                  </p>
                )}
                {quote.pickup_date && (
                  <p className="text-[#541409] mt-1">
                    <strong>Pickup Date:</strong> {formatDate(quote.pickup_date)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 bg-[#F7F3ED] border-t border-[#EAD6D6]">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {isExpired && (
              <div className="text-center">
                <p className="text-[#541409]/80 mb-4">
                  This quote has expired. Please contact us to request a new quote.
                </p>
                <a
                  href="mailto:hello@bakesbycoral.com"
                  className="inline-block px-6 py-3 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity"
                >
                  Contact Us
                </a>
              </div>
            )}

            {isApproved && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[#541409] font-medium mb-2">Quote Approved!</p>
                <p className="text-[#541409]/60 text-sm mb-4">
                  {quote.approved_at && `Approved on ${formatDate(quote.approved_at)}`}
                </p>
                {quote.stripe_invoice_url && (
                  <a
                    href={quote.stripe_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity"
                  >
                    View Invoice
                  </a>
                )}
              </div>
            )}

            {canApprove && (
              <div className="text-center">
                <p className="text-[#541409]/80 mb-4">
                  By approving this quote, you agree to pay a {quote.deposit_percentage}% deposit of{' '}
                  <strong>{formatCurrency(quote.deposit_amount || 0)}</strong> to secure your order.
                  The remaining balance is due 1 week before pickup.
                </p>
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="px-8 py-4 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApproving ? 'Processing...' : `Approve & Pay Deposit (${formatCurrency(quote.deposit_amount || 0)})`}
                </button>
                <p className="mt-4 text-sm text-[#541409]/60">
                  Questions? Email us at{' '}
                  <a href="mailto:hello@bakesbycoral.com" className="text-[#541409] hover:underline">
                    hello@bakesbycoral.com
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-[#541409]/60">
          <p>Bakes by Coral • Cincinnati, OH</p>
          <p className="mt-1">100% Gluten-Free Home Bakery</p>
        </div>
      </main>
    </div>
  );
}
