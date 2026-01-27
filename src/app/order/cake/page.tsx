'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TimeSlotPicker } from '@/components/forms';

export default function CakeOrderPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    pickupSlot: null as { date: string; time: string } | null,
    eventType: '',
    cakeSize: '',
    cakeFlavor: '',
    filling: '',
    frosting: '',
    design: '',
    inspiration: '',
    allergies: '',
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

    setSubmitting(true);
    try {
      const response = await fetch('/api/orders/cake', {
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
          cake_size: formData.cakeSize,
          cake_flavor: formData.cakeFlavor,
          filling: formData.filling,
          frosting: formData.frosting,
          design: formData.design,
          inspiration: formData.inspiration,
          allergies: formData.allergies,
          notes: formData.message,
          acknowledge_deposit: formData.acknowledgeDeposit,
          acknowledge_allergens: formData.acknowledgeAllergens,
          acknowledge_lead_time: formData.acknowledgeLeadTime,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      window.location.href = '/order/success?type=cake';
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
            Cake Inquiry Form
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            Tell me about your dream cake
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
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

              {/* Pickup Date & Time */}
              <div>
                <TimeSlotPicker
                  orderType="cake"
                  value={formData.pickupSlot ?? undefined}
                  onChange={(slot) => setFormData({ ...formData, pickupSlot: slot })}
                  label="Preferred Pickup Date & Time"
                />
                <p className="mt-1 text-xs text-stone-500">
                  Select your preferred pickup time. This can be adjusted after we discuss your order.
                </p>
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
                      <option value="birthday">Birthday</option>
                      <option value="wedding">Wedding</option>
                      <option value="baby-shower">Baby Shower</option>
                      <option value="bridal-shower">Bridal Shower</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="graduation">Graduation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cakeSize" className="block text-sm font-medium text-[#541409] mb-2">
                      Cake Size <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="cakeSize"
                      required
                      className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.cakeSize ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                      value={formData.cakeSize}
                      onChange={(e) => setFormData({ ...formData, cakeSize: e.target.value })}
                    >
                      <option value="">Select an option</option>
                      <option value="6-inch">6" Round (serves 8-10) - $50</option>
                      <option value="8-inch">8" Round (serves 14-18) - $70</option>
                      <option value="10-inch">10" Round (serves 24-30) - $90</option>
                      <option value="tiered">Tiered Cake - Starting at $120</option>
                      <option value="unsure">Not sure - need guidance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cake Details */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Cake Details</h2>
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
                      <option value="">Select an option</option>
                      <option value="vanilla">Vanilla</option>
                      <option value="chocolate">Chocolate</option>
                      <option value="funfetti">Funfetti</option>
                      <option value="red-velvet">Red Velvet</option>
                      <option value="lemon">Lemon</option>
                      <option value="strawberry">Strawberry</option>
                      <option value="other">Other (specify in notes)</option>
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
                      <option value="">Select an option (or leave blank)</option>
                      <option value="vanilla-buttercream">Vanilla Buttercream</option>
                      <option value="chocolate-buttercream">Chocolate Buttercream</option>
                      <option value="cream-cheese">Cream Cheese Frosting</option>
                      <option value="strawberry-jam">Strawberry Jam</option>
                      <option value="lemon-curd">Lemon Curd</option>
                      <option value="raspberry-jam">Raspberry Jam</option>
                      <option value="other">Other (specify in notes)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="frosting" className="block text-sm font-medium text-[#541409] mb-2">
                      Frosting
                    </label>
                    <select
                      id="frosting"
                      className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.frosting ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                      value={formData.frosting}
                      onChange={(e) => setFormData({ ...formData, frosting: e.target.value })}
                    >
                      <option value="">Select an option (or leave blank)</option>
                      <option value="vanilla-buttercream">Vanilla Buttercream</option>
                      <option value="chocolate-buttercream">Chocolate Buttercream</option>
                      <option value="cream-cheese">Cream Cheese Frosting</option>
                      <option value="other">Other (specify in notes)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Design */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Design</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="design" className="block text-sm font-medium text-[#541409] mb-2">
                      Describe Your Vision <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="design"
                      rows={4}
                      required
                      placeholder="Tell me about the design you're envisioning. Include colors, theme, any text you want on the cake, etc."
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.design}
                      onChange={(e) => setFormData({ ...formData, design: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="inspiration" className="block text-sm font-medium text-[#541409] mb-2">
                      Inspiration Image Links
                    </label>
                    <textarea
                      id="inspiration"
                      rows={2}
                      placeholder="Paste any Pinterest or Instagram links for inspiration"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.inspiration}
                      onChange={(e) => setFormData({ ...formData, inspiration: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Additional Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-[#541409] mb-2">
                      Allergies or Dietary Restrictions
                    </label>
                    <input
                      type="text"
                      id="allergies"
                      placeholder="Besides gluten, any other allergies I should know about?"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[#541409] mb-2">
                      Anything Else?
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      placeholder="Any other details or questions..."
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
                      I understand that a <strong>50% non-refundable deposit</strong> is required to secure my order date, with the balance due 1 week before pickup. <span className="text-red-500">*</span>
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
                      I understand that cake orders require at least <strong>2 weeks notice</strong>. <span className="text-red-500">*</span>
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
                {submitting ? 'Submitting...' : 'Submit Cake Inquiry'}
              </button>

              <p className="text-sm text-stone-500 text-center">
                I'll respond within 24-48 hours with a quote and availability.
              </p>
            </form>
          </div>

          <div className="mt-8 text-center">
            <Link href="/cakes" className="text-[#541409] hover:opacity-70 transition-opacity">
              ← Back to Cake Info
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
