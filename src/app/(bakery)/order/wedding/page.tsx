'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TimeSlotPicker, CouponInput } from '@/components/forms';

export default function WeddingInquiryPage() {
  const [formData, setFormData] = useState({
    name: '',
    partnerName: '',
    email: '',
    phone: '',
    weddingDate: '',
    pickupOrDelivery: 'pickup',
    pickupSlot: null as { date: string; time: string } | null,
    deliveryTime: '',
    setupRequirements: '',
    venueName: '',
    venueAddress: '',
    startTime: '',
    onsiteContact: '',
    serviceCuttingCake: false,
    serviceCookies: false,
    serviceCookieCups: false,
    cakeShape: '',
    cakeSize: '',
    cakeFlavor: '',
    cakeFilling: '',
    baseColor: '',
    pipingColors: '',
    customMessaging: '',
    messageStyle: '',
    cakeToppings: [] as string[],
    inspirationFiles: [] as File[],
    cakeDesignNotes: '',
    cookieQuantity: '',
    cookieFlavors: {
      chocolateChip: 0,
      vanillaBeanSugar: 0,
      cherryAlmond: 0,
      espressoButterscotch: 0,
      lemonSugar: 0,
    },
    cookiePackaging: '',
    cookieCupsQuantity: '',
    cookieCupsChocolateMolds: false,
    cookieCupsEdibleGlitter: false,
    cookieCupsInspirationFiles: [] as File[],
    cookieCupsNotes: '',
    serviceTieredCake: false,
    tieredCakeTiers: '',
    tieredCakeSize: '',
    tieredCakeShape: '',
    tieredCakeFlavors: { tier1: '', tier2: '', tier3: '' },
    tieredCakeFillings: { tier1: '', tier2: '', tier3: '' },
    tieredCakeBaseColor: '',
    tieredCakePipingColors: '',
    tieredCakeMessaging: '',
    tieredCakeMessageStyle: '',
    tieredCakeToppings: [] as string[],
    tieredCakeInspirationFiles: [] as File[],
    tieredCakeDesignNotes: '',
    dietaryRestrictions: '',
    howDidYouHear: '',
    acknowledgeLeadTime: false,
    acknowledgeDeposit: false,
    acknowledgeAllergy: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    description: string | null;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
  } | null>(null);

  const showCakeFields = formData.serviceCuttingCake;
  const showCookieFields = formData.serviceCookies;
  const showCookieCupsFields = formData.serviceCookieCups;
  const showTieredCakeFields = formData.serviceTieredCake;
  const anyServiceSelected = formData.serviceCuttingCake || formData.serviceCookies || formData.serviceCookieCups || formData.serviceTieredCake;

  // Cookie calculations (values in dozens)
  const totalDozens = Object.values(formData.cookieFlavors).reduce((a, b) => a + b, 0);
  const maxDozens = formData.cookieQuantity ? parseInt(formData.cookieQuantity) : 0;
  const remainingDozens = maxDozens - totalDozens;
  const hasCookieDiscount = formData.cookieQuantity && parseInt(formData.cookieQuantity) >= 10;
  const hasCookieCupsDiscount = formData.cookieCupsQuantity && parseInt(formData.cookieCupsQuantity) >= 10;

  // Tiered cake tier labels (bottom to top)
  const tieredCakeSizeParts = formData.tieredCakeSize ? formData.tieredCakeSize.split('+') : [];
  const tieredCakeTierLabels = [...tieredCakeSizeParts].reverse().map((size, i, arr) => {
    if (arr.length === 2) return i === 0 ? `Bottom Tier (${size}")` : `Top Tier (${size}")`;
    if (i === 0) return `Bottom Tier (${size}")`;
    if (i === arr.length - 1) return `Top Tier (${size}")`;
    return `Middle Tier (${size}")`;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate at least one service selected
    if (!anyServiceSelected) {
      setSubmitError('Please select at least one service.');
      return;
    }

    // Validate inspiration images if cake is selected
    if (showCakeFields && formData.inspirationFiles.length === 0) {
      setSubmitError('Please upload at least one inspiration image for your cake.');
      return;
    }

    // Validate tiered cake fields
    if (showTieredCakeFields) {
      if (!formData.tieredCakeTiers) {
        setSubmitError('Please select the number of tiers for your tiered cake.');
        return;
      }
      if (!formData.tieredCakeSize) {
        setSubmitError('Please select a size combination for your tiered cake.');
        return;
      }
      if (!formData.tieredCakeShape) {
        setSubmitError('Please select a shape for your tiered cake.');
        return;
      }
      const numTiers = parseInt(formData.tieredCakeTiers);
      for (let i = 1; i <= numTiers; i++) {
        if (!formData.tieredCakeFlavors[`tier${i}` as keyof typeof formData.tieredCakeFlavors]) {
          setSubmitError(`Please select a flavor for tier ${i} of your tiered cake.`);
          return;
        }
      }
      if (formData.tieredCakeInspirationFiles.length === 0) {
        setSubmitError('Please upload at least one inspiration image for your tiered cake.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('partner_name', formData.partnerName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('wedding_date', formData.weddingDate);
      submitData.append('pickup_or_delivery', formData.pickupOrDelivery);
      submitData.append('pickup_date', formData.pickupSlot?.date || '');
      submitData.append('pickup_time', formData.pickupSlot?.time || '');
      submitData.append('delivery_time', formData.deliveryTime);
      submitData.append('setup_requirements', formData.setupRequirements);
      submitData.append('venue_name', formData.venueName);
      submitData.append('venue_address', formData.venueAddress);
      submitData.append('start_time', formData.startTime);
      submitData.append('onsite_contact', formData.onsiteContact);
      const services = [];
      if (formData.serviceCuttingCake) services.push('cutting_cake');
      if (formData.serviceCookies) services.push('cookies');
      if (formData.serviceCookieCups) services.push('cookie_cups');
      if (formData.serviceTieredCake) services.push('tiered_cake');
      submitData.append('services_needed', services.join(','));
      submitData.append('cake_shape', formData.cakeShape);
      submitData.append('cake_size', formData.cakeSize);
      submitData.append('cake_flavor', formData.cakeFlavor);
      submitData.append('cake_filling', formData.cakeFilling);
      submitData.append('base_color', formData.baseColor);
      submitData.append('piping_colors', formData.pipingColors);
      submitData.append('custom_messaging', formData.customMessaging);
      submitData.append('message_style', formData.messageStyle);
      submitData.append('cake_toppings', JSON.stringify(formData.cakeToppings));
      submitData.append('cake_design_notes', formData.cakeDesignNotes);
      submitData.append('cookie_quantity', formData.cookieQuantity);
      submitData.append('cookie_flavors', JSON.stringify(formData.cookieFlavors));
      submitData.append('cookie_packaging', formData.cookiePackaging);
      submitData.append('cookie_cups_quantity', formData.cookieCupsQuantity);
      submitData.append('cookie_cups_chocolate_molds', String(formData.cookieCupsChocolateMolds));
      submitData.append('cookie_cups_edible_glitter', String(formData.cookieCupsEdibleGlitter));
      submitData.append('cookie_cups_notes', formData.cookieCupsNotes);
      formData.cookieCupsInspirationFiles.forEach((file) => {
        submitData.append('cookie_cups_inspiration_images', file);
      });
      submitData.append('tiered_cake_tiers', formData.tieredCakeTiers);
      submitData.append('tiered_cake_size', formData.tieredCakeSize);
      submitData.append('tiered_cake_shape', formData.tieredCakeShape);
      submitData.append('tiered_cake_flavor_tier1', formData.tieredCakeFlavors.tier1);
      submitData.append('tiered_cake_flavor_tier2', formData.tieredCakeFlavors.tier2);
      submitData.append('tiered_cake_flavor_tier3', formData.tieredCakeFlavors.tier3);
      submitData.append('tiered_cake_filling_tier1', formData.tieredCakeFillings.tier1);
      submitData.append('tiered_cake_filling_tier2', formData.tieredCakeFillings.tier2);
      submitData.append('tiered_cake_filling_tier3', formData.tieredCakeFillings.tier3);
      submitData.append('tiered_cake_base_color', formData.tieredCakeBaseColor);
      submitData.append('tiered_cake_piping_colors', formData.tieredCakePipingColors);
      submitData.append('tiered_cake_messaging', formData.tieredCakeMessaging);
      submitData.append('tiered_cake_message_style', formData.tieredCakeMessageStyle);
      submitData.append('tiered_cake_toppings', JSON.stringify(formData.tieredCakeToppings));
      submitData.append('tiered_cake_design_notes', formData.tieredCakeDesignNotes);
      formData.tieredCakeInspirationFiles.forEach((file) => {
        submitData.append('tiered_cake_inspiration_images', file);
      });
      submitData.append('dietary_restrictions', formData.dietaryRestrictions);
      submitData.append('how_found_us', formData.howDidYouHear);
      submitData.append('acknowledge_lead_time', String(formData.acknowledgeLeadTime));
      submitData.append('acknowledge_deposit', String(formData.acknowledgeDeposit));
      submitData.append('acknowledge_allergy', String(formData.acknowledgeAllergy));
      if (appliedCoupon) {
        submitData.append('coupon_code', appliedCoupon.code);
      }

      // Append inspiration images
      formData.inspirationFiles.forEach((file) => {
        submitData.append('inspiration_images', file);
      });

      const response = await fetch('/api/orders/wedding', {
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
          <h1 className="text-4xl sm:text-5xl font-serif text-[#4A2C21] font-bold">
            <em>Wedding</em> Inquiry Form
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            Let's create something beautiful for your special day
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Info */}
          <div className="bg-[#EAD6D6] rounded-lg p-6 mb-8">
            <p className="text-stone-700 text-sm">
              Wedding orders require at least <strong>1 month notice</strong>. I recommend reaching out 2-3 months in advance for popular dates.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Your Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#541409] mb-2">
                      Couple's Names <span className="text-red-500">*</span>
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
                    <label htmlFor="partnerName" className="block text-sm font-medium text-[#541409] mb-2">
                      Primary Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="partnerName"
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.partnerName}
                      onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#541409] mb-2">
                      Contact Email <span className="text-red-500">*</span>
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
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-[#541409] mb-2">
                      Contact Phone <span className="text-red-500">*</span>
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

              {/* Wedding Details */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Wedding Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="weddingDate" className="block text-sm font-medium text-[#541409] mb-2">
                        Wedding Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="weddingDate"
                        required
                        className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent ${formData.weddingDate ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                        value={formData.weddingDate}
                        onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                      />
                    </div>
                                      </div>

                  <div>
                    <label htmlFor="venueName" className="block text-sm font-medium text-[#541409] mb-2">
                      Venue Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="venueName"
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.venueName}
                      onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="venueAddress" className="block text-sm font-medium text-[#541409] mb-2">
                      Venue Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="venueAddress"
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.venueAddress}
                      onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-[#541409] mb-2">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      required
                      className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent ${formData.startTime ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="onsiteContact" className="block text-sm font-medium text-[#541409] mb-2">
                      On-Site Contact Name & Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="onsiteContact"
                      required
                      placeholder="Planner/coordinator for day of"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.onsiteContact}
                      onChange={(e) => setFormData({ ...formData, onsiteContact: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Pickup or Delivery */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Pickup or Delivery</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="pickupOrDelivery" className="block text-sm font-medium text-[#541409] mb-2">
                      Pickup or Delivery <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="pickupOrDelivery"
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white text-[#541409]"
                      value={formData.pickupOrDelivery}
                      onChange={(e) => setFormData({ ...formData, pickupOrDelivery: e.target.value, pickupSlot: null, deliveryTime: '' })}
                    >
                      <option value="pickup" style={{ color: formData.pickupOrDelivery === 'pickup' ? '#541409' : 'rgba(84, 20, 9, 0.5)' }}>Pickup</option>
                      <option value="delivery" style={{ color: formData.pickupOrDelivery === 'delivery' ? '#541409' : 'rgba(84, 20, 9, 0.5)' }}>Delivery (fee starting at $75, depending on location)</option>
                    </select>
                  </div>

                  {formData.pickupOrDelivery === 'pickup' && (
                    <div>
                      <TimeSlotPicker
                        orderType="wedding"
                        value={formData.pickupSlot ?? undefined}
                        onChange={(slot) => setFormData({ ...formData, pickupSlot: slot })}
                        label="Preferred Pickup Date & Time"
                      />
                      <p className="text-xs text-stone-500 mt-1">
                        This is your preferred pickup time. I'll confirm final timing when I reach out!
                      </p>
                    </div>
                  )}

                  {formData.pickupOrDelivery === 'delivery' && (
                    <>
                      <div>
                        <label htmlFor="deliveryTime" className="block text-sm font-medium text-[#541409] mb-2">
                          Preferred Delivery Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          id="deliveryTime"
                          required
                          className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent ${formData.deliveryTime ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                          value={formData.deliveryTime}
                          onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                        />
                        <p className="text-xs text-stone-500 mt-1">
                          I will deliver to your venue address. I'll confirm final timing when I reach out!
                        </p>
                      </div>

                      <div>
                        <label htmlFor="setupRequirements" className="block text-sm font-medium text-[#541409] mb-2">
                          Any setup requirements or guidelines?
                        </label>
                        <textarea
                          id="setupRequirements"
                          rows={3}
                          placeholder="e.g., specific table location, coordinator instructions, venue access details, etc."
                          className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409] placeholder:text-[#541409]/50"
                          value={formData.setupRequirements}
                          onChange={(e) => setFormData({ ...formData, setupRequirements: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Services Needed */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Services Needed</h2>
                <div>
                  <label className="block text-sm font-medium text-[#541409] mb-2">
                    What services are you interested in? <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-stone-500 mb-3">Select all that apply</p>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.serviceCuttingCake}
                        onChange={(e) => setFormData({ ...formData, serviceCuttingCake: e.target.checked })}
                        className="w-5 h-5 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                      />
                      <span className="ml-3 text-sm text-stone-700">Cutting Cake</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.serviceCookies}
                        onChange={(e) => setFormData({ ...formData, serviceCookies: e.target.checked })}
                        className="w-5 h-5 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                      />
                      <span className="ml-3 text-sm text-stone-700">Cookies</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.serviceCookieCups}
                        onChange={(e) => setFormData({ ...formData, serviceCookieCups: e.target.checked })}
                        className="w-5 h-5 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                      />
                      <span className="ml-3 text-sm text-stone-700">Cookie Cups</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.serviceTieredCake}
                        onChange={(e) => setFormData({ ...formData, serviceTieredCake: e.target.checked })}
                        className="w-5 h-5 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                      />
                      <span className="ml-3 text-sm text-stone-700">Tiered Wedding Cake</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Cake Details - Conditional */}
              {showCakeFields && (
                <div>
                  <h2 className="text-xl font-serif text-[#541409] mb-4">Cutting Cake Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cakeSize" className="block text-sm font-medium text-[#541409] mb-2">
                        Cake Size <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="cakeSize"
                        required
                        className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.cakeSize ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                        value={formData.cakeSize}
                        onChange={(e) => {
                          const newSize = e.target.value;
                          // If switching to 10-inch and heart was selected, reset shape
                          if (newSize === '10-inch' && formData.cakeShape === 'heart') {
                            setFormData({ ...formData, cakeSize: newSize, cakeShape: '' });
                          } else {
                            setFormData({ ...formData, cakeSize: newSize });
                          }
                        }}
                      >
                        <option value="">Select an option</option>
                        <option value="6-inch">6" (serves 6-12) - Starting at $115</option>
                        <option value="8-inch">8" (serves 14-20) - Starting at $155</option>
                        <option value="10-inch">10" (serves 24-30) - Starting at $195</option>
                        <option value="unsure">Not sure - need guidance</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="cakeShape" className="block text-sm font-medium text-[#541409] mb-2">
                        Cake Shape <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="cakeShape"
                        required
                        className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.cakeShape ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                        value={formData.cakeShape}
                        onChange={(e) => setFormData({ ...formData, cakeShape: e.target.value })}
                      >
                        <option value="">Select an option</option>
                        <option value="round">Round</option>
                        {formData.cakeSize !== '10-inch' && <option value="heart">Heart</option>}
                      </select>
                    </div>

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
                        <option value="">Select an option</option>
                        <option value="vanilla-bean">Vanilla Bean</option>
                        <option value="chocolate">Chocolate</option>
                        <option value="confetti">Confetti</option>
                        <option value="red-velvet">Red Velvet</option>
                        <option value="lemon">Lemon</option>
                        <option value="vanilla-latte">Vanilla Latte (+$5)</option>
                        <option value="marble">Marble (vanilla & chocolate)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="cakeFilling" className="block text-sm font-medium text-[#541409] mb-2">
                        Filling
                      </label>
                      <select
                        id="cakeFilling"
                        className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.cakeFilling ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                        value={formData.cakeFilling}
                        onChange={(e) => setFormData({ ...formData, cakeFilling: e.target.value })}
                      >
                        <option value="">Select an option (or leave blank)</option>
                        <option value="chocolate-ganache">Chocolate Ganache (+$10)</option>
                        <option value="cookies-and-cream">Cookies & Cream (+$5)</option>
                        <option value="vanilla-bean-ganache">Vanilla Bean Ganache (+$10)</option>
                        <option value="fresh-strawberries">Fresh Strawberries (+$8)</option>
                        <option value="lemon-ganache">Lemon Ganache (+$10)</option>
                        <option value="raspberry">Raspberry (+$8)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="baseColor" className="block text-sm font-medium text-[#541409] mb-2">
                        Base Color <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="baseColor"
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                        value={formData.baseColor}
                        onChange={(e) => setFormData({ ...formData, baseColor: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="pipingColors" className="block text-sm font-medium text-[#541409] mb-2">
                        Piping Color(s) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="pipingColors"
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                        value={formData.pipingColors}
                        onChange={(e) => setFormData({ ...formData, pipingColors: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="customMessaging" className="block text-sm font-medium text-[#541409] mb-2">
                        What would you like your custom messaging to say? <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="customMessaging"
                        required
                        placeholder="If no messaging, type N/A"
                        className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                        value={formData.customMessaging}
                        onChange={(e) => setFormData({ ...formData, customMessaging: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="messageStyle" className="block text-sm font-medium text-[#541409] mb-2">
                        How would you like your message to be written? <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="messageStyle"
                        required
                        className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.messageStyle ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                        value={formData.messageStyle}
                        onChange={(e) => setFormData({ ...formData, messageStyle: e.target.value })}
                      >
                        <option value="">Select an option</option>
                        <option value="piped">Piped</option>
                        <option value="piped-cursive">Piped Cursive</option>
                        <option value="block">Block</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#541409] mb-2">
                        Toppings
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'light-beading', label: 'Light Beading (+$8)' },
                          { value: 'moderate-beading', label: 'Moderate Beading (+$15)' },
                          { value: 'heavy-beading', label: 'Heavy Beading (+$20)' },
                          { value: 'ribbon-bows', label: 'Ribbon Bows (+$8)' },
                          { value: 'fruit', label: 'Fruit (starting at +$8)' },
                          { value: 'fresh-florals', label: 'Fresh Florals (starting at +$15)' },
                          { value: 'faux-florals', label: 'Faux Florals (starting at +$15)' },
                          { value: 'edible-image', label: 'Edible Image (starting at +$10)' },
                          { value: 'other', label: 'Other (starting at +$8)' },
                        ].map((topping) => (
                          <label key={topping.value} className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.cakeToppings.includes(topping.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, cakeToppings: [...formData.cakeToppings, topping.value] });
                                } else {
                                  setFormData({ ...formData, cakeToppings: formData.cakeToppings.filter(t => t !== topping.value) });
                                }
                              }}
                              className="w-5 h-5 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                            />
                            <span className="ml-3 text-sm text-stone-700">{topping.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#541409] mb-2">
                        Inspiration Images <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-stone-500 mb-2">Upload up to 10 images for inspiration</p>
                      <input
                        type="file"
                        id="inspirationFiles"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const totalFiles = formData.inspirationFiles.length + files.length;
                          if (totalFiles > 10) {
                            alert('You can upload a maximum of 10 images');
                            return;
                          }
                          setFormData({ ...formData, inspirationFiles: [...formData.inspirationFiles, ...files] });
                          e.target.value = '';
                        }}
                        className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-[#541409] file:text-[#EAD6D6] file:cursor-pointer"
                        disabled={formData.inspirationFiles.length >= 10}
                      />
                      {formData.inspirationFiles.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {formData.inspirationFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Inspiration ${index + 1}`}
                                className="w-full h-20 object-cover rounded-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    inspirationFiles: formData.inspirationFiles.filter((_, i) => i !== index)
                                  });
                                }}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="cakeDesignNotes" className="block text-sm font-medium text-[#541409] mb-2">
                        Special Requests & Anything Else I Need to Know
                      </label>
                      <textarea
                        id="cakeDesignNotes"
                        rows={3}
                        placeholder="Be specific! Color scheme, theme, inspo, certain details, etc."
                        className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409] placeholder:text-[#541409]/50"
                        value={formData.cakeDesignNotes}
                        onChange={(e) => setFormData({ ...formData, cakeDesignNotes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cookies - Conditional */}
              {showCookieFields && (
                <div>
                  <h2 className="text-xl font-serif text-[#541409] mb-4">Cookie Details</h2>
                  <p className="text-sm text-stone-600 mb-4">
                    <strong>$36 per dozen.</strong> Orders of 10+ dozen get <strong>5% off</strong>!
                  </p>
                  <div className="space-y-4">
                    {/* How Many Dozen */}
                    <div>
                      <label htmlFor="cookieQuantity" className="block text-sm font-medium text-[#541409] mb-2">
                        How Many Dozen? <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="cookieQuantity"
                        required
                        className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.cookieQuantity ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                        value={formData.cookieQuantity}
                        onChange={(e) => {
                          const newQuantity = e.target.value;
                          const newMaxDozens = newQuantity ? parseInt(newQuantity) : 0;
                          if (totalDozens > newMaxDozens) {
                            setFormData({
                              ...formData,
                              cookieQuantity: newQuantity,
                              cookieFlavors: {
                                chocolateChip: 0,
                                vanillaBeanSugar: 0,
                                cherryAlmond: 0,
                                espressoButterscotch: 0,
                                lemonSugar: 0,
                              }
                            });
                          } else {
                            setFormData({ ...formData, cookieQuantity: newQuantity });
                          }
                        }}
                      >
                        <option value="">Select an option</option>
                        <option value="4">4 Dozen (48 cookies) - $144</option>
                        <option value="5">5 Dozen (60 cookies) - $180</option>
                        <option value="6">6 Dozen (72 cookies) - $216</option>
                        <option value="7">7 Dozen (84 cookies) - $252</option>
                        <option value="8">8 Dozen (96 cookies) - $288</option>
                        <option value="9">9 Dozen (108 cookies) - $324</option>
                        <option value="10">10 Dozen (120 cookies) - $342 (5% off!)</option>
                        <option value="11">11 Dozen (132 cookies) - $376.20 (5% off!)</option>
                        <option value="12">12 Dozen (144 cookies) - $410.40 (5% off!)</option>
                        <option value="15">15 Dozen (180 cookies) - $513 (5% off!)</option>
                        <option value="20">20 Dozen (240 cookies) - $684 (5% off!)</option>
                      </select>
                      {hasCookieDiscount && (
                        <p className="text-xs text-green-600 mt-1 font-medium">
                          5% discount applied for 10+ dozen!
                        </p>
                      )}
                      <p className="text-xs text-stone-500 mt-1">
                        Need more than 20 dozen? Just ask!
                      </p>
                    </div>

                    {/* Choose Your Flavors */}
                    <div>
                      <label className="block text-sm font-medium text-[#541409] mb-2">
                        Choose Your Flavors <span className="text-red-500">*</span>
                      </label>
                      <p className="text-sm text-stone-600 mb-4">
                        {formData.cookieQuantity
                          ? `Select how many dozen of each flavor (must total ${formData.cookieQuantity} dozen). Remaining: ${remainingDozens}`
                          : 'Please select how many dozen above first.'}
                      </p>
                      <div className="space-y-3">
                        {[
                          { key: 'chocolateChip', label: 'Chocolate Chip' },
                          { key: 'vanillaBeanSugar', label: 'Vanilla Bean Sugar' },
                          { key: 'cherryAlmond', label: 'Cherry Almond' },
                          { key: 'espressoButterscotch', label: 'Espresso Butterscotch' },
                          { key: 'lemonSugar', label: 'Lemon Sugar' },
                        ].map((flavor) => {
                          const currentValue = formData.cookieFlavors[flavor.key as keyof typeof formData.cookieFlavors];
                          const maxForFlavor = currentValue + remainingDozens;
                          return (
                            <div key={flavor.key} className="flex items-center justify-between">
                              <label className="text-stone-700">{flavor.label}</label>
                              <input
                                type="number"
                                min="0"
                                max={maxForFlavor}
                                step="1"
                                disabled={!formData.cookieQuantity}
                                className="w-20 px-3 py-2 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-center text-[#541409] disabled:bg-stone-100 disabled:cursor-not-allowed"
                                value={currentValue}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  const capped = Math.max(0, Math.min(maxForFlavor, value));
                                  setFormData({
                                    ...formData,
                                    cookieFlavors: {
                                      ...formData.cookieFlavors,
                                      [flavor.key]: capped
                                    }
                                  });
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 p-3 bg-[#EAD6D6] rounded text-center space-y-1">
                        <div className="font-medium text-[#541409]">
                          Total: {totalDozens} / {maxDozens || '—'} dozen
                        </div>
                        {formData.cookieQuantity && remainingDozens > 0 && (
                          <div className="text-sm text-[#541409]/70">
                            {remainingDozens} dozen remaining to select
                          </div>
                        )}
                        {formData.cookieQuantity && remainingDozens < 0 && (
                          <div className="text-sm text-red-600">
                            Over by {Math.abs(remainingDozens)} dozen
                          </div>
                        )}
                        {formData.cookieQuantity && totalDozens === maxDozens && (
                          <div className="text-sm text-green-600">
                            Perfect!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Packaging */}
                    <div>
                      <label htmlFor="cookiePackaging" className="block text-sm font-medium text-[#541409] mb-2">
                        Packaging Preference <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="cookiePackaging"
                        required
                        className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.cookiePackaging ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                        value={formData.cookiePackaging}
                        onChange={(e) => setFormData({ ...formData, cookiePackaging: e.target.value })}
                      >
                        <option value="">Select an option</option>
                        <option value="standard">Standard</option>
                        <option value="heat-sealed">Individually Heat Sealed (+$5/dozen)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Cookie Cups Details - Conditional */}
              {showCookieCupsFields && (
                <div>
                  <h2 className="text-xl font-serif text-[#541409] mb-4">Cookie Cups Details</h2>
                  <p className="text-sm text-stone-600 mb-4">
                    Mini chocolate chip cookie cups with vanilla buttercream. Includes piped designs and sprinkles.
                    <br /><strong>$30 per dozen.</strong> Orders of 10+ dozen get <strong>5% off</strong>!
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cookieCupsQuantity" className="block text-sm font-medium text-[#541409] mb-2">
                        How Many Dozen? <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="cookieCupsQuantity"
                        required={showCookieCupsFields}
                        className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.cookieCupsQuantity ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                        value={formData.cookieCupsQuantity}
                        onChange={(e) => setFormData({ ...formData, cookieCupsQuantity: e.target.value })}
                      >
                        <option value="">Select quantity</option>
                        <option value="4">4 Dozen (48) - $120</option>
                        <option value="5">5 Dozen (60) - $150</option>
                        <option value="6">6 Dozen (72) - $180</option>
                        <option value="7">7 Dozen (84) - $210</option>
                        <option value="8">8 Dozen (96) - $240</option>
                        <option value="9">9 Dozen (108) - $270</option>
                        <option value="10">10 Dozen (120) - $285 (5% off!)</option>
                        <option value="11">11 Dozen (132) - $313.50 (5% off!)</option>
                        <option value="12">12 Dozen (144) - $342 (5% off!)</option>
                        <option value="13">13 Dozen (156) - $370.50 (5% off!)</option>
                        <option value="14">14 Dozen (168) - $399 (5% off!)</option>
                        <option value="15">15 Dozen (180) - $427.50 (5% off!)</option>
                        <option value="16">16 Dozen (192) - $456 (5% off!)</option>
                        <option value="17">17 Dozen (204) - $484.50 (5% off!)</option>
                        <option value="18">18 Dozen (216) - $513 (5% off!)</option>
                        <option value="19">19 Dozen (228) - $541.50 (5% off!)</option>
                        <option value="20">20 Dozen (240) - $570 (5% off!)</option>
                      </select>
                      {hasCookieCupsDiscount && (
                        <p className="text-xs text-green-600 mt-1 font-medium">
                          5% discount applied for 10+ dozen!
                        </p>
                      )}
                      <p className="text-xs text-stone-500 mt-1">
                        Need more than 20 dozen? Just ask!
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.cookieCupsChocolateMolds}
                          onChange={(e) => setFormData({ ...formData, cookieCupsChocolateMolds: e.target.checked })}
                          className="w-5 h-5 rounded border-stone-300 text-[#541409] focus:ring-[#541409]"
                        />
                        <span className="text-sm text-[#541409]">
                          Add chocolate molds (+$4 per dozen)
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.cookieCupsEdibleGlitter}
                          onChange={(e) => setFormData({ ...formData, cookieCupsEdibleGlitter: e.target.checked })}
                          className="w-5 h-5 rounded border-stone-300 text-[#541409] focus:ring-[#541409]"
                        />
                        <span className="text-sm text-[#541409]">
                          Add edible glitter (+$4 per dozen)
                        </span>
                      </label>
                    </div>

                    {/* Inspiration Images */}
                    <div>
                      <label className="block text-sm font-medium text-[#541409] mb-2">
                        Inspiration Images
                      </label>
                      <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center hover:border-[#541409]/50 transition-colors">
                        <input
                          type="file"
                          id="cookieCupsInspirationFiles"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setFormData({ ...formData, cookieCupsInspirationFiles: [...formData.cookieCupsInspirationFiles, ...files].slice(0, 5) });
                          }}
                        />
                        <label htmlFor="cookieCupsInspirationFiles" className="cursor-pointer">
                          <svg className="w-8 h-8 mx-auto text-stone-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-stone-600">Click to upload inspiration images</p>
                          <p className="text-xs text-stone-500 mt-1">Up to 5 images</p>
                        </label>
                      </div>
                      {formData.cookieCupsInspirationFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {formData.cookieCupsInspirationFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-stone-50 px-3 py-2 rounded">
                              <span className="text-sm text-stone-600 truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = formData.cookieCupsInspirationFiles.filter((_, i) => i !== index);
                                  setFormData({ ...formData, cookieCupsInspirationFiles: newFiles });
                                }}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="cookieCupsNotes" className="block text-sm font-medium text-[#541409] mb-2">
                        Cookie Cups Notes
                      </label>
                      <textarea
                        id="cookieCupsNotes"
                        rows={2}
                        placeholder="Any specific requests for cookie cups (colors, sprinkle preferences, etc.)"
                        className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                        value={formData.cookieCupsNotes}
                        onChange={(e) => setFormData({ ...formData, cookieCupsNotes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tiered Wedding Cake Details - Conditional */}
              {showTieredCakeFields && (
                <div>
                  <h2 className="text-xl font-serif text-[#541409] mb-4">Tiered Wedding Cake Details</h2>

                  {/* Pricing blurb */}
                  <div className="bg-[#EAD6D6] rounded-lg p-4 mb-4">
                    <p className="text-sm text-stone-700">
                      Tiered wedding cakes are priced based on the combined size of each tier. Pricing includes structural support, doweling, and assembly.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Number of tiers */}
                    <div>
                      <label className="block text-sm font-medium text-[#541409] mb-2">
                        Number of Tiers <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="tieredCakeTiers"
                            value="2"
                            checked={formData.tieredCakeTiers === '2'}
                            onChange={() => setFormData({ ...formData, tieredCakeTiers: '2', tieredCakeSize: '', tieredCakeShape: '', tieredCakeFlavors: { tier1: '', tier2: '', tier3: '' }, tieredCakeFillings: { tier1: '', tier2: '', tier3: '' } })}
                            className="w-5 h-5 accent-[#541409] focus:ring-[#541409]"
                          />
                          <span className="ml-2 text-sm text-stone-700">2-Tier</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="tieredCakeTiers"
                            value="3"
                            checked={formData.tieredCakeTiers === '3'}
                            onChange={() => setFormData({ ...formData, tieredCakeTiers: '3', tieredCakeSize: '', tieredCakeShape: '', tieredCakeFlavors: { tier1: '', tier2: '', tier3: '' }, tieredCakeFillings: { tier1: '', tier2: '', tier3: '' } })}
                            className="w-5 h-5 accent-[#541409] focus:ring-[#541409]"
                          />
                          <span className="ml-2 text-sm text-stone-700">3-Tier</span>
                        </label>
                      </div>
                    </div>

                    {/* Size combo */}
                    {formData.tieredCakeTiers && (
                      <div>
                        <label htmlFor="tieredCakeSize" className="block text-sm font-medium text-[#541409] mb-2">
                          Size Combination <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="tieredCakeSize"
                          required
                          className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.tieredCakeSize ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                          value={formData.tieredCakeSize}
                          onChange={(e) => {
                            const newSize = e.target.value;
                            if (newSize.includes('10') && formData.tieredCakeShape === 'heart') {
                              setFormData({ ...formData, tieredCakeSize: newSize, tieredCakeShape: '', tieredCakeFlavors: { tier1: '', tier2: '', tier3: '' }, tieredCakeFillings: { tier1: '', tier2: '', tier3: '' } });
                            } else {
                              setFormData({ ...formData, tieredCakeSize: newSize, tieredCakeFlavors: { tier1: '', tier2: '', tier3: '' }, tieredCakeFillings: { tier1: '', tier2: '', tier3: '' } });
                            }
                          }}
                        >
                          <option value="">Select a size</option>
                          {formData.tieredCakeTiers === '2' && (
                            <>
                              <option value="4+6">4&quot; + 6&quot; - Starting at $205</option>
                              <option value="6+8">6&quot; + 8&quot; - Starting at $285</option>
                              <option value="8+10">8&quot; + 10&quot; - Starting at $365</option>
                            </>
                          )}
                          {formData.tieredCakeTiers === '3' && (
                            <>
                              <option value="4+6+8">4&quot; + 6&quot; + 8&quot; - Starting at $375</option>
                              <option value="6+8+10">6&quot; + 8&quot; + 10&quot; - Starting at $495</option>
                            </>
                          )}
                        </select>
                      </div>
                    )}

                    {/* Shape */}
                    {formData.tieredCakeSize && (
                      <div>
                        <label htmlFor="tieredCakeShape" className="block text-sm font-medium text-[#541409] mb-2">
                          Cake Shape <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="tieredCakeShape"
                          required
                          className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.tieredCakeShape ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                          value={formData.tieredCakeShape}
                          onChange={(e) => setFormData({ ...formData, tieredCakeShape: e.target.value })}
                        >
                          <option value="">Select an option</option>
                          <option value="round">Round</option>
                          {!formData.tieredCakeSize.includes('10') && <option value="heart">Heart</option>}
                        </select>
                      </div>
                    )}

                    {/* Per-tier flavor & filling */}
                    {formData.tieredCakeSize && tieredCakeTierLabels.map((label, index) => (
                      <div key={index} className="border border-stone-200 rounded-sm p-4">
                        <h3 className="text-sm font-medium text-[#541409] mb-3">{label}</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-[#541409] mb-1">
                              Flavor <span className="text-red-500">*</span>
                            </label>
                            <select
                              required
                              className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.tieredCakeFlavors[`tier${index + 1}` as keyof typeof formData.tieredCakeFlavors] ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                              value={formData.tieredCakeFlavors[`tier${index + 1}` as keyof typeof formData.tieredCakeFlavors]}
                              onChange={(e) => setFormData({ ...formData, tieredCakeFlavors: { ...formData.tieredCakeFlavors, [`tier${index + 1}`]: e.target.value } })}
                            >
                              <option value="">Select a flavor</option>
                              <option value="vanilla-bean">Vanilla Bean</option>
                              <option value="chocolate">Chocolate</option>
                              <option value="confetti">Confetti</option>
                              <option value="red-velvet">Red Velvet</option>
                              <option value="lemon">Lemon</option>
                              <option value="vanilla-latte">Vanilla Latte (+$5)</option>
                              <option value="marble">Marble (vanilla & chocolate)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#541409] mb-1">
                              Filling
                            </label>
                            <select
                              className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.tieredCakeFillings[`tier${index + 1}` as keyof typeof formData.tieredCakeFillings] ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                              value={formData.tieredCakeFillings[`tier${index + 1}` as keyof typeof formData.tieredCakeFillings]}
                              onChange={(e) => setFormData({ ...formData, tieredCakeFillings: { ...formData.tieredCakeFillings, [`tier${index + 1}`]: e.target.value } })}
                            >
                              <option value="">Select an option (or leave blank)</option>
                              <option value="chocolate-ganache">Chocolate Ganache (+$10)</option>
                              <option value="cookies-and-cream">Cookies & Cream (+$5)</option>
                              <option value="vanilla-bean-ganache">Vanilla Bean Ganache (+$10)</option>
                              <option value="fresh-strawberries">Fresh Strawberries (+$8)</option>
                              <option value="lemon-ganache">Lemon Ganache (+$10)</option>
                              <option value="raspberry">Raspberry (+$8)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Shared design options */}
                    {formData.tieredCakeSize && (
                      <>
                        <div>
                          <label htmlFor="tieredCakeBaseColor" className="block text-sm font-medium text-[#541409] mb-2">
                            Base Color <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="tieredCakeBaseColor"
                            required
                            className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                            value={formData.tieredCakeBaseColor}
                            onChange={(e) => setFormData({ ...formData, tieredCakeBaseColor: e.target.value })}
                          />
                        </div>

                        <div>
                          <label htmlFor="tieredCakePipingColors" className="block text-sm font-medium text-[#541409] mb-2">
                            Piping Color(s) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="tieredCakePipingColors"
                            required
                            className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                            value={formData.tieredCakePipingColors}
                            onChange={(e) => setFormData({ ...formData, tieredCakePipingColors: e.target.value })}
                          />
                        </div>

                        <div>
                          <label htmlFor="tieredCakeMessaging" className="block text-sm font-medium text-[#541409] mb-2">
                            What would you like your custom messaging to say? <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="tieredCakeMessaging"
                            required
                            placeholder="If no messaging, type N/A"
                            className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                            value={formData.tieredCakeMessaging}
                            onChange={(e) => setFormData({ ...formData, tieredCakeMessaging: e.target.value })}
                          />
                        </div>

                        <div>
                          <label htmlFor="tieredCakeMessageStyle" className="block text-sm font-medium text-[#541409] mb-2">
                            How would you like your message to be written? <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="tieredCakeMessageStyle"
                            required
                            className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.tieredCakeMessageStyle ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                            value={formData.tieredCakeMessageStyle}
                            onChange={(e) => setFormData({ ...formData, tieredCakeMessageStyle: e.target.value })}
                          >
                            <option value="">Select an option</option>
                            <option value="piped">Piped</option>
                            <option value="piped-cursive">Piped Cursive</option>
                            <option value="block">Block</option>
                          </select>
                        </div>

                        {/* Toppings */}
                        <div>
                          <label className="block text-sm font-medium text-[#541409] mb-2">
                            Toppings
                          </label>
                          <div className="space-y-2">
                            {[
                              { value: 'light-beading', label: 'Light Beading (+$8)' },
                              { value: 'moderate-beading', label: 'Moderate Beading (+$15)' },
                              { value: 'heavy-beading', label: 'Heavy Beading (+$20)' },
                              { value: 'ribbon-bows', label: 'Ribbon Bows (+$8)' },
                              { value: 'fruit', label: 'Fruit (starting at +$8)' },
                              { value: 'fresh-florals', label: 'Fresh Florals (starting at +$15)' },
                              { value: 'faux-florals', label: 'Faux Florals (starting at +$15)' },
                              { value: 'edible-image', label: 'Edible Image (starting at +$10)' },
                              { value: 'other', label: 'Other (starting at +$8)' },
                            ].map((topping) => (
                              <label key={topping.value} className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.tieredCakeToppings.includes(topping.value)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({ ...formData, tieredCakeToppings: [...formData.tieredCakeToppings, topping.value] });
                                    } else {
                                      setFormData({ ...formData, tieredCakeToppings: formData.tieredCakeToppings.filter(t => t !== topping.value) });
                                    }
                                  }}
                                  className="w-5 h-5 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                                />
                                <span className="ml-3 text-sm text-stone-700">{topping.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Inspiration Images */}
                        <div>
                          <label className="block text-sm font-medium text-[#541409] mb-2">
                            Inspiration Images <span className="text-red-500">*</span>
                          </label>
                          <p className="text-xs text-stone-500 mb-2">Upload up to 10 images for inspiration</p>
                          <input
                            type="file"
                            id="tieredCakeInspirationFiles"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              const totalFiles = formData.tieredCakeInspirationFiles.length + files.length;
                              if (totalFiles > 10) {
                                alert('You can upload a maximum of 10 images');
                                return;
                              }
                              setFormData({ ...formData, tieredCakeInspirationFiles: [...formData.tieredCakeInspirationFiles, ...files] });
                              e.target.value = '';
                            }}
                            className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-[#541409] file:text-[#EAD6D6] file:cursor-pointer"
                            disabled={formData.tieredCakeInspirationFiles.length >= 10}
                          />
                          {formData.tieredCakeInspirationFiles.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                              {formData.tieredCakeInspirationFiles.map((file, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Inspiration ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        tieredCakeInspirationFiles: formData.tieredCakeInspirationFiles.filter((_, i) => i !== index)
                                      });
                                    }}
                                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Special Requests */}
                        <div>
                          <label htmlFor="tieredCakeDesignNotes" className="block text-sm font-medium text-[#541409] mb-2">
                            Special Requests & Anything Else I Need to Know
                          </label>
                          <textarea
                            id="tieredCakeDesignNotes"
                            rows={3}
                            placeholder="Be specific! Color scheme, theme, inspo, certain details, etc."
                            className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409] placeholder:text-[#541409]/50"
                            value={formData.tieredCakeDesignNotes}
                            onChange={(e) => setFormData({ ...formData, tieredCakeDesignNotes: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Additional Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-[#541409] mb-2">
                      Allergies to Note
                    </label>
                    <input
                      type="text"
                      id="dietaryRestrictions"
                      placeholder="Any allergies I should be aware of?"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.dietaryRestrictions}
                      onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
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
                </div>
              </div>

              {/* Coupon Code */}
              <CouponInput
                orderType="wedding"
                onCouponApplied={setAppliedCoupon}
                appliedCoupon={appliedCoupon}
              />

              {/* Acknowledgements */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Policies & Acknowledgements</h2>
                <div className="space-y-3">
                  <label className="flex items-start cursor-pointer p-4 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acknowledgeLeadTime}
                      onChange={(e) => setFormData({ ...formData, acknowledgeLeadTime: e.target.checked })}
                      className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                    />
                    <span className="ml-3 text-sm text-stone-600">
                      I understand that wedding orders require at least <strong>1 month notice</strong> and popular dates may require 2-3 months advance booking. <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start cursor-pointer p-4 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acknowledgeDeposit}
                      onChange={(e) => setFormData({ ...formData, acknowledgeDeposit: e.target.checked })}
                      className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                    />
                    <span className="ml-3 text-sm text-stone-600">
                      I understand that a <strong>50% non-refundable deposit</strong> is required to secure my date, with final payment due 14 days before the event. <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start cursor-pointer p-4 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acknowledgeAllergy}
                      onChange={(e) => setFormData({ ...formData, acknowledgeAllergy: e.target.checked })}
                      className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                    />
                    <span className="ml-3 text-sm text-stone-600">
                      I understand that all products are made in a kitchen that contains <strong>dairy, eggs, tree nuts, peanuts, and soy</strong>. <span className="text-red-500">*</span>
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
                disabled={submitting}
                className="w-full px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Wedding Inquiry'}
              </button>

              <p className="text-sm text-stone-500 text-center">
                I'll review your inquiry and reach out within 48 hours to discuss details and confirm your order!
              </p>
            </form>
          </div>

          <div className="mt-8 text-center">
            <Link href="/weddings" className="text-[#541409] hover:opacity-70 transition-opacity">
              ← Back to Weddings
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
