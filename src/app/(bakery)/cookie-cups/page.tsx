'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TimeSlotPicker } from '@/components/forms';

export default function CookieCupsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: '' as '' | '12' | '24' | '36' | '48',
    chocolateMolds: false,
    edibleGlitter: false,
    pickupSlot: null as { date: string; time: string } | null,
    designDetails: '',
    colors: '',
    occasion: '',
    inspirationFiles: [] as File[],
    allergies: '',
    howDidYouHear: '',
    message: '',
    acknowledgePayment: false,
    acknowledgeAllergens: false,
    acknowledgeLeadTime: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);


  const dozensCount = formData.quantity ? parseInt(formData.quantity) / 12 : 0;
  const basePrice = dozensCount * 3000;
  const moldPrice = formData.chocolateMolds ? (dozensCount * 400) : 0;
  const glitterPrice = formData.edibleGlitter ? (dozensCount * 200) : 0;
  const total = basePrice + moldPrice + glitterPrice;
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.quantity) {
      setSubmitError('Please select a quantity.');
      return;
    }

    if (!formData.pickupSlot) {
      setSubmitError('Please select a pickup date and time.');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('quantity', formData.quantity);
      submitData.append('chocolate_molds', formData.chocolateMolds.toString());
      submitData.append('edible_glitter', formData.edibleGlitter.toString());
      submitData.append('pickup_date', formData.pickupSlot?.date || '');
      submitData.append('pickup_time', formData.pickupSlot?.time || '');
      submitData.append('design_details', formData.designDetails);
      submitData.append('colors', formData.colors);
      submitData.append('occasion', formData.occasion);
      submitData.append('allergies', formData.allergies);
      submitData.append('how_did_you_hear', formData.howDidYouHear);
      submitData.append('notes', formData.message);

      // Append inspiration images
      formData.inspirationFiles.forEach((file) => {
        submitData.append('inspiration_images', file);
      });

      const response = await fetch('/api/orders/cookie-cups', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || 'Failed to submit order');
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
            Cookie Cups
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            Mini chocolate chip cookie cups with vanilla buttercream
          </p>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-lg text-stone-600 leading-relaxed">
              Adorable mini chocolate chip cookie cups filled with sweet vanilla buttercream frosting.
              Perfect for parties, showers, and celebrations. Each order is fully customized
              with your choice of colors and designs.
            </p>
          </div>

          {/* What's Included */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-xl font-serif text-[#541409] mb-4 text-center">What's Included</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-4 py-2 bg-[#EAD6D6] rounded-full text-[#541409] text-sm">Piped Designs</span>
              <span className="px-4 py-2 bg-[#EAD6D6] rounded-full text-[#541409] text-sm">Sprinkles</span>
              <span className="px-4 py-2 bg-[#EAD6D6] rounded-full text-[#541409] text-sm">Custom Colors</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
              <h3 className="text-lg font-serif text-[#541409] mb-1">1 Dozen</h3>
              <p className="text-2xl font-bold text-[#541409]">$30</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
              <h3 className="text-lg font-serif text-[#541409] mb-1">2 Dozen</h3>
              <p className="text-2xl font-bold text-[#541409]">$60</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
              <h3 className="text-lg font-serif text-[#541409] mb-1">3 Dozen</h3>
              <p className="text-2xl font-bold text-[#541409]">$90</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
              <h3 className="text-lg font-serif text-[#541409] mb-1">4 Dozen</h3>
              <p className="text-2xl font-bold text-[#541409]">$120</p>
            </div>
          </div>

          {/* Add-ons */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-stone-600">
              <strong className="text-[#541409]">Add-ons:</strong> Chocolate Molds +$4/dozen | Edible Glitter +$2/dozen
            </p>
            <p className="text-sm text-stone-500">
              Need more than 4 dozen? Just ask!
            </p>
          </div>
        </div>
      </section>

      {/* Order Form */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-8">
            Order Cookie Cups
          </h2>

          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quantity Selection */}
              <div>
                <h3 className="text-lg font-serif text-[#541409] mb-3">How many?</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, quantity: '12' })}
                    className={`py-4 px-4 rounded-md text-center font-medium transition-colors ${
                      formData.quantity === '12'
                        ? 'bg-[#541409] text-[#EAD6D6]'
                        : 'border border-[#541409] text-[#541409] hover:bg-[#EAD6D6]'
                    }`}
                  >
                    <span className="block text-lg">1 Dozen</span>
                    <span className="block text-sm opacity-80">$30</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, quantity: '24' })}
                    className={`py-4 px-4 rounded-md text-center font-medium transition-colors ${
                      formData.quantity === '24'
                        ? 'bg-[#541409] text-[#EAD6D6]'
                        : 'border border-[#541409] text-[#541409] hover:bg-[#EAD6D6]'
                    }`}
                  >
                    <span className="block text-lg">2 Dozen</span>
                    <span className="block text-sm opacity-80">$60</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, quantity: '36' })}
                    className={`py-4 px-4 rounded-md text-center font-medium transition-colors ${
                      formData.quantity === '36'
                        ? 'bg-[#541409] text-[#EAD6D6]'
                        : 'border border-[#541409] text-[#541409] hover:bg-[#EAD6D6]'
                    }`}
                  >
                    <span className="block text-lg">3 Dozen</span>
                    <span className="block text-sm opacity-80">$90</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, quantity: '48' })}
                    className={`py-4 px-4 rounded-md text-center font-medium transition-colors ${
                      formData.quantity === '48'
                        ? 'bg-[#541409] text-[#EAD6D6]'
                        : 'border border-[#541409] text-[#541409] hover:bg-[#EAD6D6]'
                    }`}
                  >
                    <span className="block text-lg">4 Dozen</span>
                    <span className="block text-sm opacity-80">$120</span>
                  </button>
                </div>
                <p className="text-sm text-stone-500 mt-2 text-center">
                  Need more than 4 dozen? Just ask!
                </p>
              </div>

              {/* Add-ons */}
              <div>
                <h3 className="text-lg font-serif text-[#541409] mb-3">Add-ons</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer p-4 border border-[#EAD6D6] rounded hover:bg-[#EAD6D6]/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.chocolateMolds}
                      onChange={(e) => setFormData({ ...formData, chocolateMolds: e.target.checked })}
                      className="w-5 h-5 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                    />
                    <span className="ml-3 text-[#541409]">Chocolate Molds (+$4/dozen)</span>
                  </label>
                  <label className="flex items-center cursor-pointer p-4 border border-[#EAD6D6] rounded hover:bg-[#EAD6D6]/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.edibleGlitter}
                      onChange={(e) => setFormData({ ...formData, edibleGlitter: e.target.checked })}
                      className="w-5 h-5 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                    />
                    <span className="ml-3 text-[#541409]">Edible Glitter (+$2/dozen)</span>
                  </label>
                </div>
              </div>

              {/* Design Details */}
              <div>
                <h3 className="text-lg font-serif text-[#541409] mb-3">Customization</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="occasion" className="block text-sm font-medium text-[#541409] mb-2">
                      What's the occasion?
                    </label>
                    <input
                      type="text"
                      id="occasion"
                      placeholder="Birthday, baby shower, wedding, etc."
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.occasion}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="colors" className="block text-sm font-medium text-[#541409] mb-2">
                      Colors
                    </label>
                    <input
                      type="text"
                      id="colors"
                      placeholder="Pink and gold, blue and white, etc."
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.colors}
                      onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="designDetails" className="block text-sm font-medium text-[#541409] mb-2">
                      Design Details
                    </label>
                    <textarea
                      id="designDetails"
                      rows={3}
                      placeholder="Describe any specific designs, themes, or inspiration..."
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.designDetails}
                      onChange={(e) => setFormData({ ...formData, designDetails: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="inspirationFiles" className="block text-sm font-medium text-[#541409] mb-2">
                      Inspiration Images
                    </label>
                    <p className="text-xs text-stone-500 mb-2">Upload up to 5 images for inspiration (optional)</p>
                    <input
                      type="file"
                      id="inspirationFiles"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const totalFiles = formData.inspirationFiles.length + files.length;
                        if (totalFiles > 5) {
                          alert('You can upload a maximum of 5 images');
                          return;
                        }
                        setFormData({ ...formData, inspirationFiles: [...formData.inspirationFiles, ...files] });
                        e.target.value = '';
                      }}
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-[#541409] file:text-[#EAD6D6] file:cursor-pointer"
                      disabled={formData.inspirationFiles.length >= 5}
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
                    <p className="text-xs text-stone-500 mt-2">
                      {formData.inspirationFiles.length}/5 images uploaded
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-serif text-[#541409] mb-3">Your Information</h3>
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
                  <div className="sm:col-span-2">
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
                </div>
              </div>

              {/* Pickup */}
              <TimeSlotPicker
                orderType="cookie_cups"
                value={formData.pickupSlot ?? undefined}
                onChange={(slot) => setFormData({ ...formData, pickupSlot: slot })}
                label="Preferred Pickup Date & Time"
                required
              />

              {/* Additional Info */}
              <div>
                <h3 className="text-lg font-serif text-[#541409] mb-3">Additional Information</h3>
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
                      Anything else?
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

              {/* Order Summary */}
              {formData.quantity && (
                <div className="bg-[#EAD6D6]/30 rounded-lg p-4">
                  <h3 className="text-lg font-serif text-[#541409] mb-3">Order Summary</h3>
                  <div className="space-y-1 text-sm text-[#541409]">
                    <div className="flex justify-between">
                      <span>{formData.quantity} Cookie Cups</span>
                      <span>{formatPrice(basePrice)}</span>
                    </div>
                    {formData.chocolateMolds && (
                      <div className="flex justify-between">
                        <span>Chocolate Molds</span>
                        <span>+${moldPrice / 100}</span>
                      </div>
                    )}
                    {formData.edibleGlitter && (
                      <div className="flex justify-between">
                        <span>Edible Glitter</span>
                        <span>+${glitterPrice / 100}</span>
                      </div>
                    )}
                    <div className="pt-2 mt-2 border-t border-[#EAD6D6] font-medium flex justify-between">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Acknowledgements */}
              <div>
                <h3 className="text-lg font-serif text-[#541409] mb-3">Policies & Acknowledgements</h3>
                <div className="space-y-3">
                  <label className="flex items-start cursor-pointer p-4 border border-stone-200 rounded-sm hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acknowledgePayment}
                      onChange={(e) => setFormData({ ...formData, acknowledgePayment: e.target.checked })}
                      className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                    />
                    <span className="ml-3 text-sm text-stone-600">
                      I understand that <strong>50% of full payment is non-refundable</strong> once my order is confirmed. <span className="text-red-500">*</span>
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
                      I understand that cookie cup orders require at least <strong>1 week notice</strong>. <span className="text-red-500">*</span>
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
                disabled={submitting || !formData.quantity}
                className="w-full px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Order Inquiry'}
              </button>

              <p className="text-sm text-stone-500 text-center">
                I'll respond within 24-48 hours to confirm your order and arrange payment.
              </p>
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
