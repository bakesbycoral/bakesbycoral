'use client';

import { useState, Suspense, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TimeSlotPicker, CouponInput } from '@/components/forms';

// ── All 14 mini cake flavors ────────────────────────────────────────
const MINI_CAKES = [
  { key: 'timeless', name: 'Timeless', cake: 'Vanilla Bean', filling: 'Vanilla Bean Ganache' },
  { key: 'golden-hour', name: 'Golden Hour', cake: 'Vanilla Bean', filling: 'Salted Caramel' },
  { key: 'cloud-nine', name: 'Cloud Nine', cake: 'Vanilla Latte', filling: 'Vanilla Bean Ganache' },
  { key: 'pink-haze', name: 'Pink Haze', cake: 'Vanilla Bean', filling: 'Raspberry' },
  { key: 'pink-skies', name: 'Pink Skies', cake: 'Lemon', filling: 'Raspberry' },
  { key: 'blush-silk', name: 'Blush Silk', cake: 'Vanilla Bean', filling: 'Fresh Strawberries' },
  { key: 'velvet-rush', name: 'Velvet Rush', cake: 'Chocolate', filling: 'Fresh Strawberries' },
  { key: 'deep-end', name: 'Deep End', cake: 'Chocolate', filling: 'Raspberry' },
  { key: 'morning-ritual', name: 'Morning Ritual', cake: 'Vanilla Latte', filling: 'Salted Caramel' },
  { key: 'after-hours', name: 'After Hours', cake: 'Chocolate', filling: 'Salted Caramel' },
  { key: 'red-affair', name: 'Red Affair', cake: 'Red Velvet', filling: 'Cream Cheese' },
  { key: 'dark-matter', name: 'Dark Matter', cake: 'Chocolate', filling: 'Chocolate Ganache' },
  { key: 'party-edit', name: 'Party Edit', cake: 'Confetti', filling: 'Vanilla Bean Ganache' },
  { key: 'double-take', name: 'Double Take', cake: 'Marble', filling: 'Chocolate Ganache' },
] as const;

const CAKE_BASES = [
  'Vanilla Bean', 'Chocolate', 'Confetti', 'Red Velvet', 'Lemon', 'Vanilla Latte', 'Marble',
];

const FILLING_OPTIONS = [
  'Vanilla Bean Ganache', 'Chocolate Ganache', 'Salted Caramel', 'Fresh Strawberries',
  'Raspberry', 'Cream Cheese',
];

// ── 4 Curated Boxes ─────────────────────────────────────────────────
const CURATED_BOXES = [
  {
    key: 'party-girl',
    name: 'The Party Girl',
    six: ['party-edit', 'pink-skies', 'after-hours', 'red-affair', 'double-take', 'morning-ritual'],
    four: ['after-hours', 'party-edit', 'double-take', 'red-affair'],
  },
  {
    key: 'chocolate-lover',
    name: 'The Chocolate Lover',
    six: ['dark-matter', 'double-take', 'red-affair', 'deep-end', 'after-hours', 'velvet-rush'],
    four: ['dark-matter', 'deep-end', 'velvet-rush', 'after-hours'],
  },
  {
    key: 'classic-bride',
    name: 'The Classic Bride',
    six: ['timeless', 'dark-matter', 'velvet-rush', 'golden-hour', 'pink-haze', 'blush-silk'],
    four: ['timeless', 'golden-hour', 'blush-silk', 'pink-haze'],
  },
  {
    key: 'soft-girl',
    name: 'The Soft Girl',
    six: ['timeless', 'pink-skies', 'cloud-nine', 'golden-hour', 'blush-silk', 'pink-haze'],
    four: ['timeless', 'cloud-nine', 'golden-hour', 'pink-haze'],
  },
] as const;

function getCakeByKey(key: string) {
  return MINI_CAKES.find(c => c.key === key);
}

type BoxMode = '' | 'party-girl' | 'chocolate-lover' | 'classic-bride' | 'soft-girl' | 'create-your-own';
type BoxCount = 4 | 6;

interface CustomCake {
  type: 'named' | 'custom';
  namedKey?: string;
  customBase?: string;
  customFilling?: string;
}

function TastingPageContent() {
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled');
  const formRef = useRef<HTMLDivElement>(null);

  const [boxMode, setBoxMode] = useState<BoxMode>('');
  const [boxCount, setBoxCount] = useState<BoxCount>(6);
  const [customCakes, setCustomCakes] = useState<CustomCake[]>([]);
  const [addOnCount, setAddOnCount] = useState(0);
  const [addOnCakes, setAddOnCakes] = useState<CustomCake[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    weddingDate: '',
    pickupOrDelivery: 'pickup',
    deliveryLocation: '',
    pickupSlot: null as { date: string; time: string } | null,
    acknowledgePayment: false,
    acknowledgeAllergens: false,
    acknowledgeLeadTime: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    description: string | null;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
  } | null>(null);

  // Scroll to form when box is selected
  useEffect(() => {
    if (boxMode) {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [boxMode]);

  // Reset custom cakes when switching modes or count
  useEffect(() => {
    if (boxMode === 'create-your-own') {
      setCustomCakes([]);
    }
  }, [boxMode, boxCount]);

  // ── Pricing ─────────────────────────────────────────────────────
  const basePrice = boxCount === 6 ? 7500 : 5500;
  const addOnPrice = addOnCount * 1500;
  const totalAmount = basePrice + addOnPrice;
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  // ── Get cakes for selected curated box ──────────────────────────
  const getCuratedCakes = () => {
    const box = CURATED_BOXES.find(b => b.key === boxMode);
    if (!box) return [];
    const keys = boxCount === 6 ? box.six : box.four;
    return keys.map(k => getCakeByKey(k)).filter(Boolean);
  };

  // ── Custom cake selection helpers ───────────────────────────────
  const addNamedCake = (key: string) => {
    if (customCakes.length >= boxCount) return;
    setCustomCakes(prev => [...prev, { type: 'named', namedKey: key }]);
  };

  const addCustomCake = (base: string, filling: string) => {
    if (customCakes.length >= boxCount) return;
    setCustomCakes(prev => [...prev, { type: 'custom', customBase: base, customFilling: filling }]);
  };

  const removeCustomCake = (index: number) => {
    setCustomCakes(prev => prev.filter((_, i) => i !== index));
  };

  // ── Add-on helpers ──────────────────────────────────────────────
  const addAddOnNamed = (key: string) => {
    setAddOnCakes(prev => [...prev, { type: 'named', namedKey: key }]);
    setAddOnCount(prev => prev + 1);
  };

  const addAddOnCustom = (base: string, filling: string) => {
    setAddOnCakes(prev => [...prev, { type: 'custom', customBase: base, customFilling: filling }]);
    setAddOnCount(prev => prev + 1);
  };

  const removeAddOn = (index: number) => {
    setAddOnCakes(prev => prev.filter((_, i) => i !== index));
    setAddOnCount(prev => Math.max(0, prev - 1));
  };

  // ── Form readiness ──────────────────────────────────────────────
  const isCurated = boxMode !== '' && boxMode !== 'create-your-own';
  const isCreateYourOwn = boxMode === 'create-your-own';
  const boxReady = isCurated || (isCreateYourOwn && customCakes.length === boxCount);

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!boxMode) {
      setError('Please select a tasting box.');
      return;
    }
    if (!boxReady) {
      setError(`Please select ${boxCount} cakes for your box.`);
      return;
    }
    if (!formData.pickupSlot) {
      setError('Please select a pickup date and time.');
      return;
    }

    setIsSubmitting(true);

    // Build the cakes list for the API
    let cakes: { name: string; cake: string; filling: string }[] = [];

    if (isCurated) {
      cakes = getCuratedCakes().map(c => ({
        name: c!.name,
        cake: c!.cake,
        filling: c!.filling,
      }));
    } else {
      cakes = customCakes.map(c => {
        if (c.type === 'named') {
          const named = getCakeByKey(c.namedKey!);
          return { name: named!.name, cake: named!.cake, filling: named!.filling };
        }
        return { name: 'Custom', cake: c.customBase!, filling: c.customFilling! };
      });
    }

    const addOns = addOnCakes.map(c => {
      if (c.type === 'named') {
        const named = getCakeByKey(c.namedKey!);
        return { name: named!.name, cake: named!.cake, filling: named!.filling };
      }
      return { name: 'Custom', cake: c.customBase!, filling: c.customFilling! };
    });

    try {
      const response = await fetch('/api/orders/tasting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          wedding_date: formData.weddingDate,
          tasting_type: 'cake',
          box_name: isCurated ? CURATED_BOXES.find(b => b.key === boxMode)?.name : 'Create Your Own',
          box_count: boxCount,
          cakes,
          add_on_cakes: addOns,
          pickup_or_delivery: formData.pickupOrDelivery,
          delivery_location: formData.deliveryLocation || undefined,
          pickup_date: formData.pickupSlot.date,
          pickup_time: formData.pickupSlot.time,
          coupon_code: appliedCoupon?.code || null,
        }),
      });

      const data = await response.json() as { checkoutUrl?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  // ── Custom cake builder (shared between main box and add-ons) ──
  const [customBase, setCustomBase] = useState('');
  const [customFilling, setCustomFilling] = useState('');
  const [addOnBase, setAddOnBase] = useState('');
  const [addOnFilling, setAddOnFilling] = useState('');

  return (
    <>
      {/* Hero Banner */}
      <section
        className="py-16 sm:py-20"
        style={{
          background: `repeating-linear-gradient(90deg, #F7F3ED 0px, #F7F3ED 40px, #EAD6D6 40px, #EAD6D6 80px)`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif text-[#4A2C21] font-bold">
            <em>Tasting</em> Boxes
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            12oz mini cakes with filling pairings &amp; mock swiss buttercream
          </p>
        </div>
      </section>

      {/* Intro + Credit Note */}
      <section className="py-12 bg-[#F7F3ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-lg text-stone-600 leading-relaxed">
              Tasting boxes are designed for couples planning wedding desserts who want to
              sample flavors before finalizing their order. If you book your wedding desserts
              within 30 days of placing your tasting order, your payment will be credited
              toward your order!
            </p>
          </div>

          <div className="bg-[#EAD6D6] rounded-lg p-6 text-center mb-8">
            <p className="text-[#541409] font-medium">
              6 count — $75 &nbsp;|&nbsp; 4 count — $55 &nbsp;|&nbsp; Add-on cakes — $15 each
            </p>
            <p className="text-sm text-[#541409]/70 mt-1">
              Every mini cake includes mock swiss meringue buttercream
            </p>
          </div>

          {/* ── The Flavor Menu ─────────────────────────────────── */}
          <h2 className="text-2xl font-serif text-[#541409] text-center mb-6">Our Mini Cakes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
            {MINI_CAKES.map((cake) => (
              <div key={cake.key} className="bg-white rounded-lg p-4 border border-[#EAD6D6]">
                <h3 className="font-serif text-[#541409] font-medium">{cake.name}</h3>
                <p className="text-sm text-stone-600 mt-1">
                  {cake.cake} cake &bull; {cake.filling}
                </p>
              </div>
            ))}
          </div>

          {/* ── Step 1: Choose Your Box ─────────────────────────── */}
          <h2 className="text-2xl font-serif text-[#541409] text-center mb-2">Choose Your Box</h2>
          <p className="text-sm text-stone-500 text-center mb-6">Pick a curated box or create your own</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {CURATED_BOXES.map((box) => (
              <button
                key={box.key}
                onClick={() => setBoxMode(box.key as BoxMode)}
                className={`text-left p-5 rounded-lg border-2 transition-all ${
                  boxMode === box.key
                    ? 'border-[#541409] bg-[#541409]/5 ring-1 ring-[#541409]'
                    : 'border-[#EAD6D6] hover:border-[#541409]/50 bg-white'
                }`}
              >
                <h3 className="font-serif text-[#541409] font-medium text-lg">{box.name}</h3>
                <ul className="mt-2 text-xs text-stone-600 space-y-0.5">
                  {box.six.map(k => {
                    const c = getCakeByKey(k);
                    return <li key={k}>{c?.name}</li>;
                  })}
                </ul>
              </button>
            ))}

            {/* Create Your Own */}
            <button
              onClick={() => setBoxMode('create-your-own')}
              className={`text-left p-5 rounded-lg border-2 transition-all ${
                boxMode === 'create-your-own'
                  ? 'border-[#541409] bg-[#541409]/5 ring-1 ring-[#541409]'
                  : 'border-[#EAD6D6] hover:border-[#541409]/50 bg-white'
              }`}
            >
              <h3 className="font-serif text-[#541409] font-medium text-lg">Create Your Own</h3>
              <p className="mt-2 text-xs text-stone-600">
                Pick from our named flavors or mix &amp; match any cake base and filling to build your perfect box
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* ── Order Form ───────────────────────────────────────────── */}
      {boxMode && (
        <section className="py-16 bg-[#EAD6D6]">
          <div ref={formRef} className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-6 text-center">
                {isCurated ? CURATED_BOXES.find(b => b.key === boxMode)?.name : 'Create Your Own'}
              </h2>

              {cancelled && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                  Your payment was cancelled. You can try again below.
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Count Selection */}
                <div>
                  <label className="block text-sm font-medium text-[#541409] mb-2">How many mini cakes?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBoxCount(6)}
                      className={`py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                        boxCount === 6
                          ? 'bg-[#541409] text-[#EAD6D6]'
                          : 'border border-[#541409] text-[#541409] hover:bg-[#EAD6D6]'
                      }`}
                    >
                      6 count — $75
                    </button>
                    <button
                      type="button"
                      onClick={() => setBoxCount(4)}
                      className={`py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                        boxCount === 4
                          ? 'bg-[#541409] text-[#EAD6D6]'
                          : 'border border-[#541409] text-[#541409] hover:bg-[#EAD6D6]'
                      }`}
                    >
                      4 count — $55
                    </button>
                  </div>
                </div>

                {/* Curated Box Contents */}
                {isCurated && (
                  <div>
                    <label className="block text-sm font-medium text-[#541409] mb-2">Your box includes:</label>
                    <div className="space-y-2">
                      {getCuratedCakes().map((cake) => (
                        <div key={cake!.key} className="flex justify-between items-center p-3 bg-[#EAD6D6]/20 rounded border border-[#EAD6D6]">
                          <span className="font-medium text-[#541409] text-sm">{cake!.name}</span>
                          <span className="text-xs text-stone-500">{cake!.cake} &bull; {cake!.filling}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Create Your Own Selection */}
                {isCreateYourOwn && (
                  <div>
                    <label className="block text-sm font-medium text-[#541409] mb-2">
                      Select your cakes <span className="text-[#541409]/60 font-normal">({customCakes.length}/{boxCount})</span>
                    </label>

                    {/* Selected cakes */}
                    {customCakes.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {customCakes.map((cake, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-[#EAD6D6]/20 rounded border border-[#EAD6D6]">
                            <span className="text-sm text-[#541409]">
                              {cake.type === 'named'
                                ? `${getCakeByKey(cake.namedKey!)?.name} — ${getCakeByKey(cake.namedKey!)?.cake} & ${getCakeByKey(cake.namedKey!)?.filling}`
                                : `Custom — ${cake.customBase} & ${cake.customFilling}`
                              }
                            </span>
                            <button type="button" onClick={() => removeCustomCake(i)} className="text-red-400 hover:text-red-600 text-xs ml-2">Remove</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {customCakes.length < boxCount && (
                      <>
                        {/* Pick from named cakes */}
                        <p className="text-xs text-stone-500 mb-2">Pick from our menu:</p>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {MINI_CAKES.map((cake) => (
                            <button
                              key={cake.key}
                              type="button"
                              onClick={() => addNamedCake(cake.key)}
                              className="text-left p-2 text-xs border border-[#EAD6D6] rounded hover:bg-[#EAD6D6]/20 transition-colors text-[#541409]"
                            >
                              <span className="font-medium">{cake.name}</span>
                              <span className="block text-stone-500">{cake.cake} &bull; {cake.filling}</span>
                            </button>
                          ))}
                        </div>

                        {/* Or build a custom cake */}
                        <p className="text-xs text-stone-500 mb-2">Or mix &amp; match your own:</p>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <select
                              value={customBase}
                              onChange={(e) => setCustomBase(e.target.value)}
                              className="w-full px-3 py-2 border border-stone-300 rounded-sm text-sm text-[#541409] bg-white"
                            >
                              <option value="">Cake base...</option>
                              {CAKE_BASES.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>
                          <div className="flex-1">
                            <select
                              value={customFilling}
                              onChange={(e) => setCustomFilling(e.target.value)}
                              className="w-full px-3 py-2 border border-stone-300 rounded-sm text-sm text-[#541409] bg-white"
                            >
                              <option value="">Filling...</option>
                              {FILLING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>
                          <button
                            type="button"
                            disabled={!customBase || !customFilling}
                            onClick={() => {
                              addCustomCake(customBase, customFilling);
                              setCustomBase('');
                              setCustomFilling('');
                            }}
                            className="px-3 py-2 bg-[#541409] text-[#EAD6D6] rounded-sm text-sm hover:opacity-80 disabled:opacity-40"
                          >
                            Add
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── Add-On Extra Cakes ──────────────────────────── */}
                <div className="pt-4 border-t border-[#EAD6D6]">
                  <label className="block text-sm font-medium text-[#541409] mb-2">
                    Add extra cakes? <span className="text-[#541409]/60 font-normal">($15 each)</span>
                  </label>

                  {addOnCakes.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {addOnCakes.map((cake, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-[#EAD6D6]/20 rounded border border-[#EAD6D6]">
                          <span className="text-sm text-[#541409]">
                            {cake.type === 'named'
                              ? `${getCakeByKey(cake.namedKey!)?.name}`
                              : `Custom — ${cake.customBase} & ${cake.customFilling}`
                            }
                            <span className="text-stone-500 ml-1">(+$15)</span>
                          </span>
                          <button type="button" onClick={() => removeAddOn(i)} className="text-red-400 hover:text-red-600 text-xs ml-2">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap mb-3">
                    {MINI_CAKES.slice(0, 7).map((cake) => (
                      <button
                        key={cake.key}
                        type="button"
                        onClick={() => addAddOnNamed(cake.key)}
                        className="px-2 py-1 text-xs border border-[#EAD6D6] rounded hover:bg-[#EAD6D6]/20 text-[#541409]"
                      >
                        + {cake.name}
                      </button>
                    ))}
                    <details className="w-full">
                      <summary className="text-xs text-[#541409]/60 cursor-pointer hover:text-[#541409]">More flavors &amp; custom...</summary>
                      <div className="flex gap-2 flex-wrap mt-2 mb-2">
                        {MINI_CAKES.slice(7).map((cake) => (
                          <button
                            key={cake.key}
                            type="button"
                            onClick={() => addAddOnNamed(cake.key)}
                            className="px-2 py-1 text-xs border border-[#EAD6D6] rounded hover:bg-[#EAD6D6]/20 text-[#541409]"
                          >
                            + {cake.name}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 items-end">
                        <select value={addOnBase} onChange={(e) => setAddOnBase(e.target.value)} className="flex-1 px-2 py-1 border border-stone-300 rounded-sm text-xs text-[#541409] bg-white">
                          <option value="">Cake base...</option>
                          {CAKE_BASES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <select value={addOnFilling} onChange={(e) => setAddOnFilling(e.target.value)} className="flex-1 px-2 py-1 border border-stone-300 rounded-sm text-xs text-[#541409] bg-white">
                          <option value="">Filling...</option>
                          {FILLING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <button
                          type="button"
                          disabled={!addOnBase || !addOnFilling}
                          onClick={() => { addAddOnCustom(addOnBase, addOnFilling); setAddOnBase(''); setAddOnFilling(''); }}
                          className="px-2 py-1 bg-[#541409] text-[#EAD6D6] rounded-sm text-xs hover:opacity-80 disabled:opacity-40"
                        >
                          Add
                        </button>
                      </div>
                    </details>
                  </div>
                </div>

                {/* ── Contact Info ─────────────────────────────────── */}
                <div className="pt-4 border-t border-[#EAD6D6]">
                  <h3 className="text-xl font-serif text-[#541409] mb-4">Your Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-[#541409] mb-2">Name <span className="text-red-500">*</span></label>
                      <input type="text" id="name" required className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#541409] mb-2">Email <span className="text-red-500">*</span></label>
                      <input type="email" id="email" required className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-[#541409] mb-2">Phone <span className="text-red-500">*</span></label>
                      <input type="tel" id="phone" required className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="weddingDate" className="block text-sm font-medium text-[#541409] mb-2">Wedding/Event Date</label>
                      <input type="date" id="weddingDate" className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]" value={formData.weddingDate} onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Pickup / Delivery */}
                <div>
                  <label htmlFor="pickupOrDelivery" className="block text-sm font-medium text-[#541409] mb-2">Pickup or Delivery? <span className="text-red-500">*</span></label>
                  <select id="pickupOrDelivery" required className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white text-[#541409]" value={formData.pickupOrDelivery} onChange={(e) => setFormData({ ...formData, pickupOrDelivery: e.target.value, pickupSlot: null })}>
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery (fee starting at $20, if available)</option>
                  </select>
                </div>

                {formData.pickupOrDelivery === 'delivery' && (
                  <div>
                    <label htmlFor="deliveryLocation" className="block text-sm font-medium text-[#541409] mb-2">Delivery Location <span className="text-red-500">*</span></label>
                    <input type="text" id="deliveryLocation" required placeholder="Full address" className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50" value={formData.deliveryLocation} onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })} />
                  </div>
                )}

                <TimeSlotPicker
                  orderType="tasting"
                  value={formData.pickupSlot ?? undefined}
                  onChange={(slot) => setFormData({ ...formData, pickupSlot: slot })}
                  label={formData.pickupOrDelivery === 'delivery' ? 'Preferred Delivery Date & Time' : 'Preferred Pickup Date & Time'}
                  required
                />

                {/* Coupon */}
                <CouponInput orderType="tasting" onCouponApplied={setAppliedCoupon} appliedCoupon={appliedCoupon} />

                {/* Order Summary */}
                <div className="bg-[#EAD6D6]/30 rounded-lg p-4">
                  <h3 className="text-lg font-serif text-[#541409] mb-3">Order Summary</h3>
                  <div className="text-sm flex justify-between text-[#541409]">
                    <span>{isCurated ? CURATED_BOXES.find(b => b.key === boxMode)?.name : 'Create Your Own'} ({boxCount} count)</span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>
                  {addOnCount > 0 && (
                    <div className="text-sm flex justify-between text-[#541409] mt-1">
                      <span>{addOnCount} add-on cake{addOnCount > 1 ? 's' : ''}</span>
                      <span>{formatPrice(addOnPrice)}</span>
                    </div>
                  )}
                  <div className="mt-2 pt-2 border-t border-[#EAD6D6] font-medium flex justify-between text-[#541409]">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* Policies */}
                <div>
                  <h3 className="text-xl font-serif text-[#541409] mb-4">Policies &amp; Acknowledgements</h3>
                  <div className="space-y-3">
                    <label className="flex items-start cursor-pointer p-4 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors">
                      <input type="checkbox" required checked={formData.acknowledgePayment} onChange={(e) => setFormData({ ...formData, acknowledgePayment: e.target.checked })} className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409]" />
                      <span className="ml-3 text-sm text-stone-600">
                        I understand that <strong>tasting box payments are non-refundable</strong>, but will be credited toward my wedding order if booked within 30 days. <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <label className="flex items-start cursor-pointer p-4 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors">
                      <input type="checkbox" required checked={formData.acknowledgeAllergens} onChange={(e) => setFormData({ ...formData, acknowledgeAllergens: e.target.checked })} className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409]" />
                      <span className="ml-3 text-sm text-stone-600">
                        I understand that all products are made in a kitchen that contains <strong>dairy, eggs, tree nuts, peanuts, and soy</strong>. <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <label className="flex items-start cursor-pointer p-4 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors">
                      <input type="checkbox" required checked={formData.acknowledgeLeadTime} onChange={(e) => setFormData({ ...formData, acknowledgeLeadTime: e.target.checked })} className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409]" />
                      <span className="ml-3 text-sm text-stone-600">
                        I understand that tasting boxes require at least <strong>3 days notice</strong>. <span className="text-red-500">*</span>
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !boxReady}
                  className="w-full px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                </button>

                <p className="text-sm text-stone-500 text-center">
                  You&apos;ll be redirected to Stripe to complete your payment securely.
                </p>
              </form>
            </div>

            <div className="mt-8 text-center">
              <Link href="/weddings" className="text-[#541409] hover:opacity-70 transition-opacity">
                &larr; Back to Weddings
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default function TastingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#541409]"></div>
      </div>
    }>
      <TastingPageContent />
    </Suspense>
  );
}
