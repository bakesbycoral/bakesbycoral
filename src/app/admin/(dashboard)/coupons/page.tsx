'use client';

import { useState, useEffect } from 'react';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string | null;
  valid_until: string | null;
  order_types: string | null;
  is_active: number;
  created_at: string;
}

const ORDER_TYPE_OPTIONS = [
  { value: 'cookies', label: 'Cookies (1-3 dozen)' },
  { value: 'cookies_large', label: 'Large Cookie Orders' },
  { value: 'cake', label: 'Cakes' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'tasting', label: 'Tasting Box' },
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    valid_from: '',
    valid_until: '',
    order_types: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/admin/coupons');
      const data = await response.json() as { coupons?: Coupon[] };
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          description: formData.description || null,
          discount_type: formData.discount_type,
          discount_value: formData.discount_type === 'percentage'
            ? parseInt(formData.discount_value)
            : Math.round(parseFloat(formData.discount_value) * 100),
          min_order_amount: formData.min_order_amount
            ? Math.round(parseFloat(formData.min_order_amount) * 100)
            : 0,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          valid_from: formData.valid_from || null,
          valid_until: formData.valid_until || null,
          order_types: formData.order_types.length > 0 ? formData.order_types : null,
        }),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (data.success) {
        setShowForm(false);
        setFormData({
          code: '',
          description: '',
          discount_type: 'percentage',
          discount_value: '',
          min_order_amount: '',
          max_uses: '',
          valid_from: '',
          valid_until: '',
          order_types: [],
        });
        fetchCoupons();
      } else {
        setError(data.error || 'Failed to create coupon');
      }
    } catch {
      setError('Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCouponActive = async (coupon: Coupon) => {
    try {
      await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: coupon.id, is_active: !coupon.is_active }),
      });
      fetchCoupons();
    } catch (err) {
      console.error('Failed to toggle coupon:', err);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      fetchCoupons();
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% off`;
    }
    return `$${(coupon.discount_value / 100).toFixed(2)} off`;
  };

  const formatOrderTypes = (orderTypes: string | null) => {
    if (!orderTypes) return 'All orders';
    try {
      const types = JSON.parse(orderTypes) as string[];
      return types.map(t => ORDER_TYPE_OPTIONS.find(o => o.value === t)?.label || t).join(', ');
    } catch {
      return 'All orders';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#541409]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-[#541409]">Coupons</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity"
        >
          {showForm ? 'Cancel' : '+ Create'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-[#EAD6D6]">
          <h2 className="font-semibold text-[#541409] mb-4">Create New Coupon</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="e.g., SAVE10"
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409] uppercase"
                />
              </div>
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Summer sale discount"
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Discount Type *</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">
                  Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '($)'}
                </label>
                <input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  required
                  min="0"
                  step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                  max={formData.discount_type === 'percentage' ? '100' : undefined}
                  placeholder={formData.discount_type === 'percentage' ? 'e.g., 10' : 'e.g., 5.00'}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Minimum Order ($)</label>
                <input
                  type="number"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Max Uses (leave blank for unlimited)</label>
                <input
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  min="1"
                  placeholder="Unlimited"
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Valid From</label>
                <input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Valid Until</label>
                <input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-2">Valid For (leave all unchecked for all order types)</label>
              <div className="flex flex-wrap gap-3">
                {ORDER_TYPE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.order_types.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, order_types: [...formData.order_types, option.value] });
                        } else {
                          setFormData({ ...formData, order_types: formData.order_types.filter(t => t !== option.value) });
                        }
                      }}
                      className="w-4 h-4 text-[#541409] border-[#EAD6D6] rounded focus:ring-[#541409]"
                    />
                    <span className="text-sm text-[#541409]">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Coupon'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-[#EAD6D6] text-[#541409] rounded-lg hover:bg-[#EAD6D6]/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EAD6D6] overflow-hidden">
        {coupons.length === 0 ? (
          <div className="p-8 text-center text-[#541409]/60">
            <p>No coupons created yet.</p>
            <p className="text-sm mt-1">Create your first coupon to offer discounts to customers.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAD6D6]">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="p-4 hover:bg-[#EAD6D6]/10 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
                      <span className="font-mono font-bold text-[#541409] text-base md:text-lg">
                        {coupon.code}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        coupon.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-[#EAD6D6] text-[#541409]">
                        {formatDiscount(coupon)}
                      </span>
                    </div>
                    {coupon.description && (
                      <p className="text-sm text-[#541409]/70 mb-2">{coupon.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 md:gap-x-4 gap-y-1 text-xs text-[#541409]/60">
                      <span>Used: {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ''}</span>
                      {coupon.min_order_amount > 0 && (
                        <span>Min: ${(coupon.min_order_amount / 100).toFixed(2)}</span>
                      )}
                      {coupon.valid_from && <span>From: {coupon.valid_from}</span>}
                      {coupon.valid_until && <span>Until: {coupon.valid_until}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCouponActive(coupon)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        coupon.is_active
                          ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {coupon.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteCoupon(coupon.id)}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
