'use client';

import { useState, Suspense, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TimeSlotPicker, CouponInput } from '@/components/forms';

// ═══════════════════════════════════════════════════════════════════════
//  CAKE DATA
// ═══════════════════════════════════════════════════════════════════════
const MINI_CAKES = [
  { key: 'timeless', name: 'Timeless', cake: 'Vanilla Bean', filling: 'Vanilla Bean Ganache', vibe: 'Elegant & timeless' },
  { key: 'golden-hour', name: 'Golden Hour', cake: 'Vanilla Bean', filling: 'Salted Caramel', vibe: 'Warm & dreamy' },
  { key: 'cloud-nine', name: 'Cloud Nine', cake: 'Vanilla Latte', filling: 'Vanilla Bean Ganache', vibe: 'Light & heavenly' },
  { key: 'pink-haze', name: 'Pink Haze', cake: 'Vanilla Bean', filling: 'Raspberry', vibe: 'Sweet & blushy' },
  { key: 'pink-skies', name: 'Pink Skies', cake: 'Lemon', filling: 'Raspberry', vibe: 'Bright & romantic' },
  { key: 'blush-silk', name: 'Blush Silk', cake: 'Vanilla Bean', filling: 'Fresh Strawberries', vibe: 'Soft & delicate' },
  { key: 'velvet-rush', name: 'Velvet Rush', cake: 'Chocolate', filling: 'Fresh Strawberries', vibe: 'Rich & indulgent' },
  { key: 'deep-end', name: 'Deep End', cake: 'Chocolate', filling: 'Raspberry', vibe: 'Bold & fruity' },
  { key: 'morning-ritual', name: 'Morning Ritual', cake: 'Vanilla Latte', filling: 'Salted Caramel', vibe: 'Cozy & decadent' },
  { key: 'after-hours', name: 'After Hours', cake: 'Chocolate', filling: 'Salted Caramel', vibe: 'Dark & sultry' },
  { key: 'red-affair', name: 'Red Affair', cake: 'Red Velvet', filling: 'Cream Cheese', vibe: 'Classic & dramatic' },
  { key: 'dark-matter', name: 'Dark Matter', cake: 'Chocolate', filling: 'Chocolate Ganache', vibe: 'Chocolate obsessed' },
  { key: 'party-edit', name: 'Party Edit', cake: 'Confetti', filling: 'Vanilla Bean Ganache', vibe: 'Fun & celebratory' },
  { key: 'double-take', name: 'Double Take', cake: 'Marble', filling: 'Chocolate Ganache', vibe: 'Best of both worlds' },
] as const;

const CAKE_BASES = ['Vanilla Bean', 'Chocolate', 'Confetti', 'Red Velvet', 'Lemon', 'Vanilla Latte', 'Marble'];
const FILLING_OPTIONS = ['Vanilla Bean Ganache', 'Chocolate Ganache', 'Salted Caramel', 'Fresh Strawberries', 'Raspberry', 'Cream Cheese'];

const CAKE_CURATED_BOXES = [
  {
    key: 'cake-party-girl', name: 'The Party Girl',
    tagline: 'Bold, bright & always a vibe',
    six: ['party-edit', 'pink-skies', 'after-hours', 'red-affair', 'double-take', 'morning-ritual'],
    four: ['after-hours', 'party-edit', 'double-take', 'red-affair'],
  },
  {
    key: 'cake-chocolate-lover', name: 'The Chocolate Lover',
    tagline: 'Rich, indulgent & unapologetically chocolate',
    six: ['dark-matter', 'double-take', 'red-affair', 'deep-end', 'after-hours', 'velvet-rush'],
    four: ['dark-matter', 'deep-end', 'velvet-rush', 'after-hours'],
  },
  {
    key: 'cake-classic-bride', name: 'The Classic Bride',
    tagline: 'A little bit of everything you\'ll love',
    six: ['timeless', 'dark-matter', 'velvet-rush', 'golden-hour', 'pink-haze', 'blush-silk'],
    four: ['timeless', 'golden-hour', 'blush-silk', 'pink-haze'],
  },
  {
    key: 'cake-soft-girl', name: 'The Soft Girl',
    tagline: 'Light, dreamy & effortlessly pretty',
    six: ['timeless', 'pink-skies', 'cloud-nine', 'golden-hour', 'blush-silk', 'pink-haze'],
    four: ['timeless', 'cloud-nine', 'golden-hour', 'pink-haze'],
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════
//  COOKIE DATA
// ═══════════════════════════════════════════════════════════════════════
const COOKIE_FLAVORS = [
  { key: 'chocolate-chip', name: 'Chocolate Chip' },
  { key: 'vanilla-bean-sugar', name: 'Vanilla Bean Sugar' },
  { key: 'cherry-almond', name: 'Cherry Almond' },
  { key: 'espresso-butterscotch', name: 'Espresso Butterscotch' },
  { key: 'lemon-sugar', name: 'Lemon Sugar' },
  { key: 'key-lime-pie', name: 'Key Lime Pie' },
  { key: 'blueberry-muffin', name: 'Blueberry Muffin' },
  { key: 'white-chocolate-raspberry', name: 'White Chocolate Raspberry' },
];

const COOKIE_CURATED_BOXES = [
  {
    key: 'cookie-classic-bride', name: 'The Classic Bride',
    tagline: 'A little bit of everything you\'ll love',
    flavors: ['chocolate-chip', 'vanilla-bean-sugar', 'cherry-almond', 'lemon-sugar', 'blueberry-muffin', 'white-chocolate-raspberry'],
  },
  {
    key: 'cookie-party-girl', name: 'The Party Girl',
    tagline: 'Bold, bright & always a vibe',
    flavors: ['chocolate-chip', 'espresso-butterscotch', 'white-chocolate-raspberry', 'blueberry-muffin', 'key-lime-pie', 'cherry-almond'],
  },
  {
    key: 'cookie-soft-girl', name: 'The Soft Girl',
    tagline: 'Sweet, fruity & effortlessly pretty',
    flavors: ['vanilla-bean-sugar', 'lemon-sugar', 'key-lime-pie', 'blueberry-muffin', 'white-chocolate-raspberry', 'cherry-almond'],
  },
] as const;

function getCakeByKey(key: string) {
  return MINI_CAKES.find(c => c.key === key);
}
function getCookieByKey(key: string) {
  return COOKIE_FLAVORS.find(c => c.key === key);
}

// ═══════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════
type ProductType = '' | 'cake' | 'cookie' | 'bundle';
type CakeBoxMode = '' | 'cake-party-girl' | 'cake-chocolate-lover' | 'cake-classic-bride' | 'cake-soft-girl' | 'cake-create-your-own';
type CookieBoxMode = '' | 'cookie-classic-bride' | 'cookie-party-girl' | 'cookie-soft-girl' | 'cookie-create-your-own';
type CakeCount = 4 | 6;

interface CustomCake {
  type: 'named' | 'custom';
  namedKey?: string;
  customBase?: string;
  customFilling?: string;
}

// ═══════════════════════════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════════════════════════
function TastingPageContent() {
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled');
  const formRef = useRef<HTMLDivElement>(null);
  const cakeCollectionRef = useRef<HTMLDivElement>(null);
  const [pendingScrollTarget, setPendingScrollTarget] = useState<'cake-collection' | 'form' | null>(null);

  // ── Top-level selection ─────────────────────────────────────────
  const [productType, setProductType] = useState<ProductType>('');

  // ── Cake state ──────────────────────────────────────────────────
  const [cakeBoxMode, setCakeBoxMode] = useState<CakeBoxMode>('');
  const [cakeCount, setCakeCount] = useState<CakeCount>(6);
  const [customCakes, setCustomCakes] = useState<CustomCake[]>([]);
  const [addOnCakes, setAddOnCakes] = useState<CustomCake[]>([]);
  const [customBase, setCustomBase] = useState('');
  const [customFilling, setCustomFilling] = useState('');
  const [addOnBase, setAddOnBase] = useState('');
  const [addOnFilling, setAddOnFilling] = useState('');

  // ── Cookie state ────────────────────────────────────────────────
  const [cookieBoxMode, setCookieBoxMode] = useState<CookieBoxMode>('');
  const [customCookies, setCustomCookies] = useState<string[]>([]);

  // ── Form state ──────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', weddingDate: '',
    pickupOrDelivery: 'pickup', deliveryLocation: '',
    pickupSlot: null as { date: string; time: string } | null,
    acknowledgePayment: false, acknowledgeAllergens: false, acknowledgeLeadTime: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string; description: string | null; discountType: 'percentage' | 'fixed'; discountValue: number; minOrderAmount: number;
  } | null>(null);

  // Reset sub-selections when product type changes
  useEffect(() => {
    setCakeBoxMode(''); setCookieBoxMode(''); setCustomCakes([]); setCustomCookies([]); setAddOnCakes([]);
  }, [productType]);

  useEffect(() => { setCustomCakes([]); }, [cakeBoxMode, cakeCount]);
  useEffect(() => { setCustomCookies([]); }, [cookieBoxMode]);

  // Scroll to form
  useEffect(() => {
    if ((productType === 'cake' && cakeBoxMode) || (productType === 'cookie' && cookieBoxMode) ||
        (productType === 'bundle' && cakeBoxMode && cookieBoxMode)) {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [productType, cakeBoxMode, cookieBoxMode]);

  useEffect(() => {
    if (!pendingScrollTarget) return;

    const targetRef = pendingScrollTarget === 'cake-collection' ? cakeCollectionRef : formRef;
    if (!targetRef.current) return;

    targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setPendingScrollTarget(null);
  }, [pendingScrollTarget, productType]);

  const handleProductSelect = (nextProductType: ProductType) => {
    setProductType(nextProductType);
    setPendingScrollTarget(nextProductType === 'cookie' ? 'form' : 'cake-collection');
  };

  // ── Pricing ─────────────────────────────────────────────────────
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const cakeBasePrice = cakeCount === 6 ? 7500 : 5500;
  const cookiePrice = 3500;
  const addOnPrice = addOnCakes.length * 1500;

  let totalAmount = 0;
  if (productType === 'cake') totalAmount = cakeBasePrice + addOnPrice;
  else if (productType === 'cookie') totalAmount = cookiePrice;
  else if (productType === 'bundle') totalAmount = (cakeCount === 6 ? 10000 : 8500) + addOnPrice;

  // ── Readiness checks ────────────────────────────────────────────
  const cakeIsCurated = cakeBoxMode !== '' && cakeBoxMode !== 'cake-create-your-own';
  const cakeIsCustom = cakeBoxMode === 'cake-create-your-own';
  const cakeReady = cakeIsCurated || (cakeIsCustom && customCakes.length === cakeCount);

  const cookieIsCurated = cookieBoxMode !== '' && cookieBoxMode !== 'cookie-create-your-own';
  const cookieIsCustom = cookieBoxMode === 'cookie-create-your-own';
  const cookieReady = cookieIsCurated || (cookieIsCustom && customCookies.length === 6);

  const isReady = productType === 'cake' ? cakeReady
    : productType === 'cookie' ? cookieReady
    : productType === 'bundle' ? cakeReady && cookieReady
    : false;

  // ── Curated cake helpers ────────────────────────────────────────
  const getCuratedCakes = () => {
    const box = CAKE_CURATED_BOXES.find(b => b.key === cakeBoxMode);
    if (!box) return [];
    return (cakeCount === 6 ? box.six : box.four).map(k => getCakeByKey(k)).filter(Boolean);
  };

  const getCuratedCookies = () => {
    const box = COOKIE_CURATED_BOXES.find(b => b.key === cookieBoxMode);
    if (!box) return [];
    return box.flavors.map(k => getCookieByKey(k)).filter(Boolean);
  };

  // ── Custom helpers ──────────────────────────────────────────────
  const addNamedCake = (key: string) => { if (customCakes.length < cakeCount) setCustomCakes(prev => [...prev, { type: 'named', namedKey: key }]); };
  const addCustomCake = (base: string, filling: string) => { if (customCakes.length < cakeCount) setCustomCakes(prev => [...prev, { type: 'custom', customBase: base, customFilling: filling }]); };
  const removeCustomCake = (i: number) => setCustomCakes(prev => prev.filter((_, idx) => idx !== i));

  const toggleCookie = (key: string) => {
    setCustomCookies(prev => prev.includes(key) ? prev.filter(k => k !== key) : prev.length < 6 ? [...prev, key] : prev);
  };

  const addAddOnNamed = (key: string) => setAddOnCakes(prev => [...prev, { type: 'named', namedKey: key }]);
  const addAddOnCustom = (base: string, filling: string) => setAddOnCakes(prev => [...prev, { type: 'custom', customBase: base, customFilling: filling }]);
  const removeAddOn = (i: number) => setAddOnCakes(prev => prev.filter((_, idx) => idx !== i));

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isReady) { setError('Please complete your tasting box selection.'); return; }
    if (!formData.pickupSlot) { setError('Please select a pickup date and time.'); return; }
    setIsSubmitting(true);

    const cakes = cakeIsCurated
      ? getCuratedCakes().map(c => ({ name: c!.name, cake: c!.cake, filling: c!.filling }))
      : customCakes.map(c => c.type === 'named'
        ? { name: getCakeByKey(c.namedKey!)!.name, cake: getCakeByKey(c.namedKey!)!.cake, filling: getCakeByKey(c.namedKey!)!.filling }
        : { name: 'Custom', cake: c.customBase!, filling: c.customFilling! });

    const cookies = cookieIsCurated
      ? getCuratedCookies().map(c => c!.name)
      : customCookies.map(k => getCookieByKey(k)!.name);

    const addOns = addOnCakes.map(c => c.type === 'named'
      ? { name: getCakeByKey(c.namedKey!)!.name, cake: getCakeByKey(c.namedKey!)!.cake, filling: getCakeByKey(c.namedKey!)!.filling }
      : { name: 'Custom', cake: c.customBase!, filling: c.customFilling! });

    const cakeBoxName = cakeIsCurated ? CAKE_CURATED_BOXES.find(b => b.key === cakeBoxMode)?.name : 'Create Your Own';
    const cookieBoxName = cookieIsCurated ? COOKIE_CURATED_BOXES.find(b => b.key === cookieBoxMode)?.name : 'Create Your Own';

    try {
      const response = await fetch('/api/orders/tasting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, email: formData.email, phone: formData.phone,
          wedding_date: formData.weddingDate,
          tasting_type: productType,
          box_name: productType === 'cookie' ? cookieBoxName : cakeBoxName,
          cookie_box_name: (productType === 'cookie' || productType === 'bundle') ? cookieBoxName : undefined,
          box_count: (productType === 'cake' || productType === 'bundle') ? cakeCount : undefined,
          cakes: (productType === 'cake' || productType === 'bundle') ? cakes : undefined,
          cookie_flavors: (productType === 'cookie' || productType === 'bundle') ? cookies : undefined,
          add_on_cakes: addOns.length > 0 ? addOns : undefined,
          pickup_or_delivery: formData.pickupOrDelivery,
          delivery_location: formData.deliveryLocation || undefined,
          pickup_date: formData.pickupSlot.date,
          pickup_time: formData.pickupSlot.time,
          coupon_code: appliedCoupon?.code || null,
        }),
      });
      const data = await response.json() as { checkoutUrl?: string; error?: string };
      if (!response.ok) throw new Error(data.error || 'Failed to submit order');
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════
  //  RENDER HELPERS
  // ═════════════════════════════════════════════════════════════════

  const renderCakeBoxPicker = () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-[#541409] mb-3">Pick your vibe</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CAKE_CURATED_BOXES.map((box) => (
            <button key={box.key} type="button" onClick={() => setCakeBoxMode(box.key as CakeBoxMode)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${cakeBoxMode === box.key ? 'border-[#541409] bg-[#541409]/5' : 'border-[#EAD6D6] hover:border-[#541409]/40 bg-white'}`}>
              <h4 className="font-serif text-[#541409] font-medium">{box.name}</h4>
              <p className="text-xs text-stone-500 italic mt-0.5">{box.tagline}</p>
              <ul className="mt-2 text-xs text-stone-600 space-y-0.5">
                {box.six.map(k => <li key={k}>{getCakeByKey(k)?.name}</li>)}
              </ul>
            </button>
          ))}
          <button type="button" onClick={() => setCakeBoxMode('cake-create-your-own')}
            className={`text-left p-4 rounded-lg border-2 transition-all ${cakeBoxMode === 'cake-create-your-own' ? 'border-[#541409] bg-[#541409]/5' : 'border-[#EAD6D6] hover:border-[#541409]/40 bg-white'}`}>
            <h4 className="font-serif text-[#541409] font-medium">Create Your Own</h4>
            <p className="text-xs text-stone-500 italic mt-0.5">You know what you like</p>
            <p className="mt-2 text-xs text-stone-600">Pick from our 14 flavors or mix &amp; match any cake base + filling</p>
          </button>
        </div>
      </div>

      {/* Count */}
      {cakeBoxMode && (
        <div>
          <p className="text-sm font-medium text-[#541409] mb-2">How many mini cakes?</p>
          <div className="grid grid-cols-2 gap-3">
            {([6, 4] as const).map(n => (
              <button key={n} type="button" onClick={() => setCakeCount(n)}
                className={`py-3 rounded-md text-sm font-medium transition-colors ${cakeCount === n ? 'bg-[#541409] text-[#EAD6D6]' : 'border border-[#541409] text-[#541409] hover:bg-[#EAD6D6]'}`}>
                {n} count &mdash; {n === 6 ? '$75' : '$55'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Curated contents */}
      {cakeIsCurated && (
        <div>
          <p className="text-sm font-medium text-[#541409] mb-2">Your box includes:</p>
          <div className="space-y-1.5">
            {getCuratedCakes().map(c => (
              <div key={c!.key} className="flex justify-between items-center p-3 bg-[#F7F3ED] rounded-lg">
                <span className="font-medium text-[#541409] text-sm">{c!.name}</span>
                <span className="text-xs text-stone-500">{c!.cake} &bull; {c!.filling}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create your own cakes */}
      {cakeIsCustom && (
        <div>
          <p className="text-sm font-medium text-[#541409] mb-2">Build your box <span className="text-[#541409]/50 font-normal">({customCakes.length}/{cakeCount})</span></p>
          {customCakes.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {customCakes.map((cake, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-[#F7F3ED] rounded-lg">
                  <span className="text-sm text-[#541409]">
                    {cake.type === 'named' ? getCakeByKey(cake.namedKey!)?.name : `${cake.customBase} + ${cake.customFilling}`}
                  </span>
                  <button type="button" onClick={() => removeCustomCake(i)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                </div>
              ))}
            </div>
          )}
          {customCakes.length < cakeCount && (
            <>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {MINI_CAKES.map(cake => (
                  <button key={cake.key} type="button" onClick={() => addNamedCake(cake.key)}
                    className="text-left p-2.5 text-xs border border-[#EAD6D6] rounded-lg hover:bg-[#F7F3ED] transition-colors">
                    <span className="font-medium text-[#541409]">{cake.name}</span>
                    <span className="block text-stone-500 mt-0.5">{cake.cake} &bull; {cake.filling}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-stone-500 mb-2">Or create a custom combo:</p>
              <div className="flex gap-2 items-end">
                <select value={customBase} onChange={e => setCustomBase(e.target.value)} className="flex-1 px-3 py-2 border border-stone-300 rounded-sm text-sm text-[#541409] bg-white">
                  <option value="">Cake base...</option>
                  {CAKE_BASES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={customFilling} onChange={e => setCustomFilling(e.target.value)} className="flex-1 px-3 py-2 border border-stone-300 rounded-sm text-sm text-[#541409] bg-white">
                  <option value="">Filling...</option>
                  {FILLING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <button type="button" disabled={!customBase || !customFilling}
                  onClick={() => { addCustomCake(customBase, customFilling); setCustomBase(''); setCustomFilling(''); }}
                  className="px-3 py-2 bg-[#541409] text-[#EAD6D6] rounded-sm text-sm hover:opacity-80 disabled:opacity-40">Add</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderCookieBoxPicker = () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-[#541409] mb-3">Pick your vibe</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COOKIE_CURATED_BOXES.map((box) => (
            <button key={box.key} type="button" onClick={() => setCookieBoxMode(box.key as CookieBoxMode)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${cookieBoxMode === box.key ? 'border-[#541409] bg-[#541409]/5' : 'border-[#EAD6D6] hover:border-[#541409]/40 bg-white'}`}>
              <h4 className="font-serif text-[#541409] font-medium">{box.name}</h4>
              <p className="text-xs text-stone-500 italic mt-0.5">{box.tagline}</p>
              <ul className="mt-2 text-xs text-stone-600 space-y-0.5">
                {box.flavors.map(k => <li key={k}>{getCookieByKey(k)?.name}</li>)}
              </ul>
            </button>
          ))}
          <button type="button" onClick={() => setCookieBoxMode('cookie-create-your-own')}
            className={`text-left p-4 rounded-lg border-2 transition-all ${cookieBoxMode === 'cookie-create-your-own' ? 'border-[#541409] bg-[#541409]/5' : 'border-[#EAD6D6] hover:border-[#541409]/40 bg-white'}`}>
            <h4 className="font-serif text-[#541409] font-medium">Create Your Own</h4>
            <p className="text-xs text-stone-500 italic mt-0.5">Mix your own cookie box</p>
            <p className="mt-2 text-xs text-stone-600">Choose any 6 flavors from the lineup</p>
          </button>
        </div>
      </div>

      {/* Curated cookie contents */}
      {cookieIsCurated && (
        <div>
          <p className="text-sm font-medium text-[#541409] mb-2">Your box includes (2 of each):</p>
          <div className="flex flex-wrap gap-2">
            {getCuratedCookies().map(c => (
              <span key={c!.key} className="px-3 py-1.5 bg-[#F7F3ED] rounded-full text-sm text-[#541409]">{c!.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Create your own cookies */}
      {cookieIsCustom && (
        <div>
          <p className="text-sm font-medium text-[#541409] mb-2">Pick 6 flavors <span className="text-[#541409]/50 font-normal">({customCookies.length}/6)</span></p>
          <div className="grid grid-cols-2 gap-2">
            {COOKIE_FLAVORS.map(flavor => {
              const selected = customCookies.includes(flavor.key);
              const disabled = !selected && customCookies.length >= 6;
              return (
                <button key={flavor.key} type="button" onClick={() => !disabled && toggleCookie(flavor.key)}
                  className={`p-3 rounded-lg text-sm text-left transition-all ${selected ? 'bg-[#541409] text-[#EAD6D6]' : disabled ? 'border border-stone-200 text-stone-400' : 'border border-[#EAD6D6] text-[#541409] hover:bg-[#F7F3ED]'}`}>
                  {flavor.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderAddOns = () => (
    <div className="pt-4 border-t border-[#EAD6D6]">
      <p className="text-sm font-medium text-[#541409] mb-1">Want to try even more?</p>
      <p className="text-xs text-stone-500 mb-3">Add extra mini cakes for $15 each</p>
      {addOnCakes.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {addOnCakes.map((cake, i) => (
            <div key={i} className="flex justify-between items-center p-2.5 bg-[#F7F3ED] rounded-lg text-sm">
              <span className="text-[#541409]">
                {cake.type === 'named' ? getCakeByKey(cake.namedKey!)?.name : `${cake.customBase} + ${cake.customFilling}`}
                <span className="text-stone-400 ml-1">(+$15)</span>
              </span>
              <button type="button" onClick={() => removeAddOn(i)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {MINI_CAKES.map(cake => (
          <button key={cake.key} type="button" onClick={() => addAddOnNamed(cake.key)}
            className="px-2.5 py-1 text-xs border border-[#EAD6D6] rounded-full hover:bg-[#F7F3ED] text-[#541409] transition-colors">+ {cake.name}</button>
        ))}
      </div>
      <details className="mt-2">
        <summary className="text-xs text-[#541409]/50 cursor-pointer hover:text-[#541409]">Add a custom combo</summary>
        <div className="flex gap-2 items-end mt-2">
          <select value={addOnBase} onChange={e => setAddOnBase(e.target.value)} className="flex-1 px-2 py-1.5 border border-stone-300 rounded-sm text-xs text-[#541409] bg-white">
            <option value="">Cake base...</option>
            {CAKE_BASES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={addOnFilling} onChange={e => setAddOnFilling(e.target.value)} className="flex-1 px-2 py-1.5 border border-stone-300 rounded-sm text-xs text-[#541409] bg-white">
            <option value="">Filling...</option>
            {FILLING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <button type="button" disabled={!addOnBase || !addOnFilling}
            onClick={() => { addAddOnCustom(addOnBase, addOnFilling); setAddOnBase(''); setAddOnFilling(''); }}
            className="px-2 py-1.5 bg-[#541409] text-[#EAD6D6] rounded-sm text-xs hover:opacity-80 disabled:opacity-40">Add</button>
        </div>
      </details>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════
  //  MAIN RENDER
  // ═════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28" style={{ background: `repeating-linear-gradient(90deg, #F7F3ED 0px, #F7F3ED 40px, #EAD6D6 40px, #EAD6D6 80px)` }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm tracking-widest text-[#541409]/60 uppercase mb-4">For the bride-to-be</p>
          <h1 className="text-4xl sm:text-6xl font-serif text-[#541409] font-bold leading-tight">
            Find <em>Your</em> Flavors
          </h1>
          <p className="mt-6 text-lg text-[#541409]/70 max-w-2xl mx-auto leading-relaxed">
            Before you commit, fall in love. My tasting boxes let you and your partner sample
            handcrafted mini cakes and cookies so your wedding desserts are exactly what you&apos;ve been dreaming of.
          </p>
          <p className="mt-4 text-sm text-[#541409]/50">
            Book your wedding desserts within 30 days and <strong>50% of your tasting fee is credited</strong> toward your order.
          </p>
        </div>
      </section>

      {/* ── Choose Your Experience ─────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#F7F3ED]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-serif text-[#541409] text-center mb-2">Choose Your Experience</h2>
          <p className="text-center text-stone-500 mb-10">The sweetest way to plan your wedding desserts</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cake Tasting */}
            <button onClick={() => handleProductSelect('cake')}
              className={`text-left p-6 rounded-xl border-2 transition-all group ${productType === 'cake' ? 'border-[#541409] bg-white shadow-lg scale-[1.02]' : 'border-[#EAD6D6] bg-white hover:border-[#541409]/40 hover:shadow-md'}`}>
                            <h3 className="font-serif text-[#541409] text-xl font-medium">Cake Tasting Box</h3>
              <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                12oz mini cakes layered with filling &amp; topped with mock swiss buttercream.
                Fall in love with every bite.
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#541409]">$55</span>
                <span className="text-sm text-stone-400">4 count</span>
                <span className="text-stone-300 mx-1">|</span>
                <span className="text-2xl font-bold text-[#541409]">$75</span>
                <span className="text-sm text-stone-400">6 count</span>
              </div>
              <p className="text-xs text-stone-400 mt-2">+ $15 per add-on cake</p>
            </button>

            {/* Cookie Tasting */}
            <button onClick={() => handleProductSelect('cookie')}
              className={`text-left p-6 rounded-xl border-2 transition-all group ${productType === 'cookie' ? 'border-[#541409] bg-white shadow-lg scale-[1.02]' : 'border-[#EAD6D6] bg-white hover:border-[#541409]/40 hover:shadow-md'}`}>
                            <h3 className="font-serif text-[#541409] text-xl font-medium">Cookie Tasting Box</h3>
              <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                6 flavors, 2 of each — 12 soft &amp; chewy cookies to share with your
                partner. Individually sealed for freshness.
              </p>
              <div className="mt-4">
                <span className="text-2xl font-bold text-[#541409]">$35</span>
                <span className="text-sm text-stone-400 ml-2">12 cookies</span>
              </div>
            </button>

            {/* The All In Bride Bundle */}
            <button onClick={() => handleProductSelect('bundle')}
              className={`text-left p-6 rounded-xl border-2 transition-all group relative overflow-hidden ${productType === 'bundle' ? 'border-[#541409] bg-white shadow-lg scale-[1.02]' : 'border-[#EAD6D6] bg-white hover:border-[#541409]/40 hover:shadow-md'}`}>
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#541409] text-[#EAD6D6] rounded text-[10px] font-medium">BEST VALUE</div>
                            <h3 className="font-serif text-[#541409] text-xl font-medium">The All In Bride</h3>
              <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                Get the full experience — a cake tasting box <em>and</em> a cookie tasting box.
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#541409]">$85</span>
                <span className="text-sm text-stone-400">4-ct cake</span>
                <span className="text-stone-300 mx-1">|</span>
                <span className="text-2xl font-bold text-[#541409]">$100</span>
                <span className="text-sm text-stone-400">6-ct cake</span>
              </div>
              <p className="text-xs text-[#541409]/60 mt-2 font-medium">Save up to $10</p>
            </button>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-serif text-[#541409] text-center mb-3">Recent Tastings</h2>
          <p className="text-center text-stone-500 mb-6">A little peek at some recent tasting boxes and sweet extras</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="aspect-[5/6] rounded-xl overflow-hidden shadow-sm">
                <img src="/tastings.jpg" alt="Tastings" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <div className="aspect-[5/6] rounded-xl overflow-hidden shadow-sm">
                <img src="/tastings2.jpg" alt="Tastings 2" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <div className="aspect-[5/6] rounded-xl overflow-hidden shadow-sm">
                <img src="/spring-box.jpg" alt="Spring box" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mini Cake Menu ─────────────────────────────────────────── */}
      {(productType === 'cake' || productType === 'bundle') && (
        <section className="py-12 bg-white">
          <div ref={cakeCollectionRef} className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-serif text-[#541409] text-center mb-2">The Mini Cake Collection</h2>
            <p className="text-center text-sm text-stone-500 mb-8">Each 12oz cake is layered with filling &amp; finished with mock swiss buttercream</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {MINI_CAKES.map(cake => (
                <div key={cake.key} className="p-4 rounded-xl bg-[#F7F3ED] border border-[#EAD6D6]/50">
                  <h3 className="font-serif text-[#541409] font-medium">{cake.name}</h3>
                  <p className="text-xs text-stone-500 mt-1">{cake.cake} &bull; {cake.filling}</p>
                  <p className="text-[10px] text-[#541409]/40 italic mt-1">{cake.vibe}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Configurator / Order Form ──────────────────────────────── */}
      {productType && (
        <section className="py-16 bg-[#EAD6D6]">
          <div ref={formRef} className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-2xl font-serif text-[#541409] mb-6 text-center">
                {productType === 'cake' ? 'Build Your Cake Box' : productType === 'cookie' ? 'Build Your Cookie Box' : 'Build Your Bundle'}
              </h2>

              {cancelled && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                  Your payment was cancelled. You can try again below.
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Cake section */}
                {(productType === 'cake' || productType === 'bundle') && (
                  <div>
                    {productType === 'bundle' && <h3 className="font-serif text-[#541409] text-lg mb-3">Your Cake Box</h3>}
                    {renderCakeBoxPicker()}
                  </div>
                )}

                {/* Cookie section */}
                {(productType === 'cookie' || productType === 'bundle') && (
                  <div className={productType === 'bundle' ? 'pt-6 border-t border-[#EAD6D6]' : ''}>
                    {productType === 'bundle' && <h3 className="font-serif text-[#541409] text-lg mb-3">Your Cookie Box</h3>}
                    {renderCookieBoxPicker()}
                  </div>
                )}

                {/* Add-ons (cake/bundle only) */}
                {(productType === 'cake' || productType === 'bundle') && cakeBoxMode && renderAddOns()}

                {/* Contact info */}
                <div className="pt-6 border-t border-[#EAD6D6]">
                  <h3 className="text-xl font-serif text-[#541409] mb-4">Your Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-[#541409] mb-1">Name <span className="text-red-500">*</span></label>
                      <input type="text" id="name" required className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] text-[#541409]" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#541409] mb-1">Email <span className="text-red-500">*</span></label>
                      <input type="email" id="email" required className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] text-[#541409]" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-[#541409] mb-1">Phone <span className="text-red-500">*</span></label>
                      <input type="tel" id="phone" required className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] text-[#541409]" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="weddingDate" className="block text-sm font-medium text-[#541409] mb-1">Wedding / Event Date</label>
                      <input type="date" id="weddingDate" className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#541409] text-[#541409]" value={formData.weddingDate} onChange={e => setFormData({ ...formData, weddingDate: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Pickup */}
                <TimeSlotPicker orderType="tasting" value={formData.pickupSlot ?? undefined} onChange={slot => setFormData({ ...formData, pickupSlot: slot })} label="Preferred Pickup Date & Time" required />

                <CouponInput orderType="tasting" onCouponApplied={setAppliedCoupon} appliedCoupon={appliedCoupon} />

                {/* Order Summary */}
                <div className="bg-[#F7F3ED] rounded-xl p-5">
                  <h3 className="text-lg font-serif text-[#541409] mb-3">Order Summary</h3>
                  {(productType === 'cake' || productType === 'bundle') && (
                    <div className="text-sm flex justify-between text-[#541409]">
                      <span>Cake Tasting Box ({cakeCount} count){productType === 'bundle' ? '' : ''}</span>
                      <span>{productType === 'bundle' ? '' : formatPrice(cakeBasePrice)}</span>
                    </div>
                  )}
                  {(productType === 'cookie' || productType === 'bundle') && (
                    <div className="text-sm flex justify-between text-[#541409] mt-1">
                      <span>Cookie Tasting Box (12 cookies)</span>
                      <span>{productType === 'bundle' ? '' : formatPrice(cookiePrice)}</span>
                    </div>
                  )}
                  {productType === 'bundle' && (
                    <div className="text-sm flex justify-between text-[#541409] mt-1 font-medium">
                      <span>The All In Bride Bundle</span>
                      <span>{formatPrice(cakeCount === 6 ? 10000 : 8500)}</span>
                    </div>
                  )}
                  {addOnCakes.length > 0 && (
                    <div className="text-sm flex justify-between text-[#541409] mt-1">
                      <span>{addOnCakes.length} add-on cake{addOnCakes.length > 1 ? 's' : ''}</span>
                      <span>{formatPrice(addOnPrice)}</span>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-[#EAD6D6] font-medium flex justify-between text-[#541409] text-lg">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* Policies */}
                <div>
                  <h3 className="text-lg font-serif text-[#541409] mb-3">Policies</h3>
                  <div className="space-y-2">
                    <label className="flex items-start cursor-pointer p-3 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                      <input type="checkbox" required checked={formData.acknowledgePayment} onChange={e => setFormData({ ...formData, acknowledgePayment: e.target.checked })} className="w-4 h-4 mt-0.5 flex-shrink-0 accent-[#541409]" />
                      <span className="ml-3 text-sm text-stone-600">I understand that <strong>tasting box payments are non-refundable</strong>, but 50% will be credited toward my wedding order if booked within 30 days. <span className="text-red-500">*</span></span>
                    </label>
                    <label className="flex items-start cursor-pointer p-3 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                      <input type="checkbox" required checked={formData.acknowledgeAllergens} onChange={e => setFormData({ ...formData, acknowledgeAllergens: e.target.checked })} className="w-4 h-4 mt-0.5 flex-shrink-0 accent-[#541409]" />
                      <span className="ml-3 text-sm text-stone-600">I understand all products are made in a kitchen that contains <strong>dairy, eggs, tree nuts, peanuts, and soy</strong>. <span className="text-red-500">*</span></span>
                    </label>
                    <label className="flex items-start cursor-pointer p-3 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                      <input type="checkbox" required checked={formData.acknowledgeLeadTime} onChange={e => setFormData({ ...formData, acknowledgeLeadTime: e.target.checked })} className="w-4 h-4 mt-0.5 flex-shrink-0 accent-[#541409]" />
                      <span className="ml-3 text-sm text-stone-600">I understand tasting boxes require at least <strong>2 weeks notice</strong>. Need it sooner? May be available for a $10 rush fee — just ask! <span className="text-red-500">*</span></span>
                    </label>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting || !isReady}
                  className="w-full px-8 py-4 bg-[#541409] text-[#EAD6D6] text-lg font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                </button>
                <p className="text-xs text-stone-400 text-center">Securely processed through Stripe</p>
              </form>
            </div>

            <div className="mt-8 text-center">
              <Link href="/weddings" className="text-[#541409] hover:opacity-70 transition-opacity">&larr; Back to Weddings</Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default function TastingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#541409]"></div></div>}>
      <TastingPageContent />
    </Suspense>
  );
}
