'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { TimeSlotPicker } from '@/components/forms';

type ProductType = 'cookie_cups' | 'cookie_cake' | 'cookie_cups_and_cake';
type CookieCupQuantity = '' | '12' | '24' | '36' | '48';
type CookieCakeSize = '' | '6-inch' | '8-inch' | '10-inch';
type CookieCakeConfigSize = '6-inch' | '8-inch' | '10-inch';
type CookieCakeShape = '' | 'round' | 'heart';
type CookieCakeLayers = '' | '1' | '2';
type CookieCakeSizeLayer = '' | '6-inch-1' | '6-inch-2' | '8-inch-1' | '8-inch-2' | '10-inch-1' | '10-inch-2';

const cookieCupOptions = [
  { value: '12', label: '1 Dozen', price: 30 },
  { value: '24', label: '2 Dozen', price: 60 },
  { value: '36', label: '3 Dozen', price: 90 },
  { value: '48', label: '4 Dozen', price: 120 },
];

const cookieCakeConfigurations = {
  '6-inch': {
    shapes: ['round', 'heart'],
    layers: {
      '1': { price: 25, servings: '2-4' },
      '2': { price: 50, servings: '6-8' },
    },
  },
  '8-inch': {
    shapes: ['round', 'heart'],
    layers: {
      '1': { price: 40, servings: '6-8' },
      '2': { price: 80, servings: '10-14' },
    },
  },
  '10-inch': {
    shapes: ['round'],
    layers: {
      '1': { price: 55, servings: '10-14' },
      '2': { price: 110, servings: '16-20' },
    },
  },
} as const;

const cookieCakeAddOns = [
  { value: 'chocolate-molds', label: 'Chocolate Molds (+$4)', price: 400 },
  { value: 'edible-glitter', label: 'Edible Glitter (+$2)', price: 200 },
  { value: 'sprinkles', label: 'Sprinkles (+$4)', price: 400 },
  { value: 'other', label: 'Other (starting at +$4)', price: 400 },
];

const eventOptions = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'baby-shower', label: 'Baby Shower' },
  { value: 'bridal-shower', label: 'Bridal Shower' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'other', label: 'Other' },
];

const messageStyleOptions = [
  { value: 'piped', label: 'Piped' },
  { value: 'piped-cursive', label: 'Piped Cursive' },
  { value: 'block', label: 'Block' },
];

function CookieCupsAndCakesContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    productType: 'cookie_cups' as ProductType,
    name: '',
    email: '',
    phone: '',
    pickupSlot: null as { date: string; time: string } | null,
    eventType: '',
    quantity: '' as CookieCupQuantity,
    chocolateMolds: false,
    edibleGlitter: false,
    colors: '',
    designDetails: '',
    size: '' as CookieCakeSize,
    shape: '' as CookieCakeShape,
    layers: '' as CookieCakeLayers,
    sizeLayer: '' as CookieCakeSizeLayer,
    baseColor: '',
    pipingColors: '',
    customMessaging: '',
    messageStyle: '',
    toppings: [] as string[],
    inspirationFiles: [] as File[],
    allergies: '',
    howDidYouHear: '',
    message: '',
    acknowledgeDeposit: false,
    acknowledgeAllergens: false,
    acknowledgeLeadTime: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const includesCookieCups = formData.productType === 'cookie_cups' || formData.productType === 'cookie_cups_and_cake';
  const includesCookieCake = formData.productType === 'cookie_cake' || formData.productType === 'cookie_cups_and_cake';
  const derivedProductType: ProductType =
    includesCookieCups && includesCookieCake
      ? 'cookie_cups_and_cake'
      : includesCookieCake
        ? 'cookie_cake'
        : 'cookie_cups';
  const dozensCount = formData.quantity ? parseInt(formData.quantity, 10) / 12 : 0;
  const cookieCupsBasePrice = dozensCount * 3000;
  const cookieCupsMoldPrice = formData.chocolateMolds ? dozensCount * 400 : 0;
  const cookieCupsGlitterPrice = formData.edibleGlitter ? dozensCount * 200 : 0;
  const cookieCupsTotal = cookieCupsBasePrice + cookieCupsMoldPrice + cookieCupsGlitterPrice;

  const cookieCakeSelection = useMemo(() => {
    if (!formData.size || !formData.layers) return null;
    return cookieCakeConfigurations[formData.size]?.layers[formData.layers];
  }, [formData.size, formData.layers]);

  const cookieCakeAddOnPrice = formData.toppings.reduce((total, topping) => {
    const addOn = cookieCakeAddOns.find((item) => item.value === topping);
    return total + (addOn?.price || 0);
  }, 0);
  const cookieCakeTotal = (cookieCakeSelection?.price || 0) * 100 + cookieCakeAddOnPrice;
  const currentShapes = formData.size ? cookieCakeConfigurations[formData.size].shapes : [];
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  const toggleProduct = (product: 'cookie_cups' | 'cookie_cake') => {
    setFormData((prev) => {
      const hasCookieCups = prev.productType === 'cookie_cups' || prev.productType === 'cookie_cups_and_cake';
      const hasCookieCake = prev.productType === 'cookie_cake' || prev.productType === 'cookie_cups_and_cake';

      const nextCookieCups = product === 'cookie_cups' ? !hasCookieCups : hasCookieCups;
      const nextCookieCake = product === 'cookie_cake' ? !hasCookieCake : hasCookieCake;

      let nextProductType: ProductType;
      if (nextCookieCups && nextCookieCake) {
        nextProductType = 'cookie_cups_and_cake';
      } else if (nextCookieCake) {
        nextProductType = 'cookie_cake';
      } else if (nextCookieCups) {
        nextProductType = 'cookie_cups';
      } else {
        nextProductType = 'cookie_cups';
      }

      return { ...prev, productType: nextProductType };
    });
  };

  useEffect(() => {
    const product = searchParams.get('product');
    const quantity = searchParams.get('quantity');
    const size = searchParams.get('size');
    const layers = searchParams.get('layers');
    const shape = searchParams.get('shape');

    setFormData((prev) => {
      const next = { ...prev };

      if (product === 'cookie_cups') {
        next.productType = 'cookie_cups';
        if (quantity && ['12', '24', '36', '48'].includes(quantity)) {
          next.quantity = quantity as CookieCupQuantity;
        }
      }

      if (product === 'cookie_cake') {
        next.productType = 'cookie_cake';
        if (size && ['6-inch', '8-inch', '10-inch'].includes(size)) {
          next.size = size as CookieCakeSize;
        }
        if (layers && ['1', '2'].includes(layers)) {
          next.layers = layers as CookieCakeLayers;
        }
        if (size && layers && ['6-inch', '8-inch', '10-inch'].includes(size) && ['1', '2'].includes(layers)) {
          next.sizeLayer = `${size}-${layers}` as CookieCakeSizeLayer;
        }

        const sizeForShape = (size && ['6-inch', '8-inch', '10-inch'].includes(size) ? size : next.size) as CookieCakeSize;
        if (shape && ['round', 'heart'].includes(shape)) {
          const allowedShapes = sizeForShape ? [...cookieCakeConfigurations[sizeForShape].shapes] as CookieCakeShape[] : [];
          next.shape = allowedShapes.includes(shape as CookieCakeShape) ? shape as CookieCakeShape : '';
        }
      }

      return next;
    });
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.pickupSlot) {
      setSubmitError('Please select a pickup date and time.');
      return;
    }

    if (!formData.eventType) {
      setSubmitError('Please select an event type.');
      return;
    }

    if (!includesCookieCups && !includesCookieCake) {
      setSubmitError('Please choose cookie cups, a cookie cake, or both.');
      return;
    }

    if (includesCookieCups && !formData.quantity) {
      setSubmitError('Please select a cookie cup quantity.');
      return;
    }

    if (includesCookieCake && (!formData.size || !formData.shape || !formData.layers)) {
      setSubmitError('Please choose a cookie cake size, shape, and layer count.');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('product_type', derivedProductType);
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('pickup_date', formData.pickupSlot.date);
      submitData.append('pickup_time', formData.pickupSlot.time);
      submitData.append('event_type', formData.eventType);
      submitData.append('allergies', formData.allergies);
      submitData.append('how_did_you_hear', formData.howDidYouHear);
      submitData.append('notes', formData.message);

      if (includesCookieCake) {
        submitData.append('size', formData.size);
        submitData.append('shape', formData.shape);
        submitData.append('layers', formData.layers);
        submitData.append('base_color', formData.baseColor);
        submitData.append('piping_colors', formData.pipingColors);
        submitData.append('custom_messaging', formData.customMessaging);
        submitData.append('message_style', formData.messageStyle);
        submitData.append('toppings', JSON.stringify(formData.toppings));
        submitData.append('design_details', formData.designDetails);
      }
      if (includesCookieCups) {
        submitData.append('quantity', formData.quantity);
        submitData.append('chocolate_molds', String(formData.chocolateMolds));
        submitData.append('edible_glitter', String(formData.edibleGlitter));
        submitData.append('colors', formData.colors);
      }
      submitData.append('design_details', formData.designDetails);

      formData.inspirationFiles.forEach((file) => {
        submitData.append('inspiration_images', file);
      });

      const response = await fetch('/api/orders/cookie-cups-cakes', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      window.location.href = '/';
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
          <h1 className="text-4xl sm:text-5xl font-serif text-[#4A2C21] font-bold">
            Cookie Cups & Cakes
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            Chocolate chip cookie cups and thick cookie cakes made for sweet little celebrations
          </p>
          <a
            href="#order-form"
            className="inline-flex mt-6 px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
          >
            Order Now
          </a>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-lg text-stone-600 leading-relaxed">
            Choose between mini chocolate chip cookie cups with vanilla buttercream or a thicker chocolate chip
            cookie cake decorated with buttercream, piped details, custom colors, and messaging. Everything is
            designed to feel celebration-ready while keeping the ordering process simple.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-12">
            Sizes & Pricing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cookieCupOptions.map((option) => (
              <Link
                key={option.value}
                href={`/cookie-cups-cakes?product=cookie_cups&quantity=${option.value}#order-form`}
                className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
              >
                <h3 className="text-xl font-serif text-[#541409] mb-2">{option.label} Cookie Cups</h3>
                <p className="text-2xl font-bold text-[#541409] mb-2">${option.price}</p>
                <p className="text-sm text-stone-600">Mini buttercream cookie cups</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <Link href="/cookie-cups-cakes?product=cookie_cake&size=6-inch&shape=heart&layers=1#order-form" className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
              <h3 className="text-xl font-serif text-[#541409] mb-2">6&quot; Heart or Round</h3>
              <p className="text-lg font-bold text-[#541409] mb-1">$25 one layer</p>
              <p className="text-lg font-bold text-[#541409] mb-2">$50 two layers</p>
              <p className="text-sm text-stone-600">Serves 2-4 or 6-8</p>
            </Link>
            <Link href="/cookie-cups-cakes?product=cookie_cake&size=8-inch&shape=heart&layers=1#order-form" className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
              <h3 className="text-xl font-serif text-[#541409] mb-2">8&quot; Heart or Round</h3>
              <p className="text-lg font-bold text-[#541409] mb-1">$40 one layer</p>
              <p className="text-lg font-bold text-[#541409] mb-2">$80 two layers</p>
              <p className="text-sm text-stone-600">Serves 6-8 or 10-14</p>
            </Link>
            <Link href="/cookie-cups-cakes?product=cookie_cake&size=10-inch&shape=round&layers=1#order-form" className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
              <h3 className="text-xl font-serif text-[#541409] mb-2">10&quot; Round</h3>
              <p className="text-lg font-bold text-[#541409] mb-1">$55 one layer</p>
              <p className="text-lg font-bold text-[#541409] mb-2">$110 two layers</p>
              <p className="text-sm text-stone-600">Serves 10-14 or 16-20</p>
            </Link>
          </div>

          <p className="text-center text-stone-600 mt-8 text-sm">
            Cookie cake pricing includes buttercream, piped designs, custom colors, and messaging.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-12">
            Recent Creations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <a href="#order-form" className="aspect-square rounded-lg overflow-hidden block">
                <img src="/cookie-cups.jpg" alt="Cookie cups" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </a>
              <p className="text-center text-stone-600 text-sm mt-2">2 dozen cups</p>
            </div>
            <div>
              <a href="#order-form" className="aspect-square rounded-lg overflow-hidden block">
                <img src="/cyanna-cookie-cake.jpg" alt="Cyanna cookie cake" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </a>
              <p className="text-center text-stone-600 text-sm mt-2">6in 2-layer heart</p>
            </div>
            <div>
              <a href="#order-form" className="aspect-square rounded-lg overflow-hidden block">
                <img src="/kayla-cups.jpg" alt="Kayla cups" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </a>
              <p className="text-center text-stone-600 text-sm mt-2">2 dozen cups</p>
            </div>
            <div>
              <a href="#order-form" className="aspect-square rounded-lg overflow-hidden block">
                <img src="/easter-cookie-cake-recent.jpeg" alt="Easter cookie cake" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </a>
              <p className="text-center text-stone-600 text-sm mt-2">6in 2-layer round</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/gallery" className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity">
              See More in the Gallery
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-12">
            Good to Know
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-medium text-[#541409] mb-2">Lead Time</h3>
              <p className="text-stone-600 text-sm">
                Please order at least 1 week in advance. Rush orders may be available for an extra cost.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-medium text-[#541409] mb-2">Deposit</h3>
              <p className="text-stone-600 text-sm">
                A 50% deposit is required to secure your order date.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-medium text-[#541409] mb-2">Cookie Cakes</h3>
              <p className="text-stone-600 text-sm">
                Cookie cakes are chocolate chip only and a bit thicker than a typical cookie cake.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-medium text-[#541409] mb-2">Add-Ons</h3>
              <p className="text-stone-600 text-sm">
                Cookie cakes can include chocolate molds, edible glitter, sprinkles, and other custom details.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="order-form" className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-[#EAD6D6] rounded-lg p-6 mb-8">
            <p className="text-[#541409] text-sm font-medium">
              Rush orders may be available for an additional fee.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-serif text-[#541409] mb-3">What would you like?</h2>
                <p className="text-xs text-stone-600 mb-3">Select one or both!</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toggleProduct('cookie_cups')}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${includesCookieCups ? 'border-[#541409] bg-[#541409]/5 ring-1 ring-[#541409]' : 'border-[#EAD6D6] hover:border-[#541409]/50'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base font-serif text-[#541409]">Cookie Cups</span>
                      <span className="text-lg font-medium text-[#541409]">$30+</span>
                    </div>
                    <span className="block text-sm text-stone-500">Mini buttercream cookie cups</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleProduct('cookie_cake')}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${includesCookieCake ? 'border-[#541409] bg-[#541409]/5 ring-1 ring-[#541409]' : 'border-[#EAD6D6] hover:border-[#541409]/50'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base font-serif text-[#541409]">Cookie Cake</span>
                      <span className="text-lg font-medium text-[#541409]">$25+</span>
                    </div>
                    <span className="block text-sm text-stone-500">Layered chocolate chip cookie cake</span>
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Your Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#541409] mb-2">Name <span className="text-red-500">*</span></label>
                    <input id="name" type="text" required className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#541409] mb-2">Email <span className="text-red-500">*</span></label>
                    <input id="email" type="email" required className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-[#541409] mb-2">Phone <span className="text-red-500">*</span></label>
                    <input id="phone" type="tel" required className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
              </div>

              <div>
                <TimeSlotPicker
                  orderType="cookie_cups"
                  value={formData.pickupSlot ?? undefined}
                  onChange={(slot) => setFormData({ ...formData, pickupSlot: slot })}
                  label="Preferred Pickup Date & Time"
                  required
                />
              </div>

              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Event Details</h2>
                <label htmlFor="eventType" className="block text-sm font-medium text-[#541409] mb-2">Event Type <span className="text-red-500">*</span></label>
                <select id="eventType" required className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.eventType ? 'text-[#541409]' : 'text-[#541409]/50'}`} value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}>
                  <option value="">Select an option</option>
                  {eventOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {includesCookieCups && (
                <>
                  <div>
                    <h2 className="text-xl font-serif text-[#541409] mb-4">Cookie Cup Details</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {cookieCupOptions.map((option) => (
                        <button key={option.value} type="button" onClick={() => setFormData({ ...formData, quantity: option.value as CookieCupQuantity })} className={`py-4 px-4 rounded-md text-center font-medium transition-colors ${formData.quantity === option.value ? 'bg-[#541409] text-[#EAD6D6]' : 'border border-[#541409] text-[#541409] hover:bg-[#EAD6D6]'}`}>
                          <span className="block text-lg">{option.label}</span>
                          <span className="block text-sm opacity-80">${option.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-serif text-[#541409] mb-4">Add-Ons</h2>
                    <div className="space-y-2">
                      <label className="flex items-center cursor-pointer p-4 border border-[#EAD6D6] rounded hover:bg-[#EAD6D6]/10 transition-colors">
                        <input type="checkbox" checked={formData.chocolateMolds} onChange={(e) => setFormData({ ...formData, chocolateMolds: e.target.checked })} className="w-5 h-5 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]" />
                        <span className="ml-3 text-[#541409]">Chocolate Molds (+$4/dozen)</span>
                      </label>
                      <label className="flex items-center cursor-pointer p-4 border border-[#EAD6D6] rounded hover:bg-[#EAD6D6]/10 transition-colors">
                        <input type="checkbox" checked={formData.edibleGlitter} onChange={(e) => setFormData({ ...formData, edibleGlitter: e.target.checked })} className="w-5 h-5 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]" />
                        <span className="ml-3 text-[#541409]">Edible Glitter (+$2/dozen)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-serif text-[#541409] mb-4">Design</h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="colors" className="block text-sm font-medium text-[#541409] mb-2">Colors</label>
                        <input id="colors" type="text" placeholder="Pink and gold, sage and cream, etc." className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]" value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} />
                      </div>
                      <div>
                        <label htmlFor="cookieCupDesignDetails" className="block text-sm font-medium text-[#541409] mb-2">Design Details</label>
                        <textarea id="cookieCupDesignDetails" rows={3} placeholder="Describe your theme, details, or anything you'd like me to match." className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409]" value={formData.designDetails} onChange={(e) => setFormData({ ...formData, designDetails: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {includesCookieCake && (
                <>
                  <div>
                    <h2 className="text-xl font-serif text-[#541409] mb-4">Cookie Cake Details</h2>
                    <div className="bg-[#EAD6D6] rounded-lg p-4 mb-4">
                      <p className="text-sm text-stone-700">Pricing includes buttercream, piped designs, custom colors, and messaging. Cookie cakes are chocolate chip only and thicker than a typical cookie cake.</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="sizeLayer" className="block text-sm font-medium text-[#541409] mb-2">Size & Layers <span className="text-red-500">*</span></label>
                        <select id="sizeLayer" required={includesCookieCake} className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.sizeLayer ? 'text-[#541409]' : 'text-[#541409]/50'}`} value={formData.sizeLayer} onChange={(e) => {
                          const value = e.target.value as CookieCakeSizeLayer;
                          if (!value) {
                            setFormData({ ...formData, sizeLayer: '', size: '', layers: '', shape: '' });
                            return;
                          }
                          const [newSize, newLayers] = value.split(/-(?=\d$)/) as [CookieCakeConfigSize, CookieCakeLayers];
                          const allowedShapes = [...cookieCakeConfigurations[newSize].shapes] as CookieCakeShape[];
                          const nextShape = allowedShapes.includes(formData.shape) ? formData.shape : allowedShapes[0];
                          setFormData({ ...formData, sizeLayer: value, size: newSize, layers: newLayers, shape: nextShape });
                        }}>
                          <option value="">Select an option</option>
                          <option value="6-inch-1">6&quot; 1 Layer - $25 (serves 2-4)</option>
                          <option value="6-inch-2">6&quot; 2 Layers - $50 (serves 6-8)</option>
                          <option value="8-inch-1">8&quot; 1 Layer - $40 (serves 6-8)</option>
                          <option value="8-inch-2">8&quot; 2 Layers - $80 (serves 10-14)</option>
                          <option value="10-inch-1">10&quot; 1 Layer - $55 (serves 10-14)</option>
                          <option value="10-inch-2">10&quot; 2 Layers - $110 (serves 16-20)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="shape" className="block text-sm font-medium text-[#541409] mb-2">Shape <span className="text-red-500">*</span></label>
                        <select id="shape" required={includesCookieCake} className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.shape ? 'text-[#541409]' : 'text-[#541409]/50'}`} value={formData.shape} onChange={(e) => setFormData({ ...formData, shape: e.target.value as CookieCakeShape })}>
                          <option value="">Select an option</option>
                          {currentShapes.map((shape) => (
                            <option key={shape} value={shape}>{shape === 'heart' ? 'Heart' : 'Round'}</option>
                          ))}
                        </select>
                      </div>
                      {cookieCakeSelection && (
                        <div>
                          <label className="block text-sm font-medium text-[#541409] mb-2">Selected Size</label>
                          <p className="w-full px-4 py-3 border border-stone-200 rounded-sm text-[#541409] bg-stone-50">
                            Serves {cookieCakeSelection.servings} • Base price ${cookieCakeSelection.price}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-serif text-[#541409] mb-4">Design</h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="baseColor" className="block text-sm font-medium text-[#541409] mb-2">Base Color <span className="text-red-500">*</span></label>
                        <input id="baseColor" type="text" required={includesCookieCake} className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]" value={formData.baseColor} onChange={(e) => setFormData({ ...formData, baseColor: e.target.value })} />
                      </div>
                      <div>
                        <label htmlFor="pipingColors" className="block text-sm font-medium text-[#541409] mb-2">Piping Color(s) <span className="text-red-500">*</span></label>
                        <input id="pipingColors" type="text" required={includesCookieCake} className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]" value={formData.pipingColors} onChange={(e) => setFormData({ ...formData, pipingColors: e.target.value })} />
                      </div>
                      <div>
                        <label htmlFor="customMessaging" className="block text-sm font-medium text-[#541409] mb-2">Custom Messaging <span className="text-red-500">*</span></label>
                        <input id="customMessaging" type="text" required={includesCookieCake} placeholder="If no message, type N/A" className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]" value={formData.customMessaging} onChange={(e) => setFormData({ ...formData, customMessaging: e.target.value })} />
                      </div>
                      <div>
                        <label htmlFor="messageStyle" className="block text-sm font-medium text-[#541409] mb-2">Message Style <span className="text-red-500">*</span></label>
                        <select id="messageStyle" required={includesCookieCake} className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.messageStyle ? 'text-[#541409]' : 'text-[#541409]/50'}`} value={formData.messageStyle} onChange={(e) => setFormData({ ...formData, messageStyle: e.target.value })}>
                          <option value="">Select an option</option>
                          {messageStyleOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#541409] mb-2">Add-Ons</label>
                        <div className="space-y-2">
                          {cookieCakeAddOns.map((topping) => (
                            <label key={topping.value} className="flex items-center cursor-pointer">
                              <input type="checkbox" checked={formData.toppings.includes(topping.value)} onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, toppings: [...formData.toppings, topping.value] });
                                } else {
                                  setFormData({ ...formData, toppings: formData.toppings.filter((item) => item !== topping.value) });
                                }
                              }} className="w-5 h-5 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]" />
                              <span className="ml-3 text-sm text-stone-700">{topping.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="cookieCakeDesignDetails" className="block text-sm font-medium text-[#541409] mb-2">Design Details</label>
                        <textarea id="cookieCakeDesignDetails" rows={3} placeholder="Be as specific as you'd like about theme, details, inspo, or must-have elements." className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409]" value={formData.designDetails} onChange={(e) => setFormData({ ...formData, designDetails: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Inspiration Images</h2>
                <p className="text-xs text-stone-500 mb-2">Upload up to 10 images. These will be saved with your inquiry.</p>
                <input type="file" accept="image/*" multiple onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const totalFiles = formData.inspirationFiles.length + files.length;
                  if (totalFiles > 10) {
                    alert('You can upload a maximum of 10 images');
                    return;
                  }
                  setFormData({ ...formData, inspirationFiles: [...formData.inspirationFiles, ...files] });
                  e.target.value = '';
                }} className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-[#541409] file:text-[#EAD6D6] file:cursor-pointer" disabled={formData.inspirationFiles.length >= 10} />
                {formData.inspirationFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {formData.inspirationFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} alt={`Inspiration ${index + 1}`} className="w-full h-20 object-cover rounded-sm" />
                        <button type="button" onClick={() => setFormData({ ...formData, inspirationFiles: formData.inspirationFiles.filter((_, i) => i !== index) })} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-stone-500 mt-2">{formData.inspirationFiles.length}/10 images uploaded</p>
              </div>

              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Additional Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-[#541409] mb-2">Allergies to Note</label>
                    <input id="allergies" type="text" placeholder="Any allergies I should know about?" className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]" value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[#541409] mb-2">Additional Info</label>
                    <textarea id="message" rows={3} placeholder="Anything else I should know?" className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409]" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="howDidYouHear" className="block text-sm font-medium text-[#541409] mb-2">How did you hear about me? :)</label>
                    <input id="howDidYouHear" type="text" placeholder="Instagram, friend, Google, etc." className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409]" value={formData.howDidYouHear} onChange={(e) => setFormData({ ...formData, howDidYouHear: e.target.value })} />
                  </div>
                </div>
              </div>

              {(includesCookieCups && formData.quantity) || (includesCookieCake && cookieCakeSelection) ? (
                <div className="bg-[#EAD6D6]/30 rounded-lg p-4">
                  <h2 className="text-xl font-serif text-[#541409] mb-3">Order Summary</h2>
                  <div className="space-y-3 text-sm text-[#541409]">
                    {includesCookieCups && formData.quantity && (
                      <div className="space-y-1">
                        <div className="flex justify-between font-medium"><span>{formData.quantity} Cookie Cups</span><span>{formatPrice(cookieCupsBasePrice)}</span></div>
                        {formData.chocolateMolds && <div className="flex justify-between"><span>Chocolate Molds</span><span>+${cookieCupsMoldPrice / 100}</span></div>}
                        {formData.edibleGlitter && <div className="flex justify-between"><span>Edible Glitter</span><span>+${cookieCupsGlitterPrice / 100}</span></div>}
                      </div>
                    )}
                    {includesCookieCake && cookieCakeSelection && (
                      <div className="space-y-1">
                        <div className="flex justify-between font-medium"><span>{formData.size} {formData.shape ? formData.shape.charAt(0).toUpperCase() + formData.shape.slice(1) : ''} • {formData.layers} layer</span><span>{formatPrice(cookieCakeSelection.price * 100)}</span></div>
                        <div className="flex justify-between"><span>Servings</span><span>{cookieCakeSelection.servings}</span></div>
                        {formData.toppings.map((topping) => {
                          const addOn = cookieCakeAddOns.find((item) => item.value === topping);
                          if (!addOn) return null;
                          return <div key={topping} className="flex justify-between"><span>{addOn.label.replace(/ \(\+\$\d+\)| \(starting at \+\$\d+\)/, '')}</span><span>+${addOn.price / 100}</span></div>;
                        })}
                      </div>
                    )}
                    <div className="pt-2 mt-2 border-t border-[#EAD6D6] font-medium flex justify-between">
                      <span>Total</span>
                      <span>{formatPrice((includesCookieCups ? cookieCupsTotal : 0) + (includesCookieCake ? cookieCakeTotal : 0))}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Policies & Acknowledgements</h2>
                <div className="space-y-3">
                  <label className="flex items-start cursor-pointer p-4 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors">
                    <input type="checkbox" required checked={formData.acknowledgeDeposit} onChange={(e) => setFormData({ ...formData, acknowledgeDeposit: e.target.checked })} className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]" />
                    <span className="ml-3 text-sm text-stone-600">I understand that a <strong>50% non-refundable deposit</strong> is required to secure my order date. <span className="text-red-500">*</span></span>
                  </label>
                  <label className="flex items-start cursor-pointer p-4 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors">
                    <input type="checkbox" required checked={formData.acknowledgeAllergens} onChange={(e) => setFormData({ ...formData, acknowledgeAllergens: e.target.checked })} className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]" />
                    <span className="ml-3 text-sm text-stone-600">I understand that all products are made in a kitchen that contains <strong>dairy, eggs, tree nuts, peanuts, and soy</strong>. <span className="text-red-500">*</span></span>
                  </label>
                  <label className="flex items-start cursor-pointer p-4 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors">
                    <input type="checkbox" required checked={formData.acknowledgeLeadTime} onChange={(e) => setFormData({ ...formData, acknowledgeLeadTime: e.target.checked })} className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]" />
                    <span className="ml-3 text-sm text-stone-600">I understand that cookie cups & cake orders require at least <strong>4 days notice</strong>. <span className="text-red-500">*</span></span>
                  </label>
                </div>
              </div>

              {submitError && <div className="p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">{submitError}</div>}

              <button type="submit" disabled={submitting} className="w-full px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Submitting...' : `Submit ${includesCookieCups && includesCookieCake ? 'Cookie Cups + Cake' : includesCookieCake ? 'Cookie Cake' : 'Cookie Cup'} Inquiry`}
              </button>

              <p className="text-sm text-stone-500 text-center">I&apos;ll respond within 24-48 hours with availability and next steps.</p>
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

export default function CookieCupsAndCakesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#541409]"></div>
      </div>
    }>
      <CookieCupsAndCakesContent />
    </Suspense>
  );
}
