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

  const availableTransitions = statusTransitions[currentStatus] || [];
  const isInquiry = currentStatus === 'inquiry';
  // Quote-based order types should use the Quotes section instead of direct invoice
  const isQuoteBasedType = ['cake', 'cookies_large', 'wedding'].includes(orderType);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    setError('');

    try {
      const body: { status: string } = { status: newStatus };

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (data.success) {
        router.refresh();
      } else {
        setError(data.error || 'Failed to update status');
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

      {/* Hint for quote-based order types */}
      {isInquiry && isQuoteBasedType && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Use the <strong>Quotes & Invoices</strong> section below to create and send a quote to the customer.
          </p>
        </div>
      )}

      {/* Status transition buttons */}
      {availableTransitions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-[#541409]/60 mb-2">Update Status</p>
          {availableTransitions
            .filter((status) => !(isQuoteBasedType && status === 'pending_payment'))
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

      {availableTransitions.length === 0 && !(isInquiry && isQuoteBasedType) && (
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
