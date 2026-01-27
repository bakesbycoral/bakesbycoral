'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TimeSlotPicker } from '@/components/forms';

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
    venueName: '',
    venueAddress: '',
    startTime: '',
    onsiteContact: '',
    guestCount: '',
    servicesNeeded: '',
    cakeTiers: '',
    cakeFlavor: '',
    cakeDesignNotes: '',
    dessertPreferences: '',
    dessertCount: '',
    favorCount: '',
    favorPackaging: '',
    favorFlavors: '',
    colorPalette: '',
    theme: '',
    dietaryRestrictions: '',
    additionalNotes: '',
    budgetRange: '',
    howDidYouHear: '',
    acknowledgeLeadTime: false,
    acknowledgeDeposit: false,
    acknowledgeAllergy: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const showCakeFields = ['cutting_cake', 'cake_and_cookies'].includes(formData.servicesNeeded);
  const showCookieFields = ['cookies', 'cake_and_cookies'].includes(formData.servicesNeeded);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    setSubmitting(true);
    try {
      const response = await fetch('/api/orders/wedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          partner_name: formData.partnerName,
          email: formData.email,
          phone: formData.phone,
          wedding_date: formData.weddingDate,
          pickup_or_delivery: formData.pickupOrDelivery,
          pickup_date: formData.pickupSlot?.date || null,
          pickup_time: formData.pickupSlot?.time || null,
          delivery_time: formData.deliveryTime,
          venue_name: formData.venueName,
          venue_address: formData.venueAddress,
          start_time: formData.startTime,
          onsite_contact: formData.onsiteContact,
          guest_count: formData.guestCount,
          services_needed: formData.servicesNeeded,
          cake_tiers: formData.cakeTiers,
          cake_flavor: formData.cakeFlavor,
          cake_design_notes: formData.cakeDesignNotes,
          dessert_preferences: formData.dessertPreferences,
          dessert_count: formData.dessertCount,
          favor_count: formData.favorCount,
          favor_packaging: formData.favorPackaging,
          favor_flavors: formData.favorFlavors,
          color_palette: formData.colorPalette,
          theme: formData.theme,
          dietary_restrictions: formData.dietaryRestrictions,
          additional_notes: formData.additionalNotes,
          budget_range: formData.budgetRange,
          how_found_us: formData.howDidYouHear,
          acknowledge_lead_time: formData.acknowledgeLeadTime,
          acknowledge_deposit: formData.acknowledgeDeposit,
          acknowledge_allergy: formData.acknowledgeAllergy,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
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
                      <label htmlFor="cakeFlavor" className="block text-sm font-medium text-[#541409] mb-2">
                        Cake Flavor
                      </label>
                      <select
                        id="cakeFlavor"
                        className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.cakeFlavor ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                        value={formData.cakeFlavor}
                        onChange={(e) => setFormData({ ...formData, cakeFlavor: e.target.value })}
                      >
                        <option value="">Select an option</option>
                        <option value="vanilla">Vanilla</option>
                        <option value="chocolate">Chocolate</option>
                        <option value="almond">Almond</option>
                        <option value="lemon">Lemon</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="cakeDesignNotes" className="block text-sm font-medium text-[#541409] mb-2">
                        Cake Design Notes
                      </label>
                      <textarea
                        id="cakeDesignNotes"
                        rows={3}
                        placeholder="Describe your vision for the cake - style, decorations, florals, etc."
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
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="favorCount" className="block text-sm font-medium text-[#541409] mb-2">
                        Estimated Cookie Count
                      </label>
                      <input
                        type="text"
                        id="favorCount"
                        placeholder="e.g., 100 cookies"
                        className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                        value={formData.favorCount}
                        onChange={(e) => setFormData({ ...formData, favorCount: e.target.value })}
                      />
                      <p className="text-xs text-stone-500 mt-1">I can help determine this based on your guest count</p>
                    </div>
                    <div>
                      <label htmlFor="favorFlavors" className="block text-sm font-medium text-[#541409] mb-2">
                        Flavor Preferences
                      </label>
                      <textarea
                        id="favorFlavors"
                        rows={2}
                        placeholder="What cookie flavors would you like?"
                        className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409] placeholder:text-[#541409]/50"
                        value={formData.favorFlavors}
                        onChange={(e) => setFormData({ ...formData, favorFlavors: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Style & Theme */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Style & Theme</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="colorPalette" className="block text-sm font-medium text-[#541409] mb-2">
                      Color Palette
                    </label>
                    <input
                      type="text"
                      id="colorPalette"
                      placeholder="e.g., Dusty rose, sage green, gold"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.colorPalette}
                      onChange={(e) => setFormData({ ...formData, colorPalette: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-[#541409] mb-2">
                      Wedding Theme/Style
                    </label>
                    <input
                      type="text"
                      id="theme"
                      placeholder="e.g., Rustic, Modern, Romantic"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.theme}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    />
                  </div>
                </div>
              </div>

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
                    <label htmlFor="budgetRange" className="block text-sm font-medium text-[#541409] mb-2">
                      Budget Range
                    </label>
                    <select
                      id="budgetRange"
                      className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.budgetRange ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                      value={formData.budgetRange}
                      onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    >
                      <option value="">Select an option</option>
                      <option value="300-500">$300 - $500</option>
                      <option value="500-750">$500 - $750</option>
                      <option value="750-1000">$750 - $1,000</option>
                      <option value="1000-1500">$1,000 - $1,500</option>
                      <option value="1500+">$1,500+</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="additionalNotes" className="block text-sm font-medium text-[#541409] mb-2">
                      Special Requests & Anything Else I Need to Know
                    </label>
                    <textarea
                      id="additionalNotes"
                      rows={3}
                      placeholder="Be specific! Color scheme, theme, inspo, certain details, etc"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
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
