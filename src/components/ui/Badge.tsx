import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  default: 'bg-neutral-100 text-neutral-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// Helper function to get badge variant from order status
export function getStatusBadgeVariant(
  status: string
): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'paid_in_full':
    case 'pickup_confirmed':
      return 'success';
    case 'deposit_paid':
    case 'invoice_sent':
      return 'info';
    case 'quote_sent':
    case 'inquiry_received':
      return 'warning';
    case 'canceled':
      return 'error';
    default:
      return 'default';
  }
}

// Helper function to get display text for order status
export function getStatusDisplayText(status: string): string {
  const statusMap: Record<string, string> = {
    inquiry_received: 'Inquiry Received',
    quote_sent: 'Quote Sent',
    invoice_sent: 'Invoice Sent',
    deposit_paid: 'Deposit Paid',
    paid_in_full: 'Paid in Full',
    pickup_confirmed: 'Pickup Confirmed',
    completed: 'Completed',
    canceled: 'Canceled',
  };
  return statusMap[status] || status;
}
