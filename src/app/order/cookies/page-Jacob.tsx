'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CookieOrderPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupDate: '',
    quantity: '',
    flavors: {
      chocolateChip: 0,
      doubleChocolate: 0,
      snickerdoodle: 0,
      peanutButter: 0,
      oatmealRaisin: 0,
      sugarCookie: 0,
    },
    allergies: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your cookie order! I\'ll get back to you within 24-48 hours to confirm.');
  };

  const totalCookies = Object.values(formData.flavors).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Hero Banner */}
      <section
        className="py-16 sm:py-20"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            #541409 0px,
            #541409 40px,
            #EAD6D6 40px,
            #EAD6D6 80px
          )`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif text-white font-bold drop-shadow-lg">
            Cookie Order Form
          </h1>
          <p className="mt-4 text-lg text-white/90 drop-shadow">
            Soft, chewy, gluten-free goodness
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Pricing Info */}
          <div className="bg-[#EAD6D6] rounded-lg p-6 mb-8 text-center">
            <p className="text-[#541409] font-medium">
              1 Dozen = $25 | 2 Dozen = $48 | Mix & match flavors welcome!
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
                    <label htmlFor="pickupDate" className="block text-sm font-medium text-[#541409] mb-2">
                      Preferred Pickup Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="pickupDate"
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent"
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-[#541409] mb-2">
                  How Many Dozen? <span className="text-red-500">*</span>
                </label>
                <select
                  id="quantity"
                  required
                  className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                >
                  <option value="">Select an option</option>
                  <option value="1">1 Dozen - $25</option>
                  <option value="2">2 Dozen - $48</option>
                  <option value="3">3 Dozen - $72</option>
                  <option value="4">4 Dozen - $96</option>
                </select>
                <p className="text-xs text-stone-500 mt-1">
                  For 5+ dozen, please use the <Link href="/order/cookies-large" className="text-[#541409] underline">large order form</Link>.
                </p>
              </div>

              {/* Flavors */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Choose Your Flavors</h2>
                <p className="text-sm text-stone-600 mb-4">
                  Select how many of each flavor you'd like. Total should equal {formData.quantity ? parseInt(formData.quantity) * 12 : 'your dozen count x 12'}.
                </p>
                <div className="space-y-4">
                  {[
                    { key: 'chocolateChip', label: 'Chocolate Chip' },
                    { key: 'doubleChocolate', label: 'Double Chocolate' },
                    { key: 'snickerdoodle', label: 'Snickerdoodle' },
                    { key: 'peanutButter', label: 'Peanut Butter' },
                    { key: 'oatmealRaisin', label: 'Oatmeal Raisin' },
                    { key: 'sugarCookie', label: 'Sugar Cookie' },
                  ].map((flavor) => (
                    <div key={flavor.key} className="flex items-center justify-between">
                      <label className="text-stone-700">{flavor.label}</label>
                      <input
                        type="number"
                        min="0"
                        max="48"
                        className="w-20 px-3 py-2 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-center"
                        value={formData.flavors[flavor.key as keyof typeof formData.flavors]}
                        onChange={(e) => setFormData({
                          ...formData,
                          flavors: {
                            ...formData.flavors,
                            [flavor.key]: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-[#EAD6D6] rounded text-center">
                  <span className="font-medium text-[#541409]">Total cookies: {totalCookies}</span>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Additional Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-[#541409] mb-2">
                      Allergies (besides gluten)
                    </label>
                    <input
                      type="text"
                      id="allergies"
                      placeholder="e.g., nut allergy, dairy-free, etc."
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[#541409] mb-2">
                      Notes or Questions
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      placeholder="Anything else I should know?"
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
                Submit Cookie Order
              </button>

              <p className="text-sm text-stone-500 text-center">
                I'll confirm your order and send payment info within 24-48 hours.
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
