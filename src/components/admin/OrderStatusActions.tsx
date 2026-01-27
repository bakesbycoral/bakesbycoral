'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: string;
  orderType: string;
}

const statusTransitions: Record<string, string[]> = {
  inquiry: ['pending_payment', 'cancelled'],
  pending_payment: ['confirmed', 'deposit_paid', 'cancelled'],
  deposit_paid: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: ['inquiry'],
};

const statusLabels: Record<string, string> = {
  inquiry: 'Inquiry',
  pending_payment: 'Pending Payment',
  deposit_paid: 'Deposit Paid',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function OrderStatusActions({ orderId, currentStatus, orderType }: OrderStatusActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState('');

  const availableTransitions = statusTransitions[currentStatus] || [];
  const isInquiry = currentStatus === 'inquiry';
  const needsQuote = isInquiry && ['cake', 'cookies_large', 'wedding'].includes(orderType);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    setError('');

    try {
      const body: { status: string; totalAmount?: number } = { status: newStatus };

      if (newStatus === 'pending_payment' && quoteAmount) {
        body.totalAmount = Math.round(parseFloat(quoteAmount) * 100);
      }

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (data.success) {
        router.refresh();
        setShowQuoteForm(false);
      } else {
        setError(data.error || 'Failed to update status');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateInvoice = async () => {
    setError('');
    setInvoiceUrl('');

    const amount = parseFloat(quoteAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          totalAmountCents: Math.round(amount * 100),
        }),
      });

      const data = await response.json() as { success?: boolean; error?: string; invoiceUrl?: string };
      if (data.success) {
        setInvoiceUrl(data.invoiceUrl || '');
        setShowQuoteForm(false);
        router.refresh();
      } else {
        setError(data.error || 'Failed to create invoice');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
      <h2 className="font-semibold text-[#541409] mb-4">Actions</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Quote form for inquiries */}
      {needsQuote && !showQuoteForm && (
        <button
          onClick={() => setShowQuoteForm(true)}
          className="w-full mb-4 px-4 py-2 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity"
        >
          Create Invoice
        </button>
      )}

      {showQuoteForm && (
        <div className="mb-4 p-4 bg-[#EAD6D6]/20 rounded-lg">
          <label className="block text-sm font-medium text-[#541409] mb-2">
            Quote Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={quoteAmount}
            onChange={(e) => setQuoteAmount(e.target.value)}
            className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none mb-3 text-[#541409]"
            placeholder="0.00"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateInvoice}
              disabled={isUpdating || !quoteAmount}
              className="flex-1 px-3 py-2 bg-[#541409] text-[#EAD6D6] text-sm rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isUpdating ? 'Creating...' : 'Create Invoice'}
            </button>
            <button
              onClick={() => setShowQuoteForm(false)}
              className="px-3 py-2 bg-[#EAD6D6] text-[#541409] text-sm rounded-lg hover:bg-[#EAD6D6]/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {invoiceUrl && (
        <a
          href={invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full mb-4 px-4 py-2 bg-[#EAD6D6]/30 text-[#541409] rounded-lg text-center text-sm hover:bg-[#EAD6D6]/50"
        >
          View Invoice
        </a>
      )}

      {/* Status transition buttons */}
      {availableTransitions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-[#541409]/60 mb-2">Update Status</p>
          {availableTransitions
            .filter((status) => !(needsQuote && status === 'pending_payment'))
            .map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={isUpdating}
                className={`
                  w-full px-4 py-2 text-sm rounded-lg transition-colors text-left
                  ${status === 'cancelled'
                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : status === 'completed'
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-[#EAD6D6] text-[#541409] hover:bg-[#EAD6D6]/70'}
                  disabled:opacity-50
                `}
              >
                Mark as {statusLabels[status]}
              </button>
            ))}
        </div>
      )}

      {availableTransitions.length === 0 && !needsQuote && (
        <p className="text-sm text-[#541409]/60">No actions available for this status.</p>
      )}

      {/* Quick actions */}
      <div className="mt-6 pt-4 border-t border-[#EAD6D6]">
        <p className="text-sm text-[#541409]/60 mb-2">Quick Actions</p>
        <div className="space-y-2">
          <a
            href={`mailto:${orderId}@email`}
            className="block w-full px-4 py-2 text-sm bg-[#EAD6D6] text-[#541409] rounded-lg hover:bg-[#EAD6D6]/70 transition-colors text-center"
          >
            Email Customer
          </a>
        </div>
      </div>
    </div>
  );
}
