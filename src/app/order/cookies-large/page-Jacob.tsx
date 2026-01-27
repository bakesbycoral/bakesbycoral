'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LargeCookieOrderPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventType: '',
    quantity: '',
    flavors: '',
    packaging: '',
    allergies: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your large cookie order inquiry! I\'ll get back to you within 24-48 hours with a quote.');
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
            Perfect for events, weddings, and parties
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
              For orders of 4+ dozen, pricing starts at $95. Fill out this form
              with your event details and I'll confirm availability and provide a quote.
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
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white"
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    >
                      <option value="">Select an option</option>
                      <option value="wedding">Wedding</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="party">Party</option>
                      <option value="shower">Baby/Bridal Shower</option>
                      <option value="fundraiser">Fundraiser</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-[#541409] mb-2">
                      Estimated Quantity <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="quantity"
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    >
                      <option value="">Select an option</option>
                      <option value="4-6">4-6 Dozen</option>
                      <option value="7-10">7-10 Dozen</option>
                      <option value="11-15">11-15 Dozen</option>
                      <option value="16-20">16-20 Dozen</option>
                      <option value="20+">20+ Dozen</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cookie Details */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Cookie Details</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="flavors" className="block text-sm font-medium text-[#541409] mb-2">
                      Flavor Preferences <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="flavors"
                      rows={3}
                      required
                      placeholder="Which flavors are you interested in? (Chocolate Chip, Double Chocolate, Snickerdoodle, Peanut Butter, Oatmeal Raisin, Sugar Cookie)"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none"
                      value={formData.flavors}
                      onChange={(e) => setFormData({ ...formData, flavors: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="packaging" className="block text-sm font-medium text-[#541409] mb-2">
                      Packaging Preference
                    </label>
                    <select
                      id="packaging"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white"
                      value={formData.packaging}
                      onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                    >
                      <option value="">Select an option</option>
                      <option value="bulk">Bulk (in boxes)</option>
                      <option value="individual">Individually Wrapped</option>
                      <option value="favor">Wedding Favor Style (wrapped with labels)</option>
                      <option value="unsure">Not sure - need guidance</option>
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
                      placeholder="Any allergies besides gluten we should be aware of?"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
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
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
              >
                Submit Large Order Inquiry
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
