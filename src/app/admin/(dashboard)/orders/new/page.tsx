'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CustomerSuggestion {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formData, setFormData] = useState({
    orderType: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupOrDelivery: 'pickup' as 'pickup' | 'delivery',
    deliveryAddress: '',
    pickupDate: '',
    pickupTime: '',
    totalAmount: '',
    notes: '',
  });

  const supportsDelivery = ['wedding', 'cookies_large'].includes(formData.orderType);
  const isDelivery = supportsDelivery && formData.pickupOrDelivery === 'delivery';
  const dateLabel = isDelivery ? 'Delivery Date' : 'Pickup Date';
  const timeLabel = isDelivery ? 'Delivery Time' : 'Pickup Time';

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json() as { customers: CustomerSuggestion[] };
        setSuggestions(data.customers);
        setShowSuggestions(data.customers.length > 0);
      }
    } catch {
      // Silently fail — autocomplete is non-critical
    }
  }, []);

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, customerName: value }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const selectSuggestion = (customer: CustomerSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      customerName: customer.name,
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
    }));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          pickup_or_delivery: supportsDelivery ? formData.pickupOrDelivery : undefined,
          delivery_address: isDelivery ? formData.deliveryAddress : undefined,
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
            <div className="relative" ref={suggestionsRef}>
              <label htmlFor="customerName" className="block text-sm font-medium text-[#541409] mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                required
                autoComplete="off"
                className="w-full px-4 py-3 border border-[#EAD6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]"
                value={formData.customerName}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#EAD6D6] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-[#EAD6D6]/30 text-[#541409] text-sm"
                      onClick={() => selectSuggestion(customer)}
                    >
                      <span className="font-medium">{customer.name}</span>
                      {customer.email && <span className="text-[#541409]/60 ml-2">{customer.email}</span>}
                      {customer.phone && <span className="text-[#541409]/60 ml-2">{customer.phone}</span>}
                    </button>
                  ))}
                </div>
              )}
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
              Phone
            </label>
            <input
              type="tel"
              id="customerPhone"
              className="w-full px-4 py-3 border border-[#EAD6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            />
          </div>

          {/* Pickup or Delivery (for wedding / large cookies) */}
          {supportsDelivery && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pickupOrDelivery" className="block text-sm font-medium text-[#541409] mb-2">
                  Pickup or Delivery
                </label>
                <select
                  id="pickupOrDelivery"
                  className="w-full px-4 py-3 border border-[#EAD6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]"
                  value={formData.pickupOrDelivery}
                  onChange={(e) => setFormData({ ...formData, pickupOrDelivery: e.target.value as 'pickup' | 'delivery' })}
                >
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery (+$75)</option>
                </select>
              </div>
              {isDelivery && (
                <div>
                  <label htmlFor="deliveryAddress" className="block text-sm font-medium text-[#541409] mb-2">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="deliveryAddress"
                    required
                    placeholder="Full delivery address"
                    className="w-full px-4 py-3 border border-[#EAD6D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}

          {/* Pickup/Delivery Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickupDate" className="block text-sm font-medium text-[#541409] mb-2">
                {dateLabel} <span className="text-red-500">*</span>
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
                {timeLabel} <span className="text-red-500">*</span>
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
