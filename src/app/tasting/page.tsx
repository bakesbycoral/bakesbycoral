'use client';

import { useState } from 'react';

export default function TastingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    weddingDate: '',
    tastingType: '',
    cakeFlavors: '',
    cookieFlavors: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your tasting request! I\'ll get back to you within 24-48 hours.');
  };

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
            Tasting Boxes
          </h1>
          <p className="mt-4 text-lg text-white/90 drop-shadow">
            Sample flavors before your big day
          </p>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-lg text-stone-600 leading-relaxed">
              Tasting boxes are designed for couples inquiring about wedding desserts who would
              like to sample flavors before finalizing their order. If you book your wedding
              desserts within 30 days of submitting this form, your payment will be credited
              toward your order!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cake Tasting Box */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-4">Cake Tasting Box</h2>
              <p className="text-stone-600 mb-6">
                Each cake tasting box includes individual cake samples in 8oz jars with vanilla
                buttercream. Fillings are separated for easy mixing and matching.
              </p>
              <ul className="space-y-2 text-stone-600 text-sm mb-6">
                <li className="flex items-center">
                  <span className="text-[#541409] mr-2">✓</span>
                  4 cake flavors
                </li>
                <li className="flex items-center">
                  <span className="text-[#541409] mr-2">✓</span>
                  4 filling options
                </li>
                <li className="flex items-center">
                  <span className="text-[#541409] mr-2">✓</span>
                  Vanilla buttercream included
                </li>
                <li className="flex items-center">
                  <span className="text-[#541409] mr-2">✓</span>
                  Mix & match to find your perfect combo
                </li>
              </ul>
              <p className="text-2xl font-bold text-[#541409]">$35</p>
            </div>

            {/* Cookie Tasting Box */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-4">Cookie Tasting Box</h2>
              <p className="text-stone-600 mb-6">
                Each cookie tasting box includes 2 cookies of each flavor. Each cookie is
                individually bagged and heat sealed for longer freshness.
              </p>
              <ul className="space-y-2 text-stone-600 text-sm mb-6">
                <li className="flex items-center">
                  <span className="text-[#541409] mr-2">✓</span>
                  4 cookie flavors
                </li>
                <li className="flex items-center">
                  <span className="text-[#541409] mr-2">✓</span>
                  2 cookies of each flavor (8 total)
                </li>
                <li className="flex items-center">
                  <span className="text-[#541409] mr-2">✓</span>
                  Individually sealed for freshness
                </li>
                <li className="flex items-center">
                  <span className="text-[#541409] mr-2">✓</span>
                  Perfect for sharing with your partner
                </li>
              </ul>
              <p className="text-2xl font-bold text-[#541409]">$25</p>
            </div>
          </div>

          <div className="mt-8 bg-[#EAD6D6] rounded-lg p-6 text-center">
            <p className="text-[#541409] font-medium">
              Book your wedding desserts within 30 days and your tasting fee is credited to your order!
            </p>
          </div>
        </div>
      </section>

      {/* Order Form */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-serif text-[#541409] mb-6 text-center">Order a Tasting Box</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  <label htmlFor="weddingDate" className="block text-sm font-medium text-[#541409] mb-2">
                    Wedding Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="weddingDate"
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent"
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tastingType" className="block text-sm font-medium text-[#541409] mb-2">
                  Tasting Box Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="tastingType"
                  required
                  className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white"
                  value={formData.tastingType}
                  onChange={(e) => setFormData({ ...formData, tastingType: e.target.value })}
                >
                  <option value="">Select an option</option>
                  <option value="cake">Cake Tasting Box ($35)</option>
                  <option value="cookie">Cookie Tasting Box ($25)</option>
                  <option value="both">Both Boxes ($55)</option>
                </select>
              </div>

              {(formData.tastingType === 'cake' || formData.tastingType === 'both') && (
                <div>
                  <label htmlFor="cakeFlavors" className="block text-sm font-medium text-[#541409] mb-2">
                    Cake Flavor Preferences
                  </label>
                  <input
                    type="text"
                    id="cakeFlavors"
                    placeholder="e.g., Vanilla, Chocolate, Lemon, Red Velvet"
                    className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent"
                    value={formData.cakeFlavors}
                    onChange={(e) => setFormData({ ...formData, cakeFlavors: e.target.value })}
                  />
                  <p className="text-xs text-stone-500 mt-1">Leave blank and I'll choose a variety for you!</p>
                </div>
              )}

              {(formData.tastingType === 'cookie' || formData.tastingType === 'both') && (
                <div>
                  <label htmlFor="cookieFlavors" className="block text-sm font-medium text-[#541409] mb-2">
                    Cookie Flavor Preferences
                  </label>
                  <input
                    type="text"
                    id="cookieFlavors"
                    placeholder="e.g., Chocolate Chip, Snickerdoodle, Peanut Butter"
                    className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent"
                    value={formData.cookieFlavors}
                    onChange={(e) => setFormData({ ...formData, cookieFlavors: e.target.value })}
                  />
                  <p className="text-xs text-stone-500 mt-1">Leave blank and I'll choose a variety for you!</p>
                </div>
              )}

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#541409] mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Tell me about your wedding vision, any allergies, or questions you have..."
                  className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
              >
                Submit Tasting Request
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
