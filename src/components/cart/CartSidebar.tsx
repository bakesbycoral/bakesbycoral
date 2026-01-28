'use client';

import { useCart } from './CartContext';
import { PRICE_PER_DOZEN, HEAT_SEAL_FEE } from '@/types/cart';

interface CartSidebarProps {
  onCheckout: () => void;
}

export function CartSidebar({ onCheckout }: CartSidebarProps) {
  const {
    dozens,
    flavors,
    packaging,
    setDozens,
    clearFlavors,
    setPackaging,
    totalCookies,
    targetCookies,
    remainingCookies,
    isComplete,
  } = useCart();

  const subtotal = dozens ? dozens * PRICE_PER_DOZEN : 0;
  const packagingFee = packaging === 'heat-sealed' && dozens ? dozens * HEAT_SEAL_FEE : 0;
  const total = subtotal + packagingFee;

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#EAD6D6] p-5 lg:sticky lg:top-6">
      <h2 className="text-lg font-serif text-[#541409] mb-4">Your Order</h2>

      {/* Dozen Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#541409] mb-2">
          How many dozen?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([1, 2, 3] as const).map((num) => (
            <button
              key={num}
              onClick={() => setDozens(num)}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                dozens === num
                  ? 'bg-[#541409] text-[#EAD6D6]'
                  : 'border border-[#541409] text-[#541409] hover:bg-[#EAD6D6]'
              }`}
            >
              {num} dozen
            </button>
          ))}
        </div>
        <p className="text-xs text-[#541409]/60 mt-1">
          {dozens ? `${formatPrice(dozens * PRICE_PER_DOZEN)}` : 'Select to continue'}
        </p>
      </div>

      {dozens && (
        <>
          {/* Progress */}
          <div className="mb-4 p-3 bg-[#EAD6D6]/30 rounded">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#541409]">Cookies selected</span>
              <span className="font-medium text-[#541409]">
                {totalCookies} / {targetCookies}
              </span>
            </div>
            <div className="w-full bg-[#EAD6D6] rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isComplete ? 'bg-green-500' : 'bg-[#541409]'
                }`}
                style={{ width: `${(totalCookies / targetCookies) * 100}%` }}
              />
            </div>
            {remainingCookies > 0 && (
              <p className="text-xs text-[#541409]/70 mt-1">
                {remainingCookies} cookies remaining (add in groups of 6)
              </p>
            )}
            {isComplete && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                Perfect! Your order is complete.
              </p>
            )}
          </div>

          {/* Flavor Breakdown */}
          {flavors.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#541409]">Flavors</span>
                <button
                  onClick={clearFlavors}
                  className="text-xs text-[#541409]/60 hover:text-[#541409] transition-colors"
                >
                  Clear
                </button>
              </div>
              <ul className="space-y-1">
                {flavors.map((f) => (
                  <li key={f.flavor} className="flex justify-between text-sm">
                    <span className="text-[#541409]">{f.label}</span>
                    <span className="text-[#541409]/70">{f.quantity} cookies</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Packaging Toggle */}
          <div className="mb-4 p-3 border border-[#EAD6D6] rounded">
            <p className="text-sm font-medium text-[#541409] mb-2">Packaging</p>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="packaging"
                  value="standard"
                  checked={packaging === 'standard'}
                  onChange={() => setPackaging('standard')}
                  className="w-4 h-4 accent-[#541409]"
                />
                <span className="ml-2 text-sm text-[#541409]">Standard</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="packaging"
                  value="heat-sealed"
                  checked={packaging === 'heat-sealed'}
                  onChange={() => setPackaging('heat-sealed')}
                  className="w-4 h-4 accent-[#541409]"
                />
                <span className="ml-2 text-sm text-[#541409]">
                  Heat-sealed (+$5/dozen)
                </span>
              </label>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-[#EAD6D6] pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#541409]/70">{dozens} dozen cookies</span>
              <span className="text-[#541409]">{formatPrice(subtotal)}</span>
            </div>
            {packagingFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#541409]/70">Heat-sealed packaging</span>
                <span className="text-[#541409]">{formatPrice(packagingFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-2 border-t border-[#EAD6D6]">
              <span className="text-[#541409]">Total</span>
              <span className="text-[#541409]">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            disabled={!isComplete}
            className="mt-4 w-full px-4 py-3 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isComplete ? 'Continue to Checkout' : 'Select all cookies to continue'}
          </button>
        </>
      )}
    </div>
  );
}
