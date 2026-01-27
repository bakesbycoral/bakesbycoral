'use client';

import { useState } from 'react';

interface CouponData {
  code: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
}

interface CouponInputProps {
  orderType: string;
  onCouponApplied: (coupon: CouponData | null) => void;
  appliedCoupon: CouponData | null;
}

export function CouponInput({ orderType, onCouponApplied, appliedCoupon }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), orderType }),
      });

      const data = await response.json() as {
        valid: boolean;
        error?: string;
        coupon?: CouponData;
      };

      if (data.valid && data.coupon) {
        onCouponApplied(data.coupon);
        setError(null);
      } else {
        setError(data.error || 'Invalid coupon code');
      }
    } catch {
      setError('Failed to validate coupon');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    onCouponApplied(null);
    setCode('');
    setError(null);
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-medium text-green-800">{appliedCoupon.code}</span>
              <span className="text-green-700 ml-2">
                {appliedCoupon.discountType === 'percentage'
                  ? `${appliedCoupon.discountValue}% off`
                  : `$${(appliedCoupon.discountValue / 100).toFixed(2)} off`}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Remove
          </button>
        </div>
        {appliedCoupon.description && (
          <p className="text-sm text-green-700 mt-1">{appliedCoupon.description}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#541409] mb-2">
        Coupon Code
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="Enter coupon code"
          className="flex-1 px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50 uppercase"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isValidating || !code.trim()}
          className="px-4 py-3 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValidating ? 'Checking...' : 'Apply'}
        </button>
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
