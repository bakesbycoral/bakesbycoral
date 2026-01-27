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
    guestCount: '',
    servicesNeeded: '',
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

  const showCakeFields = ['cutting_cake', 'cake_and_cookies'].includes(formData.servicesNeeded);
  const showCookieFields = ['cookies', 'cake_and_cookies'].includes(formData.servicesNeeded);

  // Cookie calculations
  const totalCookies = Object.values(formData.cookieFlavors).reduce((a, b) => a + b, 0);
  const maxCookies = formData.cookieQuantity ? parseInt(formData.cookieQuantity) * 12 : 0;
  const remainingCookies = maxCookies - totalCookies;
  const hasCookieDiscount = formData.cookieQuantity && parseInt(formData.cookieQuantity) >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate inspiration images if cake is selected
    if (showCakeFields && formData.inspirationFiles.length === 0) {
      setSubmitError('Please upload at least one inspiration image for your cake.');
      return;
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
      submitData.append('guest_count', formData.guestCount);
      submitData.append('services_needed', formData.servicesNeeded);
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

      window.location.href = '/order/success?type=wedding';
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
                    <div>
                      <label htmlFor="guestCount" className="block text-sm font-medium text-[#541409] mb-2">
                        Estimated Guest Count <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="guestCount"
                        required
                        className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.guestCount ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                        value={formData.guestCount}
                        onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                      >
                        <option value="">Select an option</option>
                        <option value="25-50">25-50 guests</option>
                        <option value="50-100">50-100 guests</option>
                        <option value="100-150">100-150 guests</option>
                        <option value="150-200">150-200 guests</option>
                        <option value="200+">200+ guests</option>
                      </select>
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
                  <label htmlFor="servicesNeeded" className="block text-sm font-medium text-[#541409] mb-2">
                    What services are you interested in? <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="servicesNeeded"
                    required
                    className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.servicesNeeded ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                    value={formData.servicesNeeded}
                    onChange={(e) => setFormData({ ...formData, servicesNeeded: e.target.value })}
                  >
                    <option value="">Select an option</option>
                    <option value="cutting_cake">Cutting Cake</option>
                    <option value="cookies">Cookies</option>
                    <option value="cake_and_cookies">Cake + Cookies</option>
                  </select>
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
                        <option value="lemon-curd">Lemon Curd (+$5)</option>
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
                          const newMax = newQuantity ? parseInt(newQuantity) * 12 : 0;
                          if (totalCookies > newMax) {
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
                          ? `Select how many of each flavor (total must equal ${parseInt(formData.cookieQuantity) * 12} cookies). Remaining: ${remainingCookies}`
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
                          const maxForFlavor = currentValue + Math.floor(remainingCookies / 12) * 12;
                          return (
                            <div key={flavor.key} className="flex items-center justify-between">
                              <label className="text-stone-700">{flavor.label}</label>
                              <input
                                type="number"
                                min="0"
                                max={maxForFlavor}
                                step="12"
                                disabled={!formData.cookieQuantity}
                                className="w-20 px-3 py-2 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-center text-[#541409] disabled:bg-stone-100 disabled:cursor-not-allowed"
                                value={currentValue}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  const rounded = Math.round(value / 12) * 12;
                                  const capped = Math.max(0, Math.min(maxForFlavor, rounded));
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
                      <p className="text-xs text-stone-500 mt-2">
                        Quantities must be in increments of 12 (one dozen)
                      </p>
                      <div className="mt-4 p-3 bg-[#EAD6D6] rounded text-center space-y-1">
                        <div className="font-medium text-[#541409]">
                          Total: {totalCookies} / {maxCookies || '—'} cookies
                        </div>
                        {formData.cookieQuantity && remainingCookies > 0 && (
                          <div className="text-sm text-[#541409]/70">
                            {remainingCookies} cookies remaining to select
                          </div>
                        )}
                        {formData.cookieQuantity && remainingCookies < 0 && (
                          <div className="text-sm text-red-600">
                            Over by {Math.abs(remainingCookies)} cookies
                          </div>
                        )}
                        {formData.cookieQuantity && totalCookies === maxCookies && (
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
