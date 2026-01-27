import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDB } from '@/lib/db';
import { getOrderNotes } from '@/lib/db/notes';
import { OrderStatusActions } from '@/components/admin/OrderStatusActions';
import { OrderNotes } from '@/components/admin/OrderNotes';
import { BalancePayment } from '@/components/admin/BalancePayment';

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

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
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

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const db = getDB();

  const order = await db.prepare(`
    SELECT * FROM orders WHERE id = ?
  `).bind(id).first<Order>();

  if (!order) {
    notFound();
  }

  // Fetch notes for this order
  const notes = await getOrderNotes(order.id);

  const formData = order.form_data ? JSON.parse(order.form_data) : {};

  // Calculate balance due
  const balanceDue = order.total_amount && order.deposit_amount
    ? order.total_amount - order.deposit_amount
    : null;
  const hasBalanceDue = balanceDue !== null && balanceDue > 0 && order.deposit_paid_at && !order.paid_at;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/orders" className="text-sm text-neutral-500 hover:text-neutral-700 mb-2 inline-block">
            &larr; Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">{order.order_number}</h1>
          <p className="text-neutral-500">{orderTypeLabels[order.order_type] || order.order_type}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize ${statusColors[order.status] || 'bg-neutral-100'}`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Customer Information</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-neutral-500">Name</dt>
                <dd className="font-medium text-neutral-900">{order.customer_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Email</dt>
                <dd>
                  <a href={`mailto:${order.customer_email}`} className="font-medium text-amber-600 hover:text-amber-700">
                    {order.customer_email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Phone</dt>
                <dd>
                  <a href={`tel:${order.customer_phone}`} className="font-medium text-amber-600 hover:text-amber-700">
                    {order.customer_phone}
                  </a>
                </dd>
              </div>
              {order.pickup_person_name && (
                <div>
                  <dt className="text-sm text-neutral-500">Pickup Person</dt>
                  <dd className="font-medium text-neutral-900">{order.pickup_person_name}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Schedule</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {order.event_date && (
                <div>
                  <dt className="text-sm text-neutral-500">Event Date</dt>
                  <dd className="font-medium text-neutral-900">{formatDate(order.event_date)}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-neutral-500">Pickup Date</dt>
                <dd className="font-medium text-neutral-900">{formatDate(order.pickup_date)}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Pickup Time</dt>
                <dd className="font-medium text-neutral-900">{formatTime(order.pickup_time)}</dd>
              </div>
              {order.backup_date && (
                <>
                  <div>
                    <dt className="text-sm text-neutral-500">Backup Date</dt>
                    <dd className="text-neutral-700">{formatDate(order.backup_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-neutral-500">Backup Time</dt>
                    <dd className="text-neutral-700">{formatTime(order.backup_time)}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Order Details</h2>
            {order.order_type === 'cookies' && (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-neutral-500">Flavors</dt>
                  <dd className="font-medium text-neutral-900">
                    {formData.flavors?.join(', ') || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Quantity</dt>
                  <dd className="font-medium text-neutral-900">{formData.quantity} dozen</dd>
                </div>
              </dl>
            )}

            {order.order_type === 'cookies_large' && (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-neutral-500">Quantity</dt>
                  <dd className="font-medium text-neutral-900">{formData.quantity} dozen</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Flavor Mix</dt>
                  <dd className="text-neutral-900">{formData.flavor_mix || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Individual Wrap</dt>
                  <dd className="text-neutral-900">{formData.individual_wrap ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Event Type</dt>
                  <dd className="text-neutral-900">{formData.event_type || '-'}</dd>
                </div>
              </dl>
            )}

            {order.order_type === 'cake' && (
              <dl className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-neutral-500">Size</dt>
                    <dd className="font-medium text-neutral-900">{formData.size || formData.cake_size || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-neutral-500">Shape</dt>
                    <dd className="font-medium text-neutral-900 capitalize">{formData.shape || 'Round'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-neutral-500">Flavor</dt>
                    <dd className="font-medium text-neutral-900 capitalize">{formData.flavor || formData.cake_flavor || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-neutral-500">Filling</dt>
                    <dd className="font-medium text-neutral-900 capitalize">{formData.filling?.replace('_', ' ') || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-neutral-500">Frosting</dt>
                    <dd className="font-medium text-neutral-900 capitalize">{formData.frosting?.replace('_', ' ') || formData.buttercream?.replace('_', ' ') || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-neutral-500">Design Style</dt>
                    <dd className="font-medium text-neutral-900 capitalize">{formData.design_style || '-'}</dd>
                  </div>
                </div>
                {formData.color_palette && (
                  <div>
                    <dt className="text-sm text-neutral-500">Color Palette</dt>
                    <dd className="text-neutral-900">{formData.color_palette}</dd>
                  </div>
                )}
                {(formData.design_notes || formData.design) && (
                  <div>
                    <dt className="text-sm text-neutral-500">Design Notes</dt>
                    <dd className="text-neutral-900 whitespace-pre-wrap">{formData.design_notes || formData.design}</dd>
                  </div>
                )}
                {(formData.inspiration_links?.length > 0 || formData.inspiration) && (
                  <div>
                    <dt className="text-sm text-neutral-500 mb-1">Inspiration</dt>
                    <dd className="space-y-1">
                      {formData.inspiration_links?.map((link: string, i: number) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-amber-600 hover:text-amber-700 truncate"
                        >
                          {link}
                        </a>
                      ))}
                      {formData.inspiration && (
                        <p className="text-neutral-900 whitespace-pre-wrap">{formData.inspiration}</p>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            )}

            {order.order_type === 'wedding' && (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-neutral-500">Services</dt>
                  <dd className="font-medium text-neutral-900 capitalize">{formData.services_needed?.replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Guest Count</dt>
                  <dd className="font-medium text-neutral-900">{formData.guest_count}</dd>
                </div>
                {formData.venue_name && (
                  <div>
                    <dt className="text-sm text-neutral-500">Venue</dt>
                    <dd className="text-neutral-900">{formData.venue_name}</dd>
                  </div>
                )}
                {formData.theme && (
                  <div>
                    <dt className="text-sm text-neutral-500">Theme</dt>
                    <dd className="text-neutral-900">{formData.theme}</dd>
                  </div>
                )}
                {formData.color_palette && (
                  <div>
                    <dt className="text-sm text-neutral-500">Color Palette</dt>
                    <dd className="text-neutral-900">{formData.color_palette}</dd>
                  </div>
                )}
              </dl>
            )}

            {order.notes && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-medium text-neutral-500 mb-2">Customer Notes</h3>
                <p className="text-neutral-900 whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Internal Notes */}
          <OrderNotes orderId={order.id} notes={notes} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <OrderStatusActions orderId={order.id} currentStatus={order.status} orderType={order.order_type} />

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Payment</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Total</dt>
                <dd className="font-semibold text-neutral-900">{formatCurrency(order.total_amount)}</dd>
              </div>
              {order.deposit_amount && order.deposit_amount !== order.total_amount && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Deposit</dt>
                    <dd className="text-neutral-900">{formatCurrency(order.deposit_amount)}</dd>
                  </div>
                  {balanceDue !== null && balanceDue > 0 && (
                    <div className="flex justify-between pt-2 border-t">
                      <dt className="text-neutral-500 font-medium">Balance Due</dt>
                      <dd className={`font-semibold ${hasBalanceDue ? 'text-amber-600' : 'text-neutral-900'}`}>
                        {formatCurrency(balanceDue)}
                      </dd>
                    </div>
                  )}
                </>
              )}
              {order.stripe_invoice_url && (
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Invoice</dt>
                  <dd>
                    <a
                      href={order.stripe_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700 text-sm"
                    >
                      View Invoice
                    </a>
                  </dd>
                </div>
              )}
              {order.paid_at && (
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Paid</dt>
                  <dd className="text-green-600">{formatDateTime(order.paid_at)}</dd>
                </div>
              )}
              {order.deposit_paid_at && !order.paid_at && (
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Deposit Paid</dt>
                  <dd className="text-purple-600">{formatDateTime(order.deposit_paid_at)}</dd>
                </div>
              )}
            </dl>

            {/* Balance Payment Action */}
            {hasBalanceDue && (
              <div className="mt-4 pt-4 border-t">
                <BalancePayment
                  orderId={order.id}
                  balanceDue={balanceDue}
                />
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Timeline</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-neutral-500">Created</span>
                <span className="text-neutral-900">{formatDateTime(order.created_at)}</span>
              </li>
              {order.deposit_paid_at && (
                <li className="flex justify-between">
                  <span className="text-neutral-500">Deposit Paid</span>
                  <span className="text-neutral-900">{formatDateTime(order.deposit_paid_at)}</span>
                </li>
              )}
              {order.paid_at && (
                <li className="flex justify-between">
                  <span className="text-neutral-500">Paid in Full</span>
                  <span className="text-neutral-900">{formatDateTime(order.paid_at)}</span>
                </li>
              )}
              {order.updated_at && (
                <li className="flex justify-between">
                  <span className="text-neutral-500">Last Updated</span>
                  <span className="text-neutral-900">{formatDateTime(order.updated_at)}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
