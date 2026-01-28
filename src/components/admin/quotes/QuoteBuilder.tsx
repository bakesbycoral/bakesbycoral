'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuoteLineItemRow } from './QuoteLineItemRow';
import { QuoteStatusBadge } from './QuoteStatusBadge';
import type { Quote, QuoteLineItem, QuoteStatus } from '@/types';

interface LineItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sort_order: number;
}

interface QuoteBuilderProps {
  orderId: string;
  quote?: Quote & { line_items?: QuoteLineItem[] };
  onClose: () => void;
}

export function QuoteBuilder({ orderId, quote, onClose }: QuoteBuilderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [quoteId, setQuoteId] = useState<string | null>(quote?.id || null);
  const [quoteNumber, setQuoteNumber] = useState(quote?.quote_number || '');
  const [status, setStatus] = useState<QuoteStatus>(quote?.status || 'draft');
  const [depositPercentage, setDepositPercentage] = useState(
    quote?.deposit_percentage?.toString() || '50'
  );
  const [notes, setNotes] = useState(quote?.notes || '');
  const [customerMessage, setCustomerMessage] = useState(quote?.customer_message || '');
  const [validUntil, setValidUntil] = useState(
    quote?.valid_until || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [lineItems, setLineItems] = useState<LineItem[]>(
    quote?.line_items?.map((item, index) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      sort_order: item.sort_order ?? index,
    })) || []
  );

  const isEditable = status === 'draft' || status === 'sent';

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
  const depositAmount = Math.round(subtotal * (parseInt(depositPercentage) || 50) / 100);

  // Create quote if new
  useEffect(() => {
    if (!quoteId) {
      createQuote();
    }
  }, []);

  const createQuote = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          deposit_percentage: parseInt(depositPercentage) || 50,
          notes,
          customer_message: customerMessage,
          valid_days: 7,
        }),
      });

      const data = await response.json() as {
        success?: boolean;
        error?: string;
        quote?: { id: string; quote_number: string };
      };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create quote');
      }

      if (data.quote) {
        setQuoteId(data.quote.id);
        setQuoteNumber(data.quote.quote_number);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quote');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      sort_order: lineItems.length,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleLineItemChange = (index: number, item: LineItem) => {
    const newItems = [...lineItems];
    newItems[index] = item;
    setLineItems(newItems);
  };

  const handleRemoveLineItem = (index: number) => {
    const newItems = lineItems.filter((_, i) => i !== index);
    // Update sort orders
    newItems.forEach((item, i) => {
      item.sort_order = i;
    });
    setLineItems(newItems);
  };

  const handleSave = async () => {
    if (!quoteId) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Update quote details
      await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deposit_percentage: parseInt(depositPercentage) || 50,
          notes,
          customer_message: customerMessage,
          valid_until: validUntil,
        }),
      });

      // Update line items
      const validLineItems = lineItems.filter(item => item.description.trim() !== '');

      await fetch(`/api/admin/quotes/${quoteId}/line-items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: validLineItems.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            sort_order: index,
          })),
        }),
      });

      setSuccess('Quote saved successfully');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quote');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    if (!quoteId) return;

    // Validate line items
    const validLineItems = lineItems.filter(item => item.description.trim() !== '');
    if (validLineItems.length === 0) {
      setError('Please add at least one line item before sending');
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      // Save first
      await handleSave();

      // Then send
      const response = await fetch(`/api/admin/quotes/${quoteId}/send`, {
        method: 'POST',
      });

      const data = await response.json() as { success?: boolean; error?: string; quoteUrl?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send quote');
      }

      setStatus('sent');
      setSuccess('Quote sent to customer!');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send quote');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#541409] mx-auto"></div>
        <p className="mt-4 text-[#541409]/60">Creating quote...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#EAD6D6]">
      {/* Header */}
      <div className="p-6 border-b border-[#EAD6D6] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#541409]">
            {quoteNumber ? `Quote ${quoteNumber}` : 'New Quote'}
          </h2>
          {status && <QuoteStatusBadge status={status} />}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-[#541409]">Line Items</h3>
            {isEditable && (
              <button
                onClick={handleAddLineItem}
                className="px-3 py-1.5 text-sm bg-[#EAD6D6] text-[#541409] rounded-lg hover:bg-[#EAD6D6]/70 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            )}
          </div>

          {/* Headers */}
          <div className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#541409]/60 uppercase tracking-wide">
            <div className="flex-1">Description</div>
            <div className="w-20 text-center">Qty</div>
            <div className="w-28 text-right">Price</div>
            <div className="w-24 text-right">Total</div>
            <div className="w-10"></div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            {lineItems.map((item, index) => (
              <QuoteLineItemRow
                key={index}
                item={item}
                index={index}
                onChange={handleLineItemChange}
                onRemove={handleRemoveLineItem}
                disabled={!isEditable}
              />
            ))}

            {lineItems.length === 0 && (
              <div className="p-8 text-center text-[#541409]/60 bg-gray-50 rounded-lg">
                No items yet. Click "Add Item" to get started.
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t border-[#EAD6D6] space-y-2">
            <div className="flex justify-end items-center gap-4">
              <span className="text-[#541409]/60">Subtotal:</span>
              <span className="w-24 text-right font-medium text-[#541409]">
                ${(subtotal / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-end items-center gap-4">
              <span className="text-[#541409]/60">
                Deposit ({depositPercentage}%):
              </span>
              <span className="w-24 text-right font-semibold text-[#541409]">
                ${(depositAmount / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#541409] mb-1">
              Deposit %
            </label>
            <input
              type="number"
              value={depositPercentage}
              onChange={(e) => setDepositPercentage(e.target.value)}
              min="0"
              max="100"
              disabled={!isEditable}
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none disabled:bg-gray-100 text-[#541409]/50 placeholder:text-[#541409]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#541409] mb-1">
              Valid Until
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              disabled={!isEditable}
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none disabled:bg-gray-100 text-[#541409]/50 placeholder:text-[#541409]/50"
            />
          </div>
        </div>

        {/* Customer Message */}
        <div>
          <label className="block text-sm font-medium text-[#541409] mb-1">
            Message to Customer
          </label>
          <textarea
            value={customerMessage}
            onChange={(e) => setCustomerMessage(e.target.value)}
            rows={3}
            disabled={!isEditable}
            placeholder="Optional message to include in the quote email..."
            className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none disabled:bg-gray-100 resize-none text-[#541409]/50 placeholder:text-[#541409]/50"
          />
        </div>

        {/* Internal Notes */}
        <div>
          <label className="block text-sm font-medium text-[#541409] mb-1">
            Internal Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Notes for your reference (not shown to customer)..."
            className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none resize-none text-[#541409]/50 placeholder:text-[#541409]/50"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-[#EAD6D6] flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-[#541409] border border-[#EAD6D6] rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        {isEditable && (
          <>
            <button
              onClick={handleSave}
              disabled={isSaving || isSending}
              className="px-4 py-2 bg-[#EAD6D6] text-[#541409] rounded-lg hover:bg-[#EAD6D6]/70 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSend}
              disabled={isSaving || isSending || lineItems.length === 0}
              className="px-4 py-2 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSending ? 'Sending...' : status === 'sent' ? 'Resend Quote' : 'Send Quote'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
