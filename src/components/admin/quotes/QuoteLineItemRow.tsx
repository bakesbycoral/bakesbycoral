'use client';

import { useState, useEffect } from 'react';

interface LineItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sort_order: number;
}

interface QuoteLineItemRowProps {
  item: LineItem;
  index: number;
  onChange: (index: number, item: LineItem) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function QuoteLineItemRow({
  item,
  index,
  onChange,
  onRemove,
  disabled = false,
}: QuoteLineItemRowProps) {
  const [description, setDescription] = useState(item.description);
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [unitPrice, setUnitPrice] = useState((item.unit_price / 100).toFixed(2));

  // Update local state when item changes externally
  useEffect(() => {
    setDescription(item.description);
    setQuantity(item.quantity.toString());
    setUnitPrice((item.unit_price / 100).toFixed(2));
  }, [item]);

  const handleChange = (field: 'description' | 'quantity' | 'unitPrice', value: string) => {
    let newDescription = description;
    let newQuantity = parseInt(quantity) || 1;
    let newUnitPrice = Math.round(parseFloat(unitPrice) * 100) || 0;

    switch (field) {
      case 'description':
        newDescription = value;
        setDescription(value);
        break;
      case 'quantity':
        setQuantity(value);
        newQuantity = parseInt(value) || 1;
        break;
      case 'unitPrice':
        setUnitPrice(value);
        newUnitPrice = Math.round((parseFloat(value) || 0) * 100);
        break;
    }

    const totalPrice = newQuantity * newUnitPrice;

    onChange(index, {
      ...item,
      description: newDescription,
      quantity: newQuantity,
      unit_price: newUnitPrice,
      total_price: totalPrice,
    });
  };

  const totalPrice = (parseInt(quantity) || 1) * (Math.round(parseFloat(unitPrice) * 100) || 0);

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      {/* Description */}
      <div className="flex-1">
        <input
          type="text"
          value={description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Item description"
          disabled={disabled}
          className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-[#541409]/50 placeholder:text-[#541409]/50"
        />
      </div>

      {/* Quantity */}
      <div className="w-20">
        <input
          type="number"
          value={quantity}
          onChange={(e) => handleChange('quantity', e.target.value)}
          min="1"
          disabled={disabled}
          className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-sm text-center disabled:bg-gray-100 disabled:cursor-not-allowed text-[#541409]/50 placeholder:text-[#541409]/50"
        />
      </div>

      {/* Unit Price */}
      <div className="w-28">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#541409]/50 text-sm">$</span>
          <input
            type="number"
            value={unitPrice}
            onChange={(e) => handleChange('unitPrice', e.target.value)}
            step="0.01"
            min="0"
            disabled={disabled}
            className="w-full pl-7 pr-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-sm text-right disabled:bg-gray-100 disabled:cursor-not-allowed text-[#541409]/50 placeholder:text-[#541409]/50"
          />
        </div>
      </div>

      {/* Total */}
      <div className="w-24 text-right font-medium text-[#541409]/50">
        ${(totalPrice / 100).toFixed(2)}
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={disabled}
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove item"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
