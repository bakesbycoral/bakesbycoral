'use client';

import type { QuoteStatus } from '@/types';

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
}

const statusConfig: Record<QuoteStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700',
  },
  sent: {
    label: 'Sent',
    className: 'bg-blue-100 text-blue-700',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-700',
  },
  expired: {
    label: 'Expired',
    className: 'bg-red-100 text-red-700',
  },
  converted: {
    label: 'Converted',
    className: 'bg-purple-100 text-purple-700',
  },
};

export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
