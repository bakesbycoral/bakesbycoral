'use client';

import type { ContractStatus } from '@/types';

interface ContractStatusBadgeProps {
  status: ContractStatus;
}

const statusConfig: Record<ContractStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700',
  },
  sent: {
    label: 'Sent',
    className: 'bg-blue-100 text-blue-700',
  },
  signed: {
    label: 'Signed',
    className: 'bg-green-100 text-green-700',
  },
  expired: {
    label: 'Expired',
    className: 'bg-red-100 text-red-700',
  },
};

export function ContractStatusBadge({ status }: ContractStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
