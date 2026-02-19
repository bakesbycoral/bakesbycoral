'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TimeSlotPicker } from '@/components/forms';

type SelectionType = '' | 'bento' | 'cookie_cake' | 'cookies_dozen' | 'bundle_bento' | 'bundle_cookie_cake';

const CAKE_FLAVORS = [
  { value: 'vanilla-bean', label: 'Vanilla Bean', price: 0 },
  { value: 'chocolate', label: 'Chocolate', price: 0 },
  { value: 'confetti', label: 'Confetti', price: 0 },
  { value: 'red-velvet', label: 'Red Velvet', price: 0 },
  { value: 'lemon', label: 'Lemon', price: 0 },
  { value: 'vanilla-latte', label: 'Vanilla Latte', price: 500 },
  { value: 'marble', label: 'Marble (vanilla & chocolate)', price: 0 },
];

const CAKE_FILLINGS = [
  { value: 'chocolate-ganache', label: 'Chocolate Ganache', price: 500 },
  { value: 'cookies-and-cream', label: 'Cookies & Cream', price: 300 },
  { value: 'vanilla-bean-ganache', label: 'Vanilla Bean Ganache', price: 500 },
  { value: 'fresh-strawberries', label: 'Fresh Strawberries', price: 400 },
  { value: 'lemon-ganache', label: 'Lemon Ganache', price: 500 },
  { value: 'raspberry', label: 'Raspberry', price: 400 },
];

function getFlavorPrice(flavor: string): number {
  return CAKE_FLAVORS.find(f => f.value === flavor)?.price || 0;
}

function getFillingPrice(filling: string): number {
  return CAKE_FILLINGS.find(f => f.value === filling)?.price || 0;
}

function getPrice(selection: SelectionType): number {
  switch (selection) {
    case 'bento':
    case 'cookie_cake':
      return 4000;
    case 'cookies_dozen':
      return 2600;
    case 'bundle_bento':
    case 'bundle_cookie_cake':
      return 4800;
    default:
      return 0;
  }
}

function getItemLabel(selection: SelectionType): string {
  switch (selection) {
    case 'bento':
      return 'Bento Cake';
    case 'cookie_cake':
      return 'Cookie Cake';
    case 'cookies_dozen':
      return 'Thumbprint Confetti Cookies - 1 Dozen';
    case 'bundle_bento':
      return 'Bundle: Bento Cake + 1/2 Dozen Cookies';
    case 'bundle_cookie_cake':
      return 'Bundle: Cookie Cake + 1/2 Dozen Cookies';
    default:
      return '';
  }
}

function needsBentoOptions(selection: SelectionType): boolean {
  return ['bento', 'bundle_bento'].includes(selection);
}

export default function EasterCollectionPage() {
  const [formData, setFormData] = useState({
    selection: '' as SelectionType,
    cakeFlavor: '',
    filling: '',
    baseColor: '',
    borderColor: '',
    messagingColor: '',
    cakeMessage: 'happy-easter' as string,
    customMessage: '',
    name: '',
    email: '',
    phone: '',
    pickupSlot: null as { date: string; time: string } | null,
    allergies: '',
    howDidYouHear: '',
    notes: '',
    acknowledgeDeposit: false,
    acknowledgeAllergens: false,
    acknowledgeLeadTime: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('cancelled=true')) {
      setSubmitError('Checkout was cancelled. You can try again whenever you\'re ready!');
    }
  }, []);

  const basePrice = getPrice(formData.selection);
  const flavorAddon = needsBentoOptions(formData.selection) ? getFlavorPrice(formData.cakeFlavor) : 0;
  const fillingAddon = needsBentoOptions(formData.selection) ? getFillingPrice(formData.filling) : 0;
  const total = basePrice + flavorAddon + fillingAddon;
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.selection) {
      setSubmitError('Please select an item to order.');
      return;
    }

    if (needsBentoOptions(formData.selection) && !formData.cakeFlavor) {
      setSubmitError('Please select a cake flavor.');
      return;
    }

    if (needsBentoOptions(formData.selection) && (!formData.baseColor || !formData.borderColor || !formData.messagingColor)) {
      setSubmitError('Please select all three cake colors.');
      return;
    }

    if (needsBentoOptions(formData.selection) && formData.cakeMessage === 'custom' && !formData.customMessage.trim()) {
      setSubmitError('Please enter your custom cake message.');
      return;
    }

    if (!formData.pickupSlot) {
      setSubmitError('Please select a pickup date and time.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/orders/easter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selection: formData.selection,
          cake_flavor: formData.cakeFlavor,
          filling: formData.filling,
          base_color: formData.baseColor,
          border_color: formData.borderColor,
          messaging_color: formData.messagingColor,
          cake_message: formData.cakeMessage === 'custom' ? formData.customMessage.trim() : 'Happy Easter',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          pickup_date: formData.pickupSlot?.date || '',
          pickup_time: formData.pickupSlot?.time || '',
          allergies: formData.allergies,
          how_did_you_hear: formData.howDidYouHear,
          notes: formData.notes,
        }),
      });

      const data = await response.json() as { error?: string; checkoutUrl?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectionOptions: { value: SelectionType; label: string; price: string; description: string; badge?: string }[] = [
    {
      value: 'bento',
      label: 'Bento Cake',
      price: '$40',
      description: '4" 2-layer cake - choose your flavor, filling & colors',
    },
    {
      value: 'cookie_cake',
      label: 'Cookie Cake',
      price: '$40',
      description: '6" 2-layer chocolate chip & Cadbury egg cookie cake',
    },
    {
      value: 'cookies_dozen',
      label: 'Thumbprint Confetti Cookies',
      price: '$26',
      description: '1 dozen cookies',
    },
    {
      value: 'bundle_bento',
      label: 'Bundle: Bento Cake + Cookies',
      price: '$48',
      description: 'Bento cake + 1/2 dozen cookies',
      badge: 'Save $5',
    },
    {
      value: 'bundle_cookie_cake',
      label: 'Bundle: Cookie Cake + Cookies',
      price: '$48',
      description: 'Cookie cake + 1/2 dozen cookies',
      badge: 'Save $5',
    },
  ];

  return (
    <>
      {/* Hero Banner */}
      <section
        className="py-16 sm:py-20"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            #F7F3ED 0px,
            #F7F3ED 40px,
            #EAD6D6 40px,
            #EAD6D6 80px
          )`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block px-4 py-1.5 bg-[#541409] text-[#EAD6D6] text-sm font-medium rounded-full mb-4">
            Limited Time
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#4A2C21] font-bold">
            Easter Collection
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            Bento cakes, cookie cakes & thumbprint confetti cookies, perfect for Easter celebrations
          </p>
        </div>
      </section>

      {/* Collection Showcase */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif text-[#541409]">
              The Collection
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              A custom bento cake, a cookie cake, and thumbprint confetti cookies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Cake */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square bg-[#EAD6D6] flex items-center justify-center">
                <div className="text-center p-6">
                  <svg className="w-16 h-16 mx-auto text-[#541409]/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-[#541409]/50">Photo coming soon</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-serif text-[#541409] mb-1">Bento Cake</h3>
                <p className="text-stone-600 text-sm mb-3">4&quot; 2-layer cake with Easter-themed decoration. Choose your flavor, filling &amp; colors.</p>
                <span className="inline-block px-3 py-1 bg-[#EAD6D6] text-[#541409] text-sm font-medium rounded-full">$40</span>
              </div>
            </div>

            {/* Cookie Cake */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square bg-[#EAD6D6] flex items-center justify-center">
                <div className="text-center p-6">
                  <svg className="w-16 h-16 mx-auto text-[#541409]/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-[#541409]/50">Photo coming soon</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-serif text-[#541409] mb-1">Cookie Cake</h3>
                <p className="text-stone-600 text-sm mb-3">6&quot; 2-layer chocolate chip &amp; Cadbury egg cookie cake. Design &amp; colors exactly as shown.</p>
                <span className="inline-block px-3 py-1 bg-[#EAD6D6] text-[#541409] text-sm font-medium rounded-full">$40</span>
              </div>
            </div>

            {/* Thumbprint Confetti Cookies */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square bg-[#EAD6D6] flex items-center justify-center">
                <div className="text-center p-6">
                  <svg className="w-16 h-16 mx-auto text-[#541409]/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-[#541409]/50">Photo coming soon</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-serif text-[#541409] mb-1">Thumbprint Confetti Cookies</h3>
                <p className="text-stone-600 text-sm mb-3">Festive thumbprint cookies with colorful confetti sprinkles.</p>
                <span className="inline-block px-3 py-1 bg-[#EAD6D6] text-[#541409] text-sm font-medium rounded-full">$26/dozen</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-serif text-[#541409]">
              Pricing
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-5 shadow-sm text-center">
              <h3 className="text-lg font-serif text-[#541409] mb-1">Bento Cake</h3>
              <p className="text-2xl font-bold text-[#541409]">$40</p>
              <p className="text-sm text-stone-500 mt-1">4&quot; 2-layer cake</p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm text-center">
              <h3 className="text-lg font-serif text-[#541409] mb-1">Cookie Cake</h3>
              <p className="text-2xl font-bold text-[#541409]">$40</p>
              <p className="text-sm text-stone-500 mt-1">6&quot; 2-layer</p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm text-center">
              <h3 className="text-lg font-serif text-[#541409] mb-1">Cookies</h3>
              <p className="text-2xl font-bold text-[#541409]">$26</p>
              <p className="text-sm text-stone-500 mt-1">1 dozen</p>
            </div>
            <div className="bg-[#541409] rounded-lg p-5 shadow-sm text-center relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#F7F3ED] text-[#541409] text-xs font-bold rounded-full">
                BEST VALUE
              </span>
              <h3 className="text-lg font-serif text-[#EAD6D6] mb-1">Bundle</h3>
              <p className="text-2xl font-bold text-[#EAD6D6]">$48</p>
              <p className="text-sm text-[#EAD6D6]/70 mt-1">Any cake + 1/2 dz cookies</p>
              <p className="text-xs text-[#EAD6D6]/60 mt-1">Save $5!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Order Form */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-8">
            Place Your Order
          </h2>

          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Selection */}
              <div>
                <h3 className="text-lg font-serif text-[#541409] mb-3">What would you like? <span className="text-red-500">*</span></h3>
                <div className="space-y-3">
                  {selectionOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center cursor-pointer p-4 border rounded-md transition-colors ${
                        formData.selection === option.value
                          ? 'border-[#541409] bg-[#541409]/5'
                          : 'border-[#EAD6D6] hover:bg-[#EAD6D6]/10'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selection"
                        value={option.value}
                        checked={formData.selection === option.value}
                        onChange={(e) => setFormData({ ...formData, selection: e.target.value as SelectionType })}
                        className="w-5 h-5 flex-shrink-0 accent-[#541409] focus:ring-[#541409]"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#541409]">{option.label}</span>
                          <div className="flex items-center gap-2">
                            {option.badge && (
                              <span className="px-2 py-0.5 bg-[#541409] text-[#EAD6D6] text-xs font-medium rounded-full">
                                {option.badge}
                              </span>
                            )}
                            <span className="font-bold text-[#541409]">{option.price}</span>
                          </div>
                        </div>
                        <p className="text-sm text-stone-500">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 2: Cake Options (conditional) */}
              {needsBentoOptions(formData.selection) && (
                <div>
                  <h3 className="text-lg font-serif text-[#541409] mb-3">Bento Cake Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cakeFlavor" className="block text-sm font-medium text-[#541409] mb-2">
                        Cake Flavor <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="cakeFlavor"
                        required
                        className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.cakeFlavor ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                        value={formData.cakeFlavor}
                        onChange={(e) => setFormData({ ...formData, cakeFlavor: e.target.value })}
                      >
                        <option value="">Select a flavor</option>
                        {CAKE_FLAVORS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}{f.price > 0 ? ` (+$${f.price / 100})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="filling" className="block text-sm font-medium text-[#541409] mb-2">
                        Filling
                      </label>
                      <select
                        id="filling"
                        className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.filling ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                        value={formData.filling}
                        onChange={(e) => setFormData({ ...formData, filling: e.target.value })}
                      >
                        <option value="">No filling</option>
                        {CAKE_FILLINGS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label} (+${f.price / 100})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Color Options */}
                    <div>
                      <label className="block text-sm font-medium text-[#541409] mb-2">
                        Color Combo <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-stone-500 mb-3">Choose your cake colors from the Easter palette</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label htmlFor="baseColor" className="block text-xs text-stone-500 mb-1">Base Color</label>
                          <select
                            id="baseColor"
                            required
                            className={`w-full px-3 py-2.5 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white text-sm ${formData.baseColor ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                            value={formData.baseColor}
                            onChange={(e) => setFormData({ ...formData, baseColor: e.target.value })}
                          >
                            <option value="">Select</option>
                            <option value="pastel-yellow">Pastel Yellow</option>
                            <option value="baby-pink">Baby Pink</option>
                            <option value="light-blue">Light Blue</option>
                            <option value="lavender">Lavender</option>
                            <option value="pastel-orange">Pastel Orange</option>
                            <option value="white">White</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="borderColor" className="block text-xs text-stone-500 mb-1">Border Color</label>
                          <select
                            id="borderColor"
                            required
                            className={`w-full px-3 py-2.5 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white text-sm ${formData.borderColor ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                            value={formData.borderColor}
                            onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                          >
                            <option value="">Select</option>
                            <option value="pastel-yellow">Pastel Yellow</option>
                            <option value="baby-pink">Baby Pink</option>
                            <option value="light-blue">Light Blue</option>
                            <option value="lavender">Lavender</option>
                            <option value="pastel-orange">Pastel Orange</option>
                            <option value="white">White</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="messagingColor" className="block text-xs text-stone-500 mb-1">Messaging Color</label>
                          <select
                            id="messagingColor"
                            required
                            className={`w-full px-3 py-2.5 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white text-sm ${formData.messagingColor ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                            value={formData.messagingColor}
                            onChange={(e) => setFormData({ ...formData, messagingColor: e.target.value })}
                          >
                            <option value="">Select</option>
                            <option value="pastel-yellow">Pastel Yellow</option>
                            <option value="baby-pink">Baby Pink</option>
                            <option value="light-blue">Light Blue</option>
                            <option value="lavender">Lavender</option>
                            <option value="pastel-orange">Pastel Orange</option>
                            <option value="white">White</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Custom Messaging */}
                    <div>
                      <label className="block text-sm font-medium text-[#541409] mb-2">
                        Cake Message <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        <label className={`flex items-center cursor-pointer p-3 border rounded-md transition-colors ${
                          formData.cakeMessage === 'happy-easter' ? 'border-[#541409] bg-[#541409]/5' : 'border-[#EAD6D6] hover:bg-[#EAD6D6]/10'
                        }`}>
                          <input
                            type="radio"
                            name="cakeMessage"
                            value="happy-easter"
                            checked={formData.cakeMessage === 'happy-easter'}
                            onChange={() => setFormData({ ...formData, cakeMessage: 'happy-easter', customMessage: '' })}
                            className="w-4 h-4 accent-[#541409] focus:ring-[#541409]"
                          />
                          <span className="ml-3 text-sm text-[#541409]">Happy Easter</span>
                        </label>
                        <label className={`flex items-center cursor-pointer p-3 border rounded-md transition-colors ${
                          formData.cakeMessage === 'custom' ? 'border-[#541409] bg-[#541409]/5' : 'border-[#EAD6D6] hover:bg-[#EAD6D6]/10'
                        }`}>
                          <input
                            type="radio"
                            name="cakeMessage"
                            value="custom"
                            checked={formData.cakeMessage === 'custom'}
                            onChange={() => setFormData({ ...formData, cakeMessage: 'custom' })}
                            className="w-4 h-4 accent-[#541409] focus:ring-[#541409]"
                          />
                          <span className="ml-3 text-sm text-[#541409]">Custom (1-3 words)</span>
                        </label>
                        {formData.cakeMessage === 'custom' && (
                          <input
                            type="text"
                            required
                            placeholder="e.g. He Is Risen"
                            maxLength={30}
                            className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                            value={formData.customMessage}
                            onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Info */}
              <div>
                <h3 className="text-lg font-serif text-[#541409] mb-3">Your Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#541409] mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#541409] mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-[#541409] mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Pickup */}
              <TimeSlotPicker
                orderType="easter_collection"
                value={formData.pickupSlot ?? undefined}
                onChange={(slot) => setFormData({ ...formData, pickupSlot: slot })}
                label="Preferred Pickup Date & Time"
                required
              />

              {/* Step 5: Additional Info */}
              <div>
                <h3 className="text-lg font-serif text-[#541409] mb-3">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-[#541409] mb-2">
                      Allergies to Note
                    </label>
                    <input
                      type="text"
                      id="allergies"
                      placeholder="Any allergies I should be aware of?"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="howDidYouHear" className="block text-sm font-medium text-[#541409] mb-2">
                      How did you hear about me? :)
                    </label>
                    <input
                      type="text"
                      id="howDidYouHear"
                      placeholder="Instagram, friend, Google, etc."
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.howDidYouHear}
                      onChange={(e) => setFormData({ ...formData, howDidYouHear: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-[#541409] mb-2">
                      Anything else?
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      placeholder="Any other details or questions..."
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              {formData.selection && (
                <div className="bg-[#EAD6D6]/30 rounded-lg p-4">
                  <h3 className="text-lg font-serif text-[#541409] mb-3">Order Summary</h3>
                  <div className="space-y-1 text-sm text-[#541409]">
                    <div className="flex justify-between">
                      <span>{getItemLabel(formData.selection)}</span>
                      <span>{formatPrice(basePrice)}</span>
                    </div>
                    {(formData.selection === 'bundle_bento' || formData.selection === 'bundle_cookie_cake') && (
                      <div className="flex justify-between text-xs text-green-700">
                        <span>Bundle discount</span>
                        <span>-$5</span>
                      </div>
                    )}
                    {flavorAddon > 0 && (
                      <div className="flex justify-between">
                        <span>Flavor upgrade: {CAKE_FLAVORS.find(f => f.value === formData.cakeFlavor)?.label}</span>
                        <span>+{formatPrice(flavorAddon)}</span>
                      </div>
                    )}
                    {fillingAddon > 0 && (
                      <div className="flex justify-between">
                        <span>Filling: {CAKE_FILLINGS.find(f => f.value === formData.filling)?.label}</span>
                        <span>+{formatPrice(fillingAddon)}</span>
                      </div>
                    )}
                    <div className="pt-2 mt-2 border-t border-[#EAD6D6] font-medium flex justify-between">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Acknowledgements */}
              <div>
                <h3 className="text-lg font-serif text-[#541409] mb-3">Policies & Acknowledgements</h3>
                <div className="space-y-3">
                  <label className="flex items-start cursor-pointer p-4 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acknowledgeDeposit}
                      onChange={(e) => setFormData({ ...formData, acknowledgeDeposit: e.target.checked })}
                      className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                    />
                    <span className="ml-3 text-sm text-stone-600">
                      I understand that <strong>payment is non-refundable</strong> once my order is confirmed. <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start cursor-pointer p-4 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acknowledgeAllergens}
                      onChange={(e) => setFormData({ ...formData, acknowledgeAllergens: e.target.checked })}
                      className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                    />
                    <span className="ml-3 text-sm text-stone-600">
                      I understand that all products are made in a kitchen that contains <strong>dairy, eggs, tree nuts, peanuts, and soy</strong>. <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start cursor-pointer p-4 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acknowledgeLeadTime}
                      onChange={(e) => setFormData({ ...formData, acknowledgeLeadTime: e.target.checked })}
                      className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                    />
                    <span className="ml-3 text-sm text-stone-600">
                      I understand that Easter collection orders require at least <strong>1 week notice</strong>. <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div>
              </div>

              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !formData.selection}
                className="w-full px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : `Pay ${formData.selection ? formatPrice(total) : ''} - Checkout`}
              </button>

              <p className="text-sm text-stone-500 text-center">
                You&apos;ll be redirected to a secure Stripe checkout to complete your payment.
              </p>
            </form>
          </div>

          <div className="mt-8 text-center">
            <Link href="/menu" className="text-[#541409] hover:opacity-70 transition-opacity">
              &larr; Back to Menu
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
