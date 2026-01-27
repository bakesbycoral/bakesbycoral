'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewOrderPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    orderType: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupDate: '',
    pickupTime: '',
    totalAmount: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_type: formData.orderType,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          pickup_date: formData.pickupDate,
          pickup_time: formData.pickupTime,
          total_amount: formData.totalAmount ? Math.round(parseFloat(formData.totalAmount) * 100) : null,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || 'Failed to create order');
      }

      const data = await response.json() as { id: string };
      router.push(`/admin/orders/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/orders" className="text-[#541409] hover:opacity-70 text-sm mb-2 inline-block">
            &larr; Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-[#541409]">Add New Order</h1>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl border border-[#EAD6D6]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Type */}
          <div>
            <label htmlFor="orderType" className="block text-sm font-medium text-[#541409] mb-2">
              Order Type <span className="text-red-500">*</span>
            </label>
            <select
              id="orderType"
              required
              className="w-full px-4 py-3 border border-[#EAD6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]"
              value={formData.orderType}
              onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
            >
              <option value="">Select type...</option>
              <option value="cookies">Cookies</option>
              <option value="cookies_large">Large Cookies</option>
              <option value="cake">Cake</option>
              <option value="wedding">Wedding</option>
              <option value="tasting">Tasting Box</option>
            </select>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-[#541409] mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                required
                className="w-full px-4 py-3 border border-[#EAD6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium text-[#541409] mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="customerEmail"
                required
                className="w-full px-4 py-3 border border-[#EAD6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-[#541409] mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="customerPhone"
              required
              className="w-full px-4 py-3 border border-[#EAD6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            />
          </div>

          {/* Pickup Date/Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickupDate" className="block text-sm font-medium text-[#541409] mb-2">
                Pickup Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="pickupDate"
                required
                className="w-full px-4 py-3 border border-[#EAD6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]"
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="pickupTime" className="block text-sm font-medium text-[#541409] mb-2">
                Pickup Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="pickupTime"
                required
                className="w-full px-4 py-3 border border-[#EAD6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]"
                value={formData.pickupTime}
                onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
              />
            </div>
          </div>

          {/* Total Amount */}
          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-[#541409] mb-2">
              Total Amount ($)
            </label>
            <input
              type="number"
              id="totalAmount"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-4 py-3 border border-[#EAD6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
            />
            <p className="text-xs text-[#541409]/60 mt-1">Leave blank if quote pending</p>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-[#541409] mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              className="w-full px-4 py-3 border border-[#EAD6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409]"
              placeholder="Order details, special requests, etc."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Order'}
            </button>
            <Link
              href="/admin/orders"
              className="px-6 py-3 bg-[#EAD6D6] text-[#541409] rounded-lg hover:bg-[#EAD6D6]/70 transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
