'use client';

import { useState, useEffect } from 'react';
import { QuoteStatusBadge } from './QuoteStatusBadge';
import { QuoteBuilder } from './QuoteBuilder';
import type { Quote, QuoteLineItem } from '@/types';

interface QuoteWithDetails extends Quote {
  order_order_number?: string;
  customer_name?: string;
  line_items?: QuoteLineItem[];
}

interface QuotesListProps {
  orderId: string;
  orderStatus: string;
}

export function QuotesList({ orderId, orderStatus }: QuotesListProps) {
  const [quotes, setQuotes] = useState<QuoteWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithDetails | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, [orderId]);

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/quotes?order_id=${orderId}`);
      const data = await response.json() as { quotes?: QuoteWithDetails[] };
      setQuotes(data.quotes || []);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuote = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`);
      const data = await response.json() as { quote?: QuoteWithDetails };
      setSelectedQuote(data.quote || null);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
    }
  };

  const handleClose = () => {
    setSelectedQuote(null);
    setIsCreating(false);
    fetchQuotes();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (cents: number | null) => {
    if (cents === null) return '-';
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Show builder if creating or editing
  if (isCreating || selectedQuote) {
    return (
      <QuoteBuilder
        orderId={orderId}
        quote={selectedQuote || undefined}
        onClose={handleClose}
      />
    );
  }

  const canCreateQuote = ['inquiry', 'pending_payment'].includes(orderStatus);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#541409]">Quotes & Invoices</h2>
        {canCreateQuote && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-3 py-1.5 text-sm bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Quote
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#541409] mx-auto"></div>
        </div>
      ) : quotes.length === 0 ? (
        <div className="py-8 text-center text-[#541409]/60">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No quotes yet</p>
          {canCreateQuote && (
            <button
              onClick={() => setIsCreating(true)}
              className="mt-3 text-sm text-[#541409] hover:underline"
            >
              Create the first quote
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              className="p-4 border border-[#EAD6D6] rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#541409]">{quote.quote_number}</span>
                    <QuoteStatusBadge status={quote.status} />
                  </div>
                  <div className="mt-1 text-sm text-[#541409]/60">
                    Created {formatDate(quote.created_at)} •
                    {quote.valid_until && ` Valid until ${formatDate(quote.valid_until)}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#541409]">
                    {formatCurrency(quote.total_amount)}
                  </div>
                  {quote.deposit_amount && (
                    <div className="text-sm text-[#541409]/60">
                      Deposit: {formatCurrency(quote.deposit_amount)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => handleSelectQuote(quote.id)}
                  className="px-3 py-1.5 text-sm bg-[#EAD6D6] text-[#541409] rounded-lg hover:bg-[#EAD6D6]/70 transition-colors"
                >
                  {quote.status === 'draft' || quote.status === 'sent' ? 'Edit' : 'View'}
                </button>

                {quote.stripe_invoice_url && (
                  <a
                    href={quote.stripe_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-sm border border-[#EAD6D6] text-[#541409] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Invoice
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
