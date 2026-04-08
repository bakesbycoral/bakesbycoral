'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OrderStatusActions } from './OrderStatusActions';
import { OrderNotes } from './OrderNotes';
import { BalancePayment } from './BalancePayment';
import { OrderEditForm } from './OrderEditForm';
import { QuotesList } from './quotes';
import { ContractsList } from './contracts';
import { formatDate, formatTime, formatDateTime } from '@/lib/dates';
import { getDisplayOrderTypeLabel, hasCookieCupsFormData, isCookieCakeFormData, parseOrderFormData } from '@/lib/orderTypeDisplay';

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
  inquiry: 'bg-[#ffd6ae] text-[#6b4020]',
  pending_payment: 'bg-[#fff2b5] text-[#5c5010]',
  deposit_paid: 'bg-[#cff3a8] text-[#2d5c1a]',
  confirmed: 'bg-[#c1ecf8] text-[#1a4a5c]',
  completed: 'bg-neutral-100 text-neutral-700',
  cancelled: 'bg-red-100 text-red-700',
};

const orderTypeColors: Record<string, string> = {
  cookies: 'bg-[#ffe3c6] text-[#704a20]',
  cookies_large: 'bg-[#f6f4d0] text-[#5c5a20]',
  cake: 'bg-[#e4f7bf] text-[#3d5c1a]',
  wedding: 'bg-[#d0f0ff] text-[#1a4a5c]',
  tasting: 'bg-[#d6e2ff] text-[#2a3a5c]',
  easter_collection: 'bg-[#fce4ec] text-[#5c1a2a]',
  cookie_cups: 'bg-[#fff3e0] text-[#5c3a1a]',
};

function formatCurrency(cents: number | null): string {
  if (cents === null) return '-';
  return `$${(cents / 100).toFixed(2)}`;
}


export function OrderDetailView({ order, notes }: OrderDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const router = useRouter();

  const handleRecordPayment = async (type: 'deposit' | 'full') => {
    setRecordingPayment(true);
    setPaymentError('');
    try {
      const newStatus = type === 'deposit' ? 'deposit_paid' : 'confirmed';
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          record_deposit_paid: type === 'deposit' || type === 'full',
          record_full_payment: type === 'full',
        }),
      });
      const data = await response.json() as { success?: boolean; error?: string };
      if (data.success) {
        router.refresh();
      } else {
        setPaymentError(data.error || 'Failed to record payment');
      }
    } catch {
      setPaymentError('Something went wrong');
    } finally {
      setRecordingPayment(false);
    }
  };

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

  const formData = parseOrderFormData(order.form_data) as Record<string, any>;
  const displayOrderTypeLabel = getDisplayOrderTypeLabel(order.order_type, formData);

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
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${orderTypeColors[order.order_type] || 'bg-[#EAD6D6] text-[#541409]'}`}>
              {displayOrderTypeLabel}
            </span>
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
      <div className="mb-6 md:mb-8">
        <Link href="/admin/orders" className="text-sm text-[#541409] hover:opacity-70 mb-2 inline-block">
          &larr; Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#541409]">{order.order_number}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${orderTypeColors[order.order_type] || 'bg-[#EAD6D6] text-[#541409]'}`}>
                {displayOrderTypeLabel}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-lg capitalize ${statusColors[order.status] || 'bg-[#EAD6D6]'}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 md:px-4 py-2 border border-[#541409] text-[#541409] rounded-lg hover:bg-[#EAD6D6]/30 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="hidden sm:inline">Edit Order</span>
              <span className="sm:hidden">Edit</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 md:px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
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
              {formData.pickup_or_delivery === 'delivery' && (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-[#541409]/60">Fulfillment</dt>
                  <dd className="font-medium text-[#541409]">Delivery</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-[#541409]/60">{formData.pickup_or_delivery === 'delivery' ? 'Delivery Date' : 'Pickup Date'}</dt>
                <dd className="font-medium text-[#541409]">{formatDate(order.pickup_date)}</dd>
              </div>
              <div>
                <dt className="text-sm text-[#541409]/60">{formData.pickup_or_delivery === 'delivery' ? 'Delivery Time' : 'Pickup Time'}</dt>
                <dd className="font-medium text-[#541409]">{formatTime(order.pickup_time)}</dd>
              </div>
              {formData.pickup_or_delivery === 'delivery' && formData.delivery_address && (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-[#541409]/60">Delivery Address</dt>
                  <dd className="font-medium text-[#541409]">{formData.delivery_address}</dd>
                </div>
              )}
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
            {order.order_type === 'cookies' && (() => {
              const flavorLabels: Record<string, string> = {
                chocolate_chip: 'Chocolate Chip',
                vanilla_bean_sugar: 'Vanilla Bean Sugar',
                cherry_almond: 'Cherry Almond',
                espresso_butterscotch: 'Espresso Butterscotch',
                lemon_sugar: 'Lemon Sugar',
                key_lime_pie: 'Key Lime Pie',
                blueberry_muffin: 'Blueberry Muffin',
                white_chocolate_raspberry: 'White Chocolate Raspberry',
                lemon_sugar_sandwiches: 'Lemon Sugar Sandwiches',
              };
              return (
              <dl className="space-y-3">
                {formData.spring_box && (
                  <div>
                    <dt className="text-sm text-[#541409]/60">Spring Cookie Box</dt>
                    <dd className="font-medium text-[#541409]">
                      <span className="inline-block px-2 py-0.5 bg-[#541409] text-[#EAD6D6] rounded text-xs mr-2">SEASONAL</span>
                      12 pieces — 3 each of Key Lime Pie, Blueberry Muffin, White Chocolate Raspberry, Lemon Sugar Sandwiches ($35)
                    </dd>
                  </div>
                )}
                {formData.flavor_counts && Object.keys(formData.flavor_counts).length > 0 && (
                  <div>
                    <dt className="text-sm text-[#541409]/60">{formData.spring_box ? 'Build Your Own Flavors' : 'Flavors'}</dt>
                    <dd className="font-medium text-[#541409]">
                      <ul className="space-y-1">
                        {Object.entries(formData.flavor_counts as Record<string, number>).map(([flavor, count]) => (
                          <li key={flavor}>
                            {flavorLabels[flavor] || flavor}: {count} cookies
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
                {!formData.flavor_counts && formData.cart_items && (
                  <div>
                    <dt className="text-sm text-[#541409]/60">Flavors</dt>
                    <dd className="font-medium text-[#541409]">
                      {formData.cart_items.map((item: { flavor: string }, i: number) => (
                        <span key={i}>
                          {i > 0 && ', '}
                          {flavorLabels[item.flavor] || item.flavor}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {!formData.flavor_counts && !formData.cart_items && formData.flavors && (
                  <div>
                    <dt className="text-sm text-[#541409]/60">Flavors</dt>
                    <dd className="font-medium text-[#541409]">{formData.flavors.join(', ')}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-[#541409]/60">Quantity</dt>
                  <dd className="font-medium text-[#541409]">
                    {formData.quantity} dozen
                    {formData.spring_box && formData.byo_quantity > 0 && (
                      <span className="text-[#541409]/60 text-sm ml-1">(Spring Box + {formData.byo_quantity} dozen build your own)</span>
                    )}
                  </dd>
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
              );
            })()}

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
                    <dt className="text-sm text-[#541409]/60 mb-1">Inspiration Links</dt>
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
                {formData.inspiration_image_urls?.length > 0 && (
                  <div>
                    <dt className="text-sm text-[#541409]/60 mb-2">Inspiration Photos ({formData.inspiration_image_urls.length})</dt>
                    <dd className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {formData.inspiration_image_urls.map((url: string, i: number) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block aspect-square rounded-lg overflow-hidden border border-[#EAD6D6] hover:border-[#541409] transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Inspiration photo ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
                {formData.inspiration_image_count > 0 && !formData.inspiration_image_urls?.length && (
                  <div>
                    <dt className="text-sm text-[#541409]/60">Inspiration Photos</dt>
                    <dd className="text-[#541409]/60 italic">
                      {formData.inspiration_image_count} photo(s) were uploaded but not stored (submitted before image storage was enabled)
                    </dd>
                  </div>
                )}
                {formData.add_half_dozen_cookies && (
                  <div className="pt-2 border-t border-[#EAD6D6]">
                    <dt className="text-sm text-[#541409]/60">Add-On</dt>
                    <dd className="font-medium text-[#541409]">Half Dozen Cookies ($14) — {formData.cookie_flavor}</dd>
                  </div>
                )}
              </dl>
            )}

            {order.order_type === 'cookie_cups' && (
              <dl className="space-y-3">
                {formData.product_type === 'cookie_cups_and_cake' ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm text-[#541409]/60">Cookie Cups Quantity</dt>
                        <dd className="font-medium text-[#541409]">{String(formData.quantity || '-')} cookie cups</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-[#541409]/60">Event Type</dt>
                        <dd className="font-medium text-[#541409] capitalize">{String(formData.event_type || '-').replace('-', ' ')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-[#541409]/60">Cookie Cake Size</dt>
                        <dd className="font-medium text-[#541409]">{String(formData.size || '-')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-[#541409]/60">Cookie Cake Shape</dt>
                        <dd className="font-medium text-[#541409] capitalize">{String(formData.shape || '-')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-[#541409]/60">Cookie Cake Layers</dt>
                        <dd className="font-medium text-[#541409]">{String(formData.layers || '-')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-[#541409]/60">Cookie Cake Servings</dt>
                        <dd className="font-medium text-[#541409]">{String(formData.servings || '-')}</dd>
                      </div>
                    </div>
                    <div>
                      <dt className="text-sm text-[#541409]/60">Cookie Cup Add-Ons</dt>
                      <dd className="text-[#541409]">
                        {[
                          formData.chocolate_molds ? 'Chocolate Molds' : '',
                          formData.edible_glitter ? 'Edible Glitter' : '',
                        ].filter(Boolean).join(', ') || 'None'}
                      </dd>
                    </div>
                    {formData.colors && (
                      <div>
                        <dt className="text-sm text-[#541409]/60">Cookie Cup Colors</dt>
                        <dd className="text-[#541409]">{String(formData.colors)}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm text-[#541409]/60">Cookie Cake Design</dt>
                      <dd className="text-[#541409]">
                        Base: {String(formData.base_color || '-')} | Piping: {String(formData.piping_colors || '-')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-[#541409]/60">Cookie Cake Message</dt>
                      <dd className="text-[#541409]">
                        {String(formData.custom_messaging || '-')} {formData.message_style ? `(${String(formData.message_style).replace('-', ' ')})` : ''}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-[#541409]/60">Cookie Cake Add-Ons</dt>
                      <dd className="text-[#541409]">
                        {Array.isArray(formData.toppings) && formData.toppings.length > 0
                          ? (formData.toppings as string[]).map((item) => item.replace(/-/g, ' ')).join(', ')
                          : 'None'}
                      </dd>
                    </div>
                    {formData.design_details && (
                      <div>
                        <dt className="text-sm text-[#541409]/60">Design Notes</dt>
                        <dd className="text-[#541409] whitespace-pre-wrap">{String(formData.design_details)}</dd>
                      </div>
                    )}
                    {formData.allergies && (
                      <div>
                        <dt className="text-sm text-[#541409]/60">Allergies</dt>
                        <dd className="text-[#541409]">{String(formData.allergies)}</dd>
                      </div>
                    )}
                    {formData.how_did_you_hear && (
                      <div>
                        <dt className="text-sm text-[#541409]/60">How Did They Hear About Us</dt>
                        <dd className="text-[#541409]">{String(formData.how_did_you_hear)}</dd>
                      </div>
                    )}
                  </>
                ) : isCookieCakeFormData(formData) ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm text-[#541409]/60">Size</dt>
                        <dd className="font-medium text-[#541409]">{String(formData.size || '-')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-[#541409]/60">Shape</dt>
                        <dd className="font-medium text-[#541409] capitalize">{String(formData.shape || '-')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-[#541409]/60">Layers</dt>
                        <dd className="font-medium text-[#541409]">{String(formData.layers || '-')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-[#541409]/60">Servings</dt>
                        <dd className="font-medium text-[#541409]">{String(formData.servings || '-')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-[#541409]/60">Flavor</dt>
                        <dd className="font-medium text-[#541409] capitalize">{String(formData.flavor || 'chocolate-chip').replace('-', ' ')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-[#541409]/60">Event Type</dt>
                        <dd className="font-medium text-[#541409] capitalize">{String(formData.event_type || '-').replace('-', ' ')}</dd>
                      </div>
                    </div>
                    <div>
                      <dt className="text-sm text-[#541409]/60">Design</dt>
                      <dd className="text-[#541409]">
                        Base: {String(formData.base_color || '-')} | Piping: {String(formData.piping_colors || '-')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-[#541409]/60">Custom Message</dt>
                      <dd className="text-[#541409]">
                        {String(formData.custom_messaging || '-')} {formData.message_style ? `(${String(formData.message_style).replace('-', ' ')})` : ''}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-[#541409]/60">Add-Ons</dt>
                      <dd className="text-[#541409]">
                        {Array.isArray(formData.toppings) && formData.toppings.length > 0
                          ? (formData.toppings as string[]).map((item) => item.replace(/-/g, ' ')).join(', ')
                          : 'None'}
                      </dd>
                    </div>
                    {formData.design_details && (
                      <div>
                        <dt className="text-sm text-[#541409]/60">Design Notes</dt>
                        <dd className="text-[#541409] whitespace-pre-wrap">{String(formData.design_details)}</dd>
                      </div>
                    )}
                    {formData.allergies && (
                      <div>
                        <dt className="text-sm text-[#541409]/60">Allergies</dt>
                        <dd className="text-[#541409]">{String(formData.allergies)}</dd>
                      </div>
                    )}
                    {formData.how_did_you_hear && (
                      <div>
                        <dt className="text-sm text-[#541409]/60">How Did They Hear About Us</dt>
                        <dd className="text-[#541409]">{String(formData.how_did_you_hear)}</dd>
                      </div>
                    )}
                  </>
                ) : hasCookieCupsFormData(formData) ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm text-[#541409]/60">Quantity</dt>
                        <dd className="font-medium text-[#541409]">{String(formData.quantity || '-')} cookie cups</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-[#541409]/60">Event Type</dt>
                        <dd className="font-medium text-[#541409] capitalize">{String(formData.event_type || '-').replace(/-/g, ' ')}</dd>
                      </div>
                    </div>
                    <div>
                      <dt className="text-sm text-[#541409]/60">Add-Ons</dt>
                      <dd className="text-[#541409]">
                        {[
                          formData.chocolate_molds ? 'Chocolate Molds (+$4/dozen)' : '',
                          formData.edible_glitter ? 'Edible Glitter (+$2/dozen)' : '',
                        ].filter(Boolean).join(', ') || 'None'}
                      </dd>
                    </div>
                    {formData.colors && (
                      <div>
                        <dt className="text-sm text-[#541409]/60">Custom Colors</dt>
                        <dd className="text-[#541409]">{String(formData.colors)}</dd>
                      </div>
                    )}
                    {formData.design_details && (
                      <div>
                        <dt className="text-sm text-[#541409]/60">Design Details</dt>
                        <dd className="text-[#541409] whitespace-pre-wrap">{String(formData.design_details)}</dd>
                      </div>
                    )}
                    {formData.occasion && (
                      <div>
                        <dt className="text-sm text-[#541409]/60">Occasion</dt>
                        <dd className="text-[#541409]">{String(formData.occasion)}</dd>
                      </div>
                    )}
                    {formData.allergies && (
                      <div>
                        <dt className="text-sm text-[#541409]/60">Allergies</dt>
                        <dd className="text-[#541409]">{String(formData.allergies)}</dd>
                      </div>
                    )}
                    {formData.how_did_you_hear && (
                      <div>
                        <dt className="text-sm text-[#541409]/60">How Did They Hear About Us</dt>
                        <dd className="text-[#541409]">{String(formData.how_did_you_hear)}</dd>
                      </div>
                    )}
                  </>
                ) : null}

                {Array.isArray(formData.inspiration_image_urls) && formData.inspiration_image_urls.length > 0 && (
                  <div>
                    <dt className="text-sm text-[#541409]/60 mb-2">Inspiration Photos ({formData.inspiration_image_urls.length})</dt>
                    <dd className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(formData.inspiration_image_urls as string[]).map((url: string, i: number) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block aspect-square rounded-lg overflow-hidden border border-[#EAD6D6] hover:border-[#541409] transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Inspiration photo ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            )}

            {order.order_type === 'wedding' && (() => {
              const cake = formData.cake as Record<string, unknown> | undefined;
              const cookies = formData.cookies as Record<string, unknown> | undefined;
              const tiered = formData.tiered_cake as Record<string, unknown> | undefined;
              const services = String(formData.services_needed || '').split(',').map((s: string) => s.trim().replace(/_/g, ' ')).filter(Boolean);
              const renderField = (label: string, value: unknown): React.ReactNode => value ? (
                <div>
                  <dt className="text-sm text-[#541409]/60">{label}</dt>
                  <dd className="font-medium text-[#541409] capitalize">{String(value).replace(/_/g, ' ').replace(/-/g, ' ')}</dd>
                </div>
              ) : null as React.ReactNode;
              const renderImages = (urls: string[] | undefined, count: number | undefined) => (
                <>
                  {urls && urls.length > 0 && (
                    <div>
                      <dt className="text-sm text-[#541409]/60 mb-2">Inspiration Photos ({urls.length})</dt>
                      <dd className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {urls.map((url: string, i: number) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-[#EAD6D6] hover:border-[#541409] transition-colors">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Inspiration photo ${i + 1}`} className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </dd>
                    </div>
                  )}
                  {count && count > 0 && (!urls || urls.length === 0) && (
                    <div>
                      <dt className="text-sm text-[#541409]/60">Inspiration Photos</dt>
                      <dd className="text-[#541409]/60 italic">{count} photo(s) uploaded</dd>
                    </div>
                  )}
                </>
              );
              return (
              <dl className="space-y-3">
                {/* General Info */}
                {renderField('Services', services.join(', ') || null)}
                {renderField('Partner Name', formData.partner_name as string)}
                {renderField('Guest Count', formData.guest_count as string)}
                {renderField('Venue', formData.venue_name as string)}
                {renderField('Venue Address', formData.venue_address as string)}
                {renderField('Start Time', formData.start_time as string)}
                {renderField('On-Site Contact', formData.onsite_contact as string)}
                {renderField('Pickup / Delivery', formData.pickup_or_delivery as string)}
                {renderField('Setup Requirements', formData.setup_requirements as string)}

                {/* Cutting Cake */}
                {cake && (cake.size as string || cake.flavor as string) && (
                  <>
                    <div className="pt-3 border-t border-[#EAD6D6]">
                      <dt className="text-sm font-semibold text-[#541409]">Cutting Cake</dt>
                    </div>
                    {renderField('Size', cake.size)}
                    {renderField('Shape', cake.shape)}
                    {renderField('Flavor', cake.flavor)}
                    {renderField('Filling', cake.filling)}
                    {renderField('Base Color', cake.base_color)}
                    {renderField('Piping Colors', cake.piping_colors)}
                    {renderField('Message', cake.custom_messaging)}
                    {renderField('Message Style', cake.message_style)}
                    {Array.isArray(cake.toppings) && cake.toppings.length > 0 && renderField('Toppings', (cake.toppings as string[]).join(', '))}
                  </>
                )}

                {/* Tiered Wedding Cake */}
                {tiered && (tiered.tiers as string || tiered.size as string) && (
                  <>
                    <div className="pt-3 border-t border-[#EAD6D6]">
                      <dt className="text-sm font-semibold text-[#541409]">Tiered Wedding Cake</dt>
                    </div>
                    {renderField('Tiers', tiered.tiers)}
                    {renderField('Size', tiered.size)}
                    {renderField('Shape', tiered.shape)}
                    {(() => {
                      const flavors = tiered.flavors as Record<string, string> | undefined;
                      const fillings = tiered.fillings as Record<string, string> | undefined;
                      return (
                        <>
                          {flavors && Object.entries(flavors).map(([tier, flavor]) => flavor ? (
                            <div key={`flavor-${tier}`}>
                              <dt className="text-sm text-[#541409]/60">{tier.replace('tier', 'Tier ')} Flavor</dt>
                              <dd className="font-medium text-[#541409] capitalize">{flavor.replace(/-/g, ' ')}</dd>
                            </div>
                          ) : null)}
                          {fillings && Object.entries(fillings).map(([tier, filling]) => filling ? (
                            <div key={`filling-${tier}`}>
                              <dt className="text-sm text-[#541409]/60">{tier.replace('tier', 'Tier ')} Filling</dt>
                              <dd className="font-medium text-[#541409] capitalize">{filling.replace(/-/g, ' ')}</dd>
                            </div>
                          ) : null)}
                        </>
                      );
                    })()}
                    {renderField('Base Color', tiered.base_color)}
                    {renderField('Piping Colors', tiered.piping_colors)}
                    {renderField('Message', tiered.messaging)}
                    {renderField('Message Style', tiered.message_style)}
                    {Array.isArray(tiered.toppings) && tiered.toppings.length > 0 && renderField('Toppings', (tiered.toppings as string[]).join(', '))}
                    {renderField('Design Notes', tiered.design_notes)}
                    {renderImages(tiered.inspiration_image_urls as string[] | undefined, tiered.inspiration_image_count as number | undefined)}
                  </>
                )}

                {/* Cookies */}
                {cookies && (cookies.quantity as string || cookies.packaging as string) && (
                  <>
                    <div className="pt-3 border-t border-[#EAD6D6]">
                      <dt className="text-sm font-semibold text-[#541409]">Cookies</dt>
                    </div>
                    {renderField('Quantity', cookies.quantity ? `${cookies.quantity} dozen` : null)}
                    {renderField('Packaging', cookies.packaging)}
                    {(() => {
                      const flavors = cookies.flavors as Record<string, number> | undefined;
                      if (!flavors) return null;
                      const selected = Object.entries(flavors).filter(([, v]) => v > 0);
                      if (selected.length === 0) return null;
                      return (
                        <div>
                          <dt className="text-sm text-[#541409]/60">Flavors</dt>
                          <dd className="font-medium text-[#541409]">
                            <ul className="space-y-0.5">
                              {selected.map(([flavor, count]) => (
                                <li key={flavor}>{flavor.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}: {count}</li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* Cookie Cups */}
                {(() => {
                  const cups = formData.cookie_cups as Record<string, unknown> | undefined;
                  if (!cups || !cups.quantity) return null;
                  return (
                    <>
                      <div className="pt-3 border-t border-[#EAD6D6]">
                        <dt className="text-sm font-semibold text-[#541409]">Cookie Cups</dt>
                      </div>
                      {renderField('Quantity', `${cups.quantity} dozen`)}
                      {cups.chocolate_molds && renderField('Chocolate Molds', 'Yes')}
                      {cups.edible_glitter && renderField('Edible Glitter', 'Yes')}
                      {renderField('Notes', cups.notes as string)}
                      {renderImages(cups.inspiration_image_urls as string[] | undefined, cups.inspiration_image_count as number | undefined)}
                    </>
                  );
                })()}

                {/* Additional Info */}
                {renderField('Dietary Restrictions', formData.dietary_restrictions as string)}
                {renderField('How They Found Us', formData.how_found_us as string)}

                {/* Main Inspiration Photos */}
                {renderImages(formData.inspiration_image_urls, formData.inspiration_image_count)}
              </dl>
              );
            })()}

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

          {/* Wedding Contracts - Show for wedding orders only */}
          {order.order_type === 'wedding' && (
            <ContractsList orderId={order.id} orderStatus={order.status} />
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
                  {balanceDue !== null && balanceDue > 0 && !order.paid_at && (
                    <div className="flex justify-between pt-2 border-t border-[#EAD6D6]">
                      <dt className="text-[#541409]/60 font-medium">Balance Due</dt>
                      <dd className="font-semibold text-[#541409]">
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

            {/* Balance Payment Action (Stripe invoice) */}
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

            {/* Manual Payment Recording (cash, Venmo, etc.) */}
            {!order.paid_at && (
              <div className="mt-4 pt-4 border-t border-[#EAD6D6]">
                <p className="text-sm text-[#541409]/60 mb-2">Record Manual Payment</p>
                <p className="text-xs text-[#541409]/50 mb-3">For cash, Venmo, Zelle, or other payment methods</p>
                {paymentError && (
                  <p className="text-sm text-red-600 mb-2">{paymentError}</p>
                )}
                <div className="space-y-2">
                  {!order.deposit_paid_at && (
                    <button
                      onClick={() => handleRecordPayment('deposit')}
                      disabled={recordingPayment}
                      className="w-full px-4 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {recordingPayment ? 'Recording...' : `Record Deposit Paid${order.deposit_amount ? ` (${formatCurrency(order.deposit_amount)})` : ''}`}
                    </button>
                  )}
                  <button
                    onClick={() => handleRecordPayment('full')}
                    disabled={recordingPayment}
                    className="w-full px-4 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {recordingPayment ? 'Recording...' : `Record Paid in Full${order.total_amount ? ` (${formatCurrency(order.total_amount)})` : ''}`}
                  </button>
                </div>
              </div>
            )}
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
