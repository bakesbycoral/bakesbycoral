'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BalancePaymentProps {
  orderId: string;
  balanceDue: number | null;
  canSendInvoice: boolean;
  disabledReason?: string;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function BalancePayment({ orderId, balanceDue, canSendInvoice, disabledReason }: BalancePaymentProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [invoiceUrl, setInvoiceUrl] = useState('');

  const handleCreateInvoice = async () => {
    setIsCreating(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/balance-invoice`, {
        method: 'POST',
      });

      const data = await response.json() as { error?: string; invoiceUrl?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invoice');
      }

      if (data.invoiceUrl) {
        setInvoiceUrl(data.invoiceUrl);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsCreating(false);
    }
  };

  if (invoiceUrl) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-green-600 font-medium">
          Balance invoice sent!
        </p>
        <a
          href={invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-2 text-sm bg-[#EAD6D6]/30 text-[#541409] rounded-lg text-center hover:bg-[#EAD6D6]/50 transition-colors"
        >
          View Invoice
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {canSendInvoice && balanceDue ? (
        <p className="text-sm text-[#541409]/70">
          Request the remaining balance of <span className="font-semibold">{formatCurrency(balanceDue)}</span> from the customer.
        </p>
      ) : (
        <p className="text-sm text-[#541409]/50">
          {disabledReason || 'No balance due'}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={handleCreateInvoice}
        disabled={isCreating || !canSendInvoice}
        className="w-full px-4 py-2 text-sm bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {isCreating ? 'Sending Invoice...' : 'Request Balance Payment'}
      </button>
    </div>
  );
}
