'use client';

import { useCart } from './CartContext';
import { HALF_DOZEN } from '@/types/cart';

interface FlavorCardProps {
  flavorKey: string;
  label: string;
}

export function FlavorCard({ flavorKey, label }: FlavorCardProps) {
  const { dozens, flavors, addHalfDozen, removeHalfDozen, remainingCookies } = useCart();

  const flavorData = flavors.find((f) => f.flavor === flavorKey);
  const quantity = flavorData?.quantity || 0;
  const canAdd = dozens !== null && remainingCookies >= HALF_DOZEN;
  const canRemove = quantity > 0;

  const handleAdd = () => {
    addHalfDozen(flavorKey, label);
  };

  const handleRemove = () => {
    removeHalfDozen(flavorKey);
  };

  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-[#EAD6D6] flex flex-col">
      <h3 className="text-lg font-serif text-[#541409] mb-1">{label}</h3>
      <p className="text-sm text-[#541409]/70 mb-4">$30/dozen</p>

      {dozens === null ? (
        <p className="text-sm text-[#541409]/50 italic">Select quantity first</p>
      ) : (
        <div className="mt-auto flex items-center justify-between">
          <button
            onClick={handleRemove}
            disabled={!canRemove}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[#541409] text-[#541409] hover:bg-[#EAD6D6] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={`Remove half dozen ${label}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <div className="text-center">
            <span className="text-2xl font-medium text-[#541409]">{quantity}</span>
            <p className="text-xs text-[#541409]/60">cookies</p>
          </div>

          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#541409] text-[#EAD6D6] hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={`Add half dozen ${label}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
