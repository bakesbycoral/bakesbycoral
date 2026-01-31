'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OrderStatusActions } from './OrderStatusActions';
import { OrderNotes } from './OrderNotes';
import { BalancePayment } from './BalancePayment';
import { OrderEditForm } from './OrderEditForm';
import { QuotesList } from './quotes';

interface Order {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: string | null;
  pickup_date: string | null;
  pickup_time: string | null;
  backup_date: string | null;
  backup_time: string | null;
  pickup_person_name: string | null;
  total_amount: number | null;
  deposit_amount: number | null;
  notes: string | null;
  form_data: string | null;
  stripe_session_id: string | null;
  stripe_payment_id: string | null;
  stripe_invoice_id: string | null;
  stripe_invoice_url: string | null;
  created_at: string;
  updated_at: string | null;
  paid_at: string | null;
  deposit_paid_at: string | null;
}

interface Note {
  id: number;
  order_id: string;
  note: string;
  created_by: string | null;
  created_at: string;
}

interface OrderDetailViewProps {
  order: Order;
  notes: Note[];
}

const statusColors: Record<string, string> = {
  inquiry: 'bg-blue-100 text-blue-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
  deposit_paid: 'bg-purple-100 text-purple-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-neutral-100 text-neutral-700',
  cancelled: 'bg-red-100 text-red-700',
};

const orderTypeLabels: Record<string, string> = {
  cookies: 'Cookies (1-3 Dozen)',
  cookies_large: 'Large Cookie Order (4+ Dozen)',
  cake: 'Custom Cake',
  wedding: 'Wedding',
  tasting: 'Tasting Order',
};

function formatCurrency(cents: number | null): string {
  if (cents === null) return '-';
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return '-';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function OrderDetailView({ order, notes }: OrderDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      router.push('/admin/orders');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete order');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formData = order.form_data ? JSON.parse(order.form_data) : {};

  // Calculate balance due
  const balanceDue = order.total_amount && order.deposit_amount
    ? order.total_amount - order.deposit_amount
    : null;
  const hasBalanceDue = balanceDue !== null && balanceDue > 0 && !!order.deposit_paid_at && !order.paid_at;

  if (isEditing) {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/orders" className="text-sm text-[#541409] hover:opacity-70 mb-2 inline-block">
              &larr; Back to Orders
            </Link>
            <h1 className="text-2xl font-bold text-[#541409]">Edit {order.order_number}</h1>
            <p className="text-[#541409]/60">{orderTypeLabels[order.order_type] || order.order_type}</p>
          </div>
        </div>

        <OrderEditForm
          order={order}
          onCancel={() => setIsEditing(false)}
          onSave={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/orders" className="text-sm text-[#541409] hover:opacity-70 mb-2 inline-block">
            &larr; Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-[#541409]">{order.order_number}</h1>
          <p className="text-[#541409]/60">{orderTypeLabels[order.order_type] || order.order_type}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 border border-[#541409] text-[#541409] rounded-lg hover:bg-[#EAD6D6]/30 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Order
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
          <span className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize ${statusColors[order.status] || 'bg-[#EAD6D6]'}`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
            <h2 className="font-semibold text-[#541409] mb-4">Customer Information</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-[#541409]/60">Name</dt>
                <dd className="font-medium text-[#541409]">{order.customer_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-[#541409]/60">Email</dt>
                <dd>
                  <a href={`mailto:${order.customer_email}`} className="font-medium text-[#541409] hover:opacity-70">
                    {order.customer_email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-[#541409]/60">Phone</dt>
                <dd>
                  <a href={`tel:${order.customer_phone}`} className="font-medium text-[#541409] hover:opacity-70">
                    {order.customer_phone}
                  </a>
                </dd>
              </div>
              {order.pickup_person_name && (
                <div>
                  <dt className="text-sm text-[#541409]/60">Pickup Person</dt>
                  <dd className="font-medium text-[#541409]">{order.pickup_person_name}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
            <h2 className="font-semibold text-[#541409] mb-4">Schedule</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {order.event_date && (
                <div>
                  <dt className="text-sm text-[#541409]/60">Event Date</dt>
                  <dd className="font-medium text-[#541409]">{formatDate(order.event_date)}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-[#541409]/60">Pickup Date</dt>
                <dd className="font-medium text-[#541409]">{formatDate(order.pickup_date)}</dd>
              </div>
              <div>
                <dt className="text-sm text-[#541409]/60">Pickup Time</dt>
                <dd className="font-medium text-[#541409]">{formatTime(order.pickup_time)}</dd>
              </div>
              {order.backup_date && (
                <>
                  <div>
                    <dt className="text-sm text-[#541409]/60">Backup Date</dt>
                    <dd className="text-[#541409]/80">{formatDate(order.backup_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-[#541409]/60">Backup Time</dt>
                    <dd className="text-[#541409]/80">{formatTime(order.backup_time)}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
            <h2 className="font-semibold text-[#541409] mb-4">Order Details</h2>
            {order.order_type === 'cookies' && (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-[#541409]/60">Flavors</dt>
                  <dd className="font-medium text-[#541409]">
                    {/* Support new flavor_counts format, cart_items format, and legacy flavors format */}
                    {formData.flavor_counts ? (
                      <ul className="space-y-1">
                        {Object.entries(formData.flavor_counts as Record<string, number>).map(([flavor, count]) => {
                          const flavorLabels: Record<string, string> = {
                            chocolate_chip: 'Chocolate Chip',
                            vanilla_bean_sugar: 'Vanilla Bean Sugar',
                            cherry_almond: 'Cherry Almond',
                            espresso_butterscotch: 'Espresso Butterscotch',
                            lemon_sugar: 'Lemon Sugar',
                          };
                          return (
                            <li key={flavor}>
                              {flavorLabels[flavor] || flavor}: {count} cookies
                            </li>
                          );
                        })}
                      </ul>
                    ) : formData.cart_items ? (
                      formData.cart_items.map((item: { flavor: string }, i: number) => {
                        const flavorLabels: Record<string, string> = {
                          chocolate_chip: 'Chocolate Chip',
                          vanilla_bean_sugar: 'Vanilla Bean Sugar',
                          cherry_almond: 'Cherry Almond',
                          espresso_butterscotch: 'Espresso Butterscotch',
                          lemon_sugar: 'Lemon Sugar',
                        };
                        return (
                          <span key={i}>
                            {i > 0 && ', '}
                            {flavorLabels[item.flavor] || item.flavor}
                          </span>
                        );
                      })
                    ) : (
                      formData.flavors?.join(', ') || '-'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-[#541409]/60">Quantity</dt>
                  <dd className="font-medium text-[#541409]">{formData.quantity} dozen</dd>
                </div>
                {formData.packaging && formData.packaging !== 'standard' && (
                  <div>
                    <dt className="text-sm text-[#541409]/60">Packaging</dt>
                    <dd className="font-medium text-[#541409] capitalize">
                      {formData.packaging === 'heat-sealed' ? 'Heat-Sealed (+$5/dozen)' : formData.packaging}
                    </dd>
                  </div>
                )}
              </dl>
            )}

            {order.order_type === 'cookies_large' && (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-[#541409]/60">Quantity</dt>
                  <dd className="font-medium text-[#541409]">{formData.quantity} dozen</dd>
                </div>
                <div>
                  <dt className="text-sm text-[#541409]/60">Flavor Mix</dt>
                  <dd className="text-[#541409]">{formData.flavor_mix || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[#541409]/60">Individual Wrap</dt>
                  <dd className="text-[#541409]">{formData.individual_wrap ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[#541409]/60">Event Type</dt>
                  <dd className="text-[#541409]">{formData.event_type || '-'}</dd>
                </div>
              </dl>
            )}

            {order.order_type === 'cake' && (
              <dl className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-[#541409]/60">Size</dt>
                    <dd className="font-medium text-[#541409]">{formData.size || formData.cake_size || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-[#541409]/60">Shape</dt>
                    <dd className="font-medium text-[#541409] capitalize">{formData.shape || 'Round'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-[#541409]/60">Flavor</dt>
                    <dd className="font-medium text-[#541409] capitalize">{formData.flavor || formData.cake_flavor || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-[#541409]/60">Filling</dt>
                    <dd className="font-medium text-[#541409] capitalize">{formData.filling?.replace('_', ' ') || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-[#541409]/60">Frosting</dt>
                    <dd className="font-medium text-[#541409] capitalize">{formData.frosting?.replace('_', ' ') || formData.buttercream?.replace('_', ' ') || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-[#541409]/60">Design Style</dt>
                    <dd className="font-medium text-[#541409] capitalize">{formData.design_style || '-'}</dd>
                  </div>
                </div>
                {formData.color_palette && (
                  <div>
                    <dt className="text-sm text-[#541409]/60">Color Palette</dt>
                    <dd className="text-[#541409]">{formData.color_palette}</dd>
                  </div>
                )}
                {(formData.design_notes || formData.design) && (
                  <div>
                    <dt className="text-sm text-[#541409]/60">Design Notes</dt>
                    <dd className="text-[#541409] whitespace-pre-wrap">{formData.design_notes || formData.design}</dd>
                  </div>
                )}
                {(formData.inspiration_links?.length > 0 || formData.inspiration) && (
                  <div>
                    <dt className="text-sm text-[#541409]/60 mb-1">Inspiration</dt>
                    <dd className="space-y-1">
                      {formData.inspiration_links?.map((link: string, i: number) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[#541409] hover:opacity-70 truncate"
                        >
                          {link}
                        </a>
                      ))}
                      {formData.inspiration && (
                        <p className="text-[#541409] whitespace-pre-wrap">{formData.inspiration}</p>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            )}

            {order.order_type === 'wedding' && (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-[#541409]/60">Services</dt>
                  <dd className="font-medium text-[#541409] capitalize">{formData.services_needed?.replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[#541409]/60">Guest Count</dt>
                  <dd className="font-medium text-[#541409]">{formData.guest_count}</dd>
                </div>
                {formData.venue_name && (
                  <div>
                    <dt className="text-sm text-[#541409]/60">Venue</dt>
                    <dd className="text-[#541409]">{formData.venue_name}</dd>
                  </div>
                )}
                {formData.theme && (
                  <div>
                    <dt className="text-sm text-[#541409]/60">Theme</dt>
                    <dd className="text-[#541409]">{formData.theme}</dd>
                  </div>
                )}
                {formData.color_palette && (
                  <div>
                    <dt className="text-sm text-[#541409]/60">Color Palette</dt>
                    <dd className="text-[#541409]">{formData.color_palette}</dd>
                  </div>
                )}
              </dl>
            )}

            {order.notes && (
              <div className="mt-4 pt-4 border-t border-[#EAD6D6]">
                <h3 className="text-sm font-medium text-[#541409]/60 mb-2">Customer Notes</h3>
                <p className="text-[#541409] whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Internal Notes */}
          <OrderNotes orderId={order.id} notes={notes} />

          {/* Quotes & Invoices - Show for large cookie orders, cakes, weddings */}
          {['cookies_large', 'cake', 'wedding'].includes(order.order_type) && (
            <QuotesList orderId={order.id} orderStatus={order.status} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <OrderStatusActions orderId={order.id} currentStatus={order.status} orderType={order.order_type} />

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
            <h2 className="font-semibold text-[#541409] mb-4">Payment</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-[#541409]/60">Total</dt>
                <dd className="font-semibold text-[#541409]">{formatCurrency(order.total_amount)}</dd>
              </div>
              {order.deposit_amount && order.deposit_amount !== order.total_amount && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-[#541409]/60">Deposit</dt>
                    <dd className="text-[#541409]">{formatCurrency(order.deposit_amount)}</dd>
                  </div>
                  {balanceDue !== null && balanceDue > 0 && (
                    <div className="flex justify-between pt-2 border-t border-[#EAD6D6]">
                      <dt className="text-[#541409]/60 font-medium">Balance Due</dt>
                      <dd className={`font-semibold ${hasBalanceDue ? 'text-[#541409]' : 'text-[#541409]'}`}>
                        {formatCurrency(balanceDue)}
                      </dd>
                    </div>
                  )}
                </>
              )}
              {order.stripe_invoice_url && (
                <div className="flex justify-between">
                  <dt className="text-[#541409]/60">Invoice</dt>
                  <dd>
                    <a
                      href={order.stripe_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#541409] hover:opacity-70 text-sm"
                    >
                      View Invoice
                    </a>
                  </dd>
                </div>
              )}
              {order.paid_at && (
                <div className="flex justify-between">
                  <dt className="text-[#541409]/60">Paid</dt>
                  <dd className="text-green-600">{formatDateTime(order.paid_at)}</dd>
                </div>
              )}
              {order.deposit_paid_at && !order.paid_at && (
                <div className="flex justify-between">
                  <dt className="text-[#541409]/60">Deposit Paid</dt>
                  <dd className="text-purple-600">{formatDateTime(order.deposit_paid_at)}</dd>
                </div>
              )}
            </dl>

            {/* Balance Payment Action */}
            <div className="mt-4 pt-4 border-t border-[#EAD6D6]">
              <BalancePayment
                orderId={order.id}
                balanceDue={balanceDue}
                canSendInvoice={hasBalanceDue}
                disabledReason={
                  !order.total_amount ? 'Set total amount first' :
                  !order.deposit_amount ? 'Set deposit amount first' :
                  !order.deposit_paid_at ? 'Deposit not paid yet' :
                  order.paid_at ? 'Already paid in full' :
                  balanceDue !== null && balanceDue <= 0 ? 'No balance remaining' :
                  undefined
                }
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
            <h2 className="font-semibold text-[#541409] mb-4">Timeline</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-[#541409]/60">Created</span>
                <span className="text-[#541409]">{formatDateTime(order.created_at)}</span>
              </li>
              {order.deposit_paid_at && (
                <li className="flex justify-between">
                  <span className="text-[#541409]/60">Deposit Paid</span>
                  <span className="text-[#541409]">{formatDateTime(order.deposit_paid_at)}</span>
                </li>
              )}
              {order.paid_at && (
                <li className="flex justify-between">
                  <span className="text-[#541409]/60">Paid in Full</span>
                  <span className="text-[#541409]">{formatDateTime(order.paid_at)}</span>
                </li>
              )}
              {order.updated_at && (
                <li className="flex justify-between">
                  <span className="text-[#541409]/60">Last Updated</span>
                  <span className="text-[#541409]">{formatDateTime(order.updated_at)}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-[#541409] mb-2">Delete Order?</h3>
            <p className="text-[#541409]/70 mb-6">
              Are you sure you want to delete order <strong>{order.order_number}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-[#541409] text-[#541409] rounded-lg hover:bg-[#EAD6D6]/30 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
