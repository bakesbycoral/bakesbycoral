'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type ItemKey = 'floral_cake' | 'vintage_cake' | 'floral_cookie_cups' | 'vintage_cookie_cups';

interface CakeOptions {
  flavor: string;
  filling: string;
  message: string;
}

interface CookieOptions {
  flavor: string;
}

interface SlotInfo {
  time: string;
  label: string;
  available: boolean;
}

const ITEMS: { key: ItemKey; label: string; price: number; desc: string; type: 'cake' | 'cookies'; collection: 'floral' | 'vintage' }[] = [
  { key: 'floral_cake', label: 'Floral Mini Cake', price: 4200, desc: '4" 2-layer cake, serves 2-4', type: 'cake', collection: 'floral' },
  { key: 'floral_cookie_cups', label: 'Floral Cookie Cups', price: 3200, desc: '12 cookie cups with vanilla buttercream', type: 'cookies', collection: 'floral' },
  { key: 'vintage_cake', label: 'Vintage Mini Cake', price: 4000, desc: '4" 2-layer cake, serves 2-4', type: 'cake', collection: 'vintage' },
  { key: 'vintage_cookie_cups', label: 'Vintage Cookie Cups', price: 3000, desc: '12 cookie cups with vanilla buttercream', type: 'cookies', collection: 'vintage' },
];

const CAKE_FLAVORS = [
  { value: 'vanilla-bean', label: 'Vanilla Bean' },
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'marble', label: 'Marble' },
  { value: 'confetti', label: 'Confetti' },
  { value: 'red-velvet', label: 'Red Velvet' },
  { value: 'lemon', label: 'Lemon' },
];

const CAKE_FILLINGS = [
  { value: 'fresh-strawberries', label: 'Fresh Strawberries', price: 400 },
  { value: 'raspberry', label: 'Raspberry', price: 400 },
  { value: 'vanilla-bean-ganache', label: 'Vanilla Bean Ganache', price: 500 },
];

const COOKIE_FLAVORS = [
  { value: 'sugar', label: 'Sugar' },
  { value: 'chocolate-chip', label: 'Chocolate Chip' },
];

const PICKUP_DATES = [
  { value: '2025-05-08', label: 'Thursday, May 8' },
  { value: '2025-05-09', label: 'Friday, May 9' },
];

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function getFillingPrice(filling: string): number {
  return CAKE_FILLINGS.find(f => f.value === filling)?.price || 0;
}

export default function MothersDayCollectionPage() {
  const [selectedItems, setSelectedItems] = useState<Record<ItemKey, boolean>>({
    floral_cake: false,
    vintage_cake: false,
    floral_cookie_cups: false,
    vintage_cookie_cups: false,
  });

  const [cakeOptions, setCakeOptions] = useState<Record<string, CakeOptions>>({
    floral_cake: { flavor: '', filling: '', message: '' },
    vintage_cake: { flavor: '', filling: '', message: '' },
  });

  const [cookieOptions, setCookieOptions] = useState<Record<string, CookieOptions>>({
    floral_cookie_cups: { flavor: '' },
    vintage_cookie_cups: { flavor: '' },
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupDate: '',
    pickupTime: '',
    allergies: '',
    howDidYouHear: '',
    notes: '',
    rushOrder: false,
    acknowledgePayment: false,
    acknowledgeAllergens: false,
    acknowledgeDesign: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slots, setSlots] = useState<Record<string, SlotInfo[]>>({});
  const [slotsLoading, setSlotsLoading] = useState(true);

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/mothers-day/slots');
      if (res.ok) {
        const data = await res.json() as Record<string, SlotInfo[]>;
        setSlots(data);
      }
    } catch {
      // Slots will show as unavailable
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('cancelled=true')) {
      setSubmitError('Checkout was cancelled. You can try again whenever you\'re ready!');
    }
  }, []);

  const selectedItemList = ITEMS.filter(i => selectedItems[i.key]);
  const hasSelection = selectedItemList.length > 0;

  // Calculate total
  let itemsTotal = 0;
  for (const item of selectedItemList) {
    itemsTotal += item.price;
    if (item.type === 'cake') {
      itemsTotal += getFillingPrice(cakeOptions[item.key]?.filling || '');
    }
  }
  const rushAddon = formData.rushOrder ? 2000 : 0;
  const total = itemsTotal + rushAddon;

  const toggleItem = (key: ItemKey) => {
    setSelectedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateCakeOption = (key: string, field: keyof CakeOptions, value: string) => {
    setCakeOptions(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const updateCookieOption = (key: string, field: keyof CookieOptions, value: string) => {
    setCookieOptions(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!hasSelection) {
      setSubmitError('Please select at least one item to order.');
      return;
    }

    // Validate per-item options
    for (const item of selectedItemList) {
      if (item.type === 'cake' && !cakeOptions[item.key]?.flavor) {
        setSubmitError(`Please select a cake flavor for ${item.label}.`);
        return;
      }
      if (item.type === 'cake' && cakeOptions[item.key]?.message) {
        const words = cakeOptions[item.key].message.trim().split(/\s+/);
        if (words.length > 2) {
          setSubmitError(`Custom message for ${item.label} is limited to 2 words.`);
          return;
        }
      }
      if (item.type === 'cookies' && !cookieOptions[item.key]?.flavor) {
        setSubmitError(`Please select a cookie flavor for ${item.label}.`);
        return;
      }
    }

    if (!formData.pickupDate) {
      setSubmitError('Please select a pickup date.');
      return;
    }

    if (!formData.pickupTime) {
      setSubmitError('Please select a pickup time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const items = selectedItemList.map(item => ({
        key: item.key,
        ...(item.type === 'cake' ? {
          cake_flavor: cakeOptions[item.key]?.flavor || '',
          filling: cakeOptions[item.key]?.filling || '',
          cake_message: cakeOptions[item.key]?.message?.trim() || '',
        } : {
          cookie_flavor: cookieOptions[item.key]?.flavor || '',
        }),
      }));

      const response = await fetch('/api/orders/mothers-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          pickup_date: formData.pickupDate,
          pickup_time: formData.pickupTime,
          allergies: formData.allergies,
          how_did_you_hear: formData.howDidYouHear,
          notes: formData.notes,
          rush_order: formData.rushOrder ? 'true' : 'false',
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

  const scrollToOrder = (key?: ItemKey) => {
    if (key) {
      setSelectedItems(prev => ({ ...prev, [key]: true }));
    }
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
  };

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
            Limited Collection
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#4A2C21] font-bold">
            Mother&apos;s Day Collection
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80 max-w-2xl mx-auto">
            Mini cakes &amp; cookie cups in two matching designs: Floral &amp; Vintage.
            Mix, match, or gift a coordinated set.
          </p>
          <p className="mt-2 text-sm text-[#4A2C21]/60">
            Pickup available May 8 &amp; 9 only
          </p>
        </div>
      </section>

      {/* The Two Styles */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif text-[#541409]">
              Two Matching Styles
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Each style comes as a mini cake or cookie cups. Pair them for the perfect gift!
            </p>
          </div>

          {/* Floral Set */}
          <div className="mb-12">
            <h3 className="text-xl font-serif text-[#541409] mb-4 text-center">
              The Floral Collection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => scrollToOrder('floral_cake')} className="flex flex-col bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer text-left">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src="/mom-day-floral-cake.jpg" alt="Floral Mini Cake" className="w-full h-full object-cover" />
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xl font-serif text-[#541409]">Floral Mini Cake</h4>
                    <span className="inline-block px-3 py-1 bg-[#EAD6D6] text-[#541409] text-sm font-medium rounded-full">$42</span>
                  </div>
                  <p className="text-stone-600 text-sm">4&quot; 2-layer cake, serves 2-4. Choose your flavor &amp; filling. Design &amp; colors as shown.</p>
                </div>
              </button>

              <button onClick={() => scrollToOrder('floral_cookie_cups')} className="flex flex-col bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer text-left">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src="/mom-day-floral-cups.jpg" alt="Floral Cookie Cups" className="w-full h-full object-cover" />
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xl font-serif text-[#541409]">Floral Cookie Cups</h4>
                    <span className="inline-block px-3 py-1 bg-[#EAD6D6] text-[#541409] text-sm font-medium rounded-full">$32</span>
                  </div>
                  <p className="text-stone-600 text-sm">12 cookie cups topped with vanilla buttercream. Matches the Floral Mini Cake.</p>
                </div>
              </button>
            </div>
            <p className="text-center text-sm text-stone-500 mt-3">
              The Floral cake &amp; cookie cups share the same design, perfect together as a gift set
            </p>
          </div>

          {/* Vintage Set */}
          <div>
            <h3 className="text-xl font-serif text-[#541409] mb-4 text-center">
              The Vintage Collection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => scrollToOrder('vintage_cake')} className="flex flex-col bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer text-left">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src="/mom-day-vin-cake.jpg" alt="Vintage Mini Cake" className="w-full h-full object-cover" />
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xl font-serif text-[#541409]">Vintage Mini Cake</h4>
                    <span className="inline-block px-3 py-1 bg-[#EAD6D6] text-[#541409] text-sm font-medium rounded-full">$40</span>
                  </div>
                  <p className="text-stone-600 text-sm">4&quot; 2-layer cake, serves 2-4. Choose your flavor &amp; filling. Design &amp; colors as shown.</p>
                </div>
              </button>

              <button onClick={() => scrollToOrder('vintage_cookie_cups')} className="flex flex-col bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer text-left">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src="/mom-day-vin-cups.jpg" alt="Vintage Cookie Cups" className="w-full h-full object-cover" />
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xl font-serif text-[#541409]">Vintage Cookie Cups</h4>
                    <span className="inline-block px-3 py-1 bg-[#EAD6D6] text-[#541409] text-sm font-medium rounded-full">$30</span>
                  </div>
                  <p className="text-stone-600 text-sm">12 cookie cups topped with vanilla buttercream. Matches the Vintage Mini Cake.</p>
                </div>
              </button>
            </div>
            <p className="text-center text-sm text-stone-500 mt-3">
              The Vintage cake &amp; cookie cups share the same design, perfect together as a gift set
            </p>
          </div>
        </div>
      </section>

      {/* Quick Pricing */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-serif text-[#541409]">Pricing</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button onClick={() => scrollToOrder('floral_cake')} className="bg-white rounded-lg p-5 shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-base font-serif text-[#541409] mb-1">Floral Cake</h3>
              <p className="text-2xl font-bold text-[#541409]">$42</p>
              <p className="text-xs text-stone-500 mt-1">4&quot; mini, serves 2-4</p>
            </button>
            <button onClick={() => scrollToOrder('vintage_cake')} className="bg-white rounded-lg p-5 shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-base font-serif text-[#541409] mb-1">Vintage Cake</h3>
              <p className="text-2xl font-bold text-[#541409]">$40</p>
              <p className="text-xs text-stone-500 mt-1">4&quot; mini, serves 2-4</p>
            </button>
            <button onClick={() => scrollToOrder('floral_cookie_cups')} className="bg-white rounded-lg p-5 shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-base font-serif text-[#541409] mb-1">Floral Cups</h3>
              <p className="text-2xl font-bold text-[#541409]">$32</p>
              <p className="text-xs text-stone-500 mt-1">12 cookie cups</p>
            </button>
            <button onClick={() => scrollToOrder('vintage_cookie_cups')} className="bg-white rounded-lg p-5 shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-base font-serif text-[#541409] mb-1">Vintage Cups</h3>
              <p className="text-2xl font-bold text-[#541409]">$30</p>
              <p className="text-xs text-stone-500 mt-1">12 cookie cups</p>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#541409]/70">
              Optional cake fillings: Fresh Strawberries (+$4) &middot; Raspberry (+$4) &middot; Vanilla Bean Ganache (+$5)
            </p>
          </div>
        </div>
      </section>

      {/* Order Form */}
      <section id="order" className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-8">
            Place Your Order
          </h2>

          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Item Selection (checkboxes) */}
              <div>
                <h3 className="text-lg font-serif text-[#541409] mb-1">What would you like? <span className="text-red-500">*</span></h3>
                <p className="text-sm text-stone-500 mb-3">Select as many as you&apos;d like</p>

                <p className="text-sm font-medium text-[#541409]/70 mb-2">Floral Collection</p>
                <div className="space-y-3 mb-4">
                  {ITEMS.filter(i => i.collection === 'floral').map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-center cursor-pointer p-4 border rounded-md transition-colors ${
                        selectedItems[item.key]
                          ? 'border-[#541409] bg-[#541409]/5'
                          : 'border-[#EAD6D6] hover:bg-[#EAD6D6]/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems[item.key]}
                        onChange={() => toggleItem(item.key)}
                        className="w-5 h-5 flex-shrink-0 rounded accent-[#541409] focus:ring-[#541409]"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#541409]">{item.label}</span>
                          <span className="font-bold text-[#541409]">{formatPrice(item.price)}</span>
                        </div>
                        <p className="text-sm text-stone-500">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <p className="text-sm font-medium text-[#541409]/70 mb-2">Vintage Collection</p>
                <div className="space-y-3">
                  {ITEMS.filter(i => i.collection === 'vintage').map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-center cursor-pointer p-4 border rounded-md transition-colors ${
                        selectedItems[item.key]
                          ? 'border-[#541409] bg-[#541409]/5'
                          : 'border-[#EAD6D6] hover:bg-[#EAD6D6]/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems[item.key]}
                        onChange={() => toggleItem(item.key)}
                        className="w-5 h-5 flex-shrink-0 rounded accent-[#541409] focus:ring-[#541409]"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#541409]">{item.label}</span>
                          <span className="font-bold text-[#541409]">{formatPrice(item.price)}</span>
                        </div>
                        <p className="text-sm text-stone-500">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 2: Per-item options */}
              {selectedItemList.map((item) => (
                <div key={item.key} className="bg-[#F7F3ED]/50 rounded-lg p-4 border border-[#EAD6D6]">
                  {item.type === 'cake' ? (
                    <>
                      <h3 className="text-lg font-serif text-[#541409] mb-3">{item.label} Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#541409] mb-2">
                            Cake Flavor <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${cakeOptions[item.key]?.flavor ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                            value={cakeOptions[item.key]?.flavor || ''}
                            onChange={(e) => updateCakeOption(item.key, 'flavor', e.target.value)}
                          >
                            <option value="">Select a flavor</option>
                            {CAKE_FLAVORS.map((f) => (
                              <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#541409] mb-2">
                            Filling <span className="text-stone-400 font-normal">(optional)</span>
                          </label>
                          <select
                            className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${cakeOptions[item.key]?.filling ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                            value={cakeOptions[item.key]?.filling || ''}
                            onChange={(e) => updateCakeOption(item.key, 'filling', e.target.value)}
                          >
                            <option value="">No filling</option>
                            {CAKE_FILLINGS.map((f) => (
                              <option key={f.value} value={f.value}>
                                {f.label} (+${f.price / 100})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#541409] mb-2">
                            Custom Message <span className="text-stone-400 font-normal">(optional, max 2 words)</span>
                          </label>
                          <input
                            type="text"
                            placeholder='e.g. "Mom" or "Love You"'
                            maxLength={20}
                            className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                            value={cakeOptions[item.key]?.message || ''}
                            onChange={(e) => updateCakeOption(item.key, 'message', e.target.value)}
                          />
                          <p className="mt-1 text-xs text-stone-500">
                            Limited space on a 4&quot; cake. Keep it short &amp; sweet!
                          </p>
                        </div>
                        <p className="text-xs text-stone-500 italic">
                          Design &amp; colors are set and cannot be customized.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-serif text-[#541409] mb-3">{item.label} Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#541409] mb-2">
                            Cookie Flavor <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${cookieOptions[item.key]?.flavor ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                            value={cookieOptions[item.key]?.flavor || ''}
                            onChange={(e) => updateCookieOption(item.key, 'flavor', e.target.value)}
                          >
                            <option value="">Select a flavor</option>
                            {COOKIE_FLAVORS.map((f) => (
                              <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                          </select>
                        </div>
                        <p className="text-xs text-stone-500 italic">
                          12 cookie cups topped with vanilla buttercream. Design &amp; colors are set and cannot be customized.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}

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

              {/* Step 4: Pickup Date & Time */}
              <div>
                <h3 className="text-lg font-serif text-[#541409] mb-3">Pickup Date &amp; Time <span className="text-red-500">*</span></h3>
                <div className="space-y-4">
                  {PICKUP_DATES.map((d) => (
                    <div key={d.value}>
                      <label
                        className={`flex items-center cursor-pointer p-4 border rounded-md transition-colors ${
                          formData.pickupDate === d.value
                            ? 'border-[#541409] bg-[#541409]/5'
                            : 'border-[#EAD6D6] hover:bg-[#EAD6D6]/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pickupDate"
                          value={d.value}
                          checked={formData.pickupDate === d.value}
                          onChange={() => setFormData({ ...formData, pickupDate: d.value, pickupTime: '' })}
                          className="w-5 h-5 flex-shrink-0 accent-[#541409] focus:ring-[#541409]"
                        />
                        <span className="ml-3 font-medium text-[#541409]">{d.label}</span>
                      </label>

                      {formData.pickupDate === d.value && (
                        <div className="mt-3 ml-1">
                          <p className="text-sm text-stone-500 mb-2">Select a time slot:</p>
                          {slotsLoading ? (
                            <p className="text-sm text-stone-400">Loading available times...</p>
                          ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {(slots[d.value] || []).map((slot) => (
                                <button
                                  key={slot.time}
                                  type="button"
                                  disabled={!slot.available}
                                  onClick={() => setFormData({ ...formData, pickupTime: slot.time })}
                                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                                    formData.pickupTime === slot.time
                                      ? 'bg-[#541409] text-white border-[#541409]'
                                      : slot.available
                                        ? 'bg-white border-stone-200 text-[#541409] hover:border-[#541409] hover:bg-[#EAD6D6]/30'
                                        : 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed line-through'
                                  }`}
                                >
                                  {slot.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rush Order Option */}
              <div className="bg-[#FDF2F8]/50 rounded-lg p-4 border border-[#EAD6D6]">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rushOrder}
                    onChange={(e) => setFormData({ ...formData, rushOrder: e.target.checked })}
                    className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-[#541409]">Rush Order (+$20)</span>
                    <p className="text-sm text-stone-500 mt-0.5">
                      Ordering within 2-4 days of your pickup date? Rush availability is limited and subject to approval. Orders placed less than 2 days before pickup cannot be accepted.
                    </p>
                  </div>
                </label>
              </div>

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
              {hasSelection && (
                <div className="bg-[#EAD6D6]/30 rounded-lg p-4">
                  <h3 className="text-lg font-serif text-[#541409] mb-3">Order Summary</h3>
                  <div className="space-y-1 text-sm text-[#541409]">
                    {selectedItemList.map((item) => {
                      const fillingAddon = item.type === 'cake' ? getFillingPrice(cakeOptions[item.key]?.filling || '') : 0;
                      return (
                        <div key={item.key}>
                          <div className="flex justify-between">
                            <span>{item.label}</span>
                            <span>{formatPrice(item.price)}</span>
                          </div>
                          {fillingAddon > 0 && (
                            <div className="flex justify-between text-xs ml-4">
                              <span>+ {CAKE_FILLINGS.find(f => f.value === cakeOptions[item.key]?.filling)?.label}</span>
                              <span>+{formatPrice(fillingAddon)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {rushAddon > 0 && (
                      <div className="flex justify-between">
                        <span>Rush Order</span>
                        <span>+{formatPrice(rushAddon)}</span>
                      </div>
                    )}
                    <div className="pt-2 mt-2 border-t border-[#EAD6D6] font-medium flex justify-between">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Acknowledgements */}
              <div>
                <h3 className="text-lg font-serif text-[#541409] mb-3">Policies &amp; Acknowledgements</h3>
                <div className="space-y-3">
                  <label className="flex items-start cursor-pointer p-4 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acknowledgePayment}
                      onChange={(e) => setFormData({ ...formData, acknowledgePayment: e.target.checked })}
                      className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                    />
                    <span className="ml-3 text-sm text-stone-600">
                      I understand that <strong>50% of the payment is non-refundable</strong> once my order is confirmed. <span className="text-red-500">*</span>
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
                      checked={formData.acknowledgeDesign}
                      onChange={(e) => setFormData({ ...formData, acknowledgeDesign: e.target.checked })}
                      className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                    />
                    <span className="ml-3 text-sm text-stone-600">
                      I understand that <strong>designs and colors are set</strong> for this collection and cannot be customized. <span className="text-red-500">*</span>
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
                disabled={submitting || !hasSelection}
                className="w-full px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : `Pay ${hasSelection ? formatPrice(total) : ''} - Checkout`}
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
