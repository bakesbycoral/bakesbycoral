'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BalancePaymentProps {
  orderId: string;
  balanceDue: number;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function BalancePayment({ orderId, balanceDue }: BalancePaymentProps) {
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

      const data = await response.json();

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
          className="block w-full px-4 py-2 text-sm bg-amber-50 text-amber-700 rounded-lg text-center hover:bg-amber-100 transition-colors"
        >
          View Invoice
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-600">
        Request the remaining balance of <span className="font-semibold">{formatCurrency(balanceDue)}</span> from the customer.
      </p>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={handleCreateInvoice}
        disabled={isCreating}
        className="w-full px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed transition-colors"
      >
        {isCreating ? 'Sending Invoice...' : 'Request Balance Payment'}
      </button>
    </div>
  );
}
