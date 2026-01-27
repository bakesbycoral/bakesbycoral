'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TimeSlotPicker } from '@/components/forms';

export default function LargeCookieOrderPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    pickupSlot: null as { date: string; time: string } | null,
    eventType: '',
    eventLocation: '',
    pickupOrDelivery: '',
    quantity: '',
    flavors: {
      chocolateChip: false,
      vanillaBeanSugar: false,
      cherryAlmond: false,
      espressoButterscotch: false,
      lemonSugar: false,
    },
    flavorQuantities: '',
    packaging: '',
    allergies: '',
    howDidYouHear: '',
    message: '',
    acknowledgeDeposit: false,
    acknowledgeAllergens: false,
    acknowledgeLeadTime: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (formData.pickupOrDelivery === 'pickup' && !formData.pickupSlot) {
      setSubmitError('Please select a pickup date and time.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/orders/cookies-large', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          event_date: formData.eventDate,
          pickup_date: formData.pickupSlot?.date || null,
          pickup_time: formData.pickupSlot?.time || null,
          event_type: formData.eventType,
          event_location: formData.eventLocation,
          pickup_or_delivery: formData.pickupOrDelivery,
          quantity: parseInt(formData.quantity),
          flavors: formData.flavors,
          flavor_quantities: formData.flavorQuantities,
          packaging: formData.packaging,
          allergies: formData.allergies,
          how_did_you_hear: formData.howDidYouHear,
          notes: formData.message,
          acknowledge_deposit: formData.acknowledgeDeposit,
          acknowledge_allergens: formData.acknowledgeAllergens,
          acknowledge_lead_time: formData.acknowledgeLeadTime,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit order');
      }

      window.location.href = '/order/success?type=cookies_large';
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
            Large Cookie Orders
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            Perfect for events, showers, and parties
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Info */}
          <div className="bg-[#EAD6D6] rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-[#541409] mb-2">Large Order Pricing</h2>
            <p className="text-stone-700 text-sm">
              <strong>$30 per dozen.</strong> Orders of 10+ dozen get <strong>5% off</strong> your total! Fill out this form with your event details and I'll confirm availability and provide a quote.
            </p>
            <p className="text-[#541409] text-sm font-medium mt-3">
              Please note: Large orders require at least 2 weeks notice. Rush orders may be available for an additional fee—just ask!
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
                  <div>
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
                  <div>
                    <label htmlFor="eventDate" className="block text-sm font-medium text-[#541409] mb-2">
                      Event Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="eventDate"
                      required
                      className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent ${formData.eventDate ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Event Details</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="eventType" className="block text-sm font-medium text-[#541409] mb-2">
                      Event Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="eventType"
                      required
                      className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.eventType ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    >
                      <option value="">Select an option</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="party">Party</option>
                      <option value="shower">Baby/Bridal Shower</option>
                      <option value="fundraiser">Fundraiser</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-[#541409] mb-2">
                      How Many Dozen? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      min="4"
                      required
                      placeholder="Minimum 4 dozen"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="pickupOrDelivery" className="block text-sm font-medium text-[#541409] mb-2">
                      Pickup or Delivery? <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="pickupOrDelivery"
                      required
                      className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.pickupOrDelivery ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                      value={formData.pickupOrDelivery}
                      onChange={(e) => setFormData({ ...formData, pickupOrDelivery: e.target.value, pickupSlot: null })}
                    >
                      <option value="">Select an option</option>
                      <option value="pickup">Pickup</option>
                      <option value="delivery">Delivery (fee starting at $75, if available)</option>
                    </select>
                  </div>

                  {formData.pickupOrDelivery === 'pickup' && (
                    <TimeSlotPicker
                      orderType="cookies_large"
                      value={formData.pickupSlot ?? undefined}
                      onChange={(slot) => setFormData({ ...formData, pickupSlot: slot })}
                      label="Preferred Pickup Date & Time"
                      required
                    />
                  )}

                  <div>
                    <label htmlFor="eventLocation" className="block text-sm font-medium text-[#541409] mb-2">
                      Event Location
                    </label>
                    <input
                      type="text"
                      id="eventLocation"
                      placeholder="City or venue name"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.eventLocation}
                      onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Cookie Details */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Cookie Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#541409] mb-3">
                      Flavor Preferences <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {[
                        { key: 'chocolateChip', label: 'Chocolate Chip' },
                        { key: 'vanillaBeanSugar', label: 'Vanilla Bean Sugar' },
                        { key: 'cherryAlmond', label: 'Cherry Almond' },
                        { key: 'espressoButterscotch', label: 'Espresso Butterscotch' },
                        { key: 'lemonSugar', label: 'Lemon Sugar' },
                      ].map((flavor) => (
                        <label key={flavor.key} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.flavors[flavor.key as keyof typeof formData.flavors]}
                            onChange={(e) => setFormData({
                              ...formData,
                              flavors: {
                                ...formData.flavors,
                                [flavor.key]: e.target.checked
                              }
                            })}
                            className="w-5 h-5 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                          />
                          <span className="ml-3 text-[#541409]">{flavor.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="flavorQuantities" className="block text-sm font-medium text-[#541409] mb-2">
                      Specific Quantity Per Flavor?
                    </label>
                    <textarea
                      id="flavorQuantities"
                      rows={3}
                      placeholder="e.g., 3 dozen Chocolate Chip, 2 dozen Lemon Sugar, etc."
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.flavorQuantities}
                      onChange={(e) => setFormData({ ...formData, flavorQuantities: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="packaging" className="block text-sm font-medium text-[#541409] mb-2">
                      Packaging Preference <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="packaging"
                      required
                      className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.packaging ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                      value={formData.packaging}
                      onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                    >
                      <option value="">Select an option</option>
                      <option value="standard">Standard</option>
                      <option value="heat-sealed">Individually Heat Sealed (+$5/dozen)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Additional Information</h2>
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
                    <label htmlFor="message" className="block text-sm font-medium text-[#541409] mb-2">
                      Tell Me About Your Event
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Share any details about your event, special requests, or questions..."
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                      checked={formData.acknowledgeDeposit}
                      onChange={(e) => setFormData({ ...formData, acknowledgeDeposit: e.target.checked })}
                      className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                    />
                    <span className="ml-3 text-sm text-stone-600">
                      I understand that a <strong>50% non-refundable deposit</strong> is required to secure my order date. <span className="text-red-500">*</span>
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
                      I understand that large cookie orders require at least <strong>2 weeks notice</strong>. <span className="text-red-500">*</span>
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
                {submitting ? 'Submitting...' : 'Submit Large Order Inquiry'}
              </button>

              <p className="text-sm text-stone-500 text-center">
                I'll respond within 24-48 hours with a custom quote for your event.
              </p>
            </form>
          </div>

          <div className="mt-8 text-center">
            <Link href="/cookies" className="text-[#541409] hover:opacity-70 transition-opacity">
              ← Back to Cookie Info
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
