'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TimeSlotPicker } from '@/components/forms';

const CAKE_FLAVORS = [
  { value: 'vanilla-bean', label: 'Vanilla Bean' },
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'confetti', label: 'Confetti' },
  { value: 'red-velvet', label: 'Red Velvet' },
  { value: 'lemon', label: 'Lemon' },
  { value: 'vanilla-latte', label: 'Vanilla Latte' },
  { value: 'marble', label: 'Marble' },
];

const CAKE_FILLINGS = [
  { value: 'chocolate-ganache', label: 'Chocolate Ganache' },
  { value: 'cookies-and-cream', label: 'Cookies & Cream' },
  { value: 'vanilla-bean-ganache', label: 'Vanilla Bean Ganache' },
  { value: 'fresh-strawberries', label: 'Fresh Strawberries' },
  { value: 'lemon-curd', label: 'Lemon Curd' },
  { value: 'raspberry', label: 'Raspberry' },
];

const COOKIE_FLAVORS = [
  { value: 'chocolate-chip', label: 'Chocolate Chip' },
  { value: 'vanilla-bean-sugar', label: 'Vanilla Bean Sugar' },
  { value: 'cherry-almond', label: 'Cherry Almond' },
  { value: 'espresso-butterscotch', label: 'Espresso Butterscotch' },
  { value: 'lemon-sugar', label: 'Lemon Sugar' },
];

function TastingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    weddingDate: '',
    tastingType: '',
    selectedCakeFlavors: [] as string[],
    selectedFillings: [] as string[],
    selectedCookieFlavors: [] as string[],
    pickupOrDelivery: 'pickup',
    deliveryLocation: '',
    pickupSlot: null as { date: string; time: string } | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCakeFlavor = (flavor: string) => {
    setFormData(prev => {
      if (prev.selectedCakeFlavors.includes(flavor)) {
        return { ...prev, selectedCakeFlavors: prev.selectedCakeFlavors.filter(f => f !== flavor) };
      }
      if (prev.selectedCakeFlavors.length >= 4) return prev;
      return { ...prev, selectedCakeFlavors: [...prev.selectedCakeFlavors, flavor] };
    });
  };

  const toggleFilling = (filling: string) => {
    setFormData(prev => {
      if (prev.selectedFillings.includes(filling)) {
        return { ...prev, selectedFillings: prev.selectedFillings.filter(f => f !== filling) };
      }
      if (prev.selectedFillings.length >= 4) return prev;
      return { ...prev, selectedFillings: [...prev.selectedFillings, filling] };
    });
  };

  const toggleCookieFlavor = (flavor: string) => {
    setFormData(prev => {
      if (prev.selectedCookieFlavors.includes(flavor)) {
        return { ...prev, selectedCookieFlavors: prev.selectedCookieFlavors.filter(f => f !== flavor) };
      }
      if (prev.selectedCookieFlavors.length >= 4) return prev;
      return { ...prev, selectedCookieFlavors: [...prev.selectedCookieFlavors, flavor] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate pickup slot
      if (!formData.pickupSlot) {
        setError('Please select a pickup date and time');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/orders/tasting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          wedding_date: formData.weddingDate,
          tasting_type: formData.tastingType,
          cake_flavors: formData.selectedCakeFlavors,
          fillings: formData.selectedFillings,
          cookie_flavors: formData.selectedCookieFlavors,
          pickup_or_delivery: formData.pickupOrDelivery,
          delivery_location: formData.deliveryLocation || undefined,
          pickup_date: formData.pickupSlot.date,
          pickup_time: formData.pickupSlot.time,
        }),
      });

      const data = await response.json() as { checkoutUrl?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        router.push(data.checkoutUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
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
            <em>Tasting</em> Boxes
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
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
                Each cake tasting box includes individual cake samples with vanilla buttercream.
                Fillings come separately so you can mix and match to find your perfect combination.
              </p>
              <ul className="space-y-2 text-stone-600 text-sm mb-6">
                <li className="flex items-center">
                  <span className="text-[#541409] mr-2">✓</span>
                  4 cake flavors in 8oz jars
                </li>
                <li className="flex items-center">
                  <span className="text-[#541409] mr-2">✓</span>
                  4 fillings in separate 4oz containers
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
              <p className="text-2xl font-bold text-[#541409]">$70</p>
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
              <p className="text-2xl font-bold text-[#541409]">$30</p>
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

            {cancelled && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                Your payment was cancelled. You can try again below.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

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
                    className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] [&:not(:valid)]:text-[#541409]/50"
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
                  className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.tastingType ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                  value={formData.tastingType}
                  onChange={(e) => setFormData({ ...formData, tastingType: e.target.value })}
                >
                  <option value="" className="text-[#541409]/50">Select an option</option>
                  <option value="cake" className="text-[#541409]">Cake Tasting Box ($70)</option>
                  <option value="cookie" className="text-[#541409]">Cookie Tasting Box ($30)</option>
                  <option value="both" className="text-[#541409]">Both Boxes ($100)</option>
                </select>
              </div>

              {(formData.tastingType === 'cake' || formData.tastingType === 'both') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#541409] mb-2">
                      Cake Flavors <span className="text-[#541409]/60 font-normal">(select up to 4)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CAKE_FLAVORS.map((flavor) => {
                        const isSelected = formData.selectedCakeFlavors.includes(flavor.value);
                        const isDisabled = !isSelected && formData.selectedCakeFlavors.length >= 4;
                        return (
                          <label
                            key={flavor.value}
                            className={`flex items-center gap-2 p-3 border rounded-sm cursor-pointer transition-colors ${
                              isSelected
                                ? 'border-[#541409] bg-[#541409]/5'
                                : isDisabled
                                ? 'border-stone-200 bg-stone-50 cursor-not-allowed opacity-50'
                                : 'border-stone-300 hover:border-[#541409]/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={() => toggleCakeFlavor(flavor.value)}
                              className="w-4 h-4 text-[#541409] border-stone-300 rounded focus:ring-[#541409]"
                            />
                            <span className="text-sm text-[#541409]">{flavor.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-xs text-stone-500 mt-2">
                      {formData.selectedCakeFlavors.length}/4 selected
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#541409] mb-2">
                      Fillings <span className="text-[#541409]/60 font-normal">(select up to 4)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CAKE_FILLINGS.map((filling) => {
                        const isSelected = formData.selectedFillings.includes(filling.value);
                        const isDisabled = !isSelected && formData.selectedFillings.length >= 4;
                        return (
                          <label
                            key={filling.value}
                            className={`flex items-center gap-2 p-3 border rounded-sm cursor-pointer transition-colors ${
                              isSelected
                                ? 'border-[#541409] bg-[#541409]/5'
                                : isDisabled
                                ? 'border-stone-200 bg-stone-50 cursor-not-allowed opacity-50'
                                : 'border-stone-300 hover:border-[#541409]/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={() => toggleFilling(filling.value)}
                              className="w-4 h-4 text-[#541409] border-stone-300 rounded focus:ring-[#541409]"
                            />
                            <span className="text-sm text-[#541409]">{filling.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-xs text-stone-500 mt-2">
                      {formData.selectedFillings.length}/4 selected
                    </p>
                  </div>
                </>
              )}

              {(formData.tastingType === 'cookie' || formData.tastingType === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-[#541409] mb-2">
                    Cookie Flavors <span className="text-[#541409]/60 font-normal">(select up to 4)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COOKIE_FLAVORS.map((flavor) => {
                      const isSelected = formData.selectedCookieFlavors.includes(flavor.value);
                      const isDisabled = !isSelected && formData.selectedCookieFlavors.length >= 4;
                      return (
                        <label
                          key={flavor.value}
                          className={`flex items-center gap-2 p-3 border rounded-sm cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-[#541409] bg-[#541409]/5'
                              : isDisabled
                              ? 'border-stone-200 bg-stone-50 cursor-not-allowed opacity-50'
                              : 'border-stone-300 hover:border-[#541409]/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => toggleCookieFlavor(flavor.value)}
                            className="w-4 h-4 text-[#541409] border-stone-300 rounded focus:ring-[#541409]"
                          />
                          <span className="text-sm text-[#541409]">{flavor.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-stone-500 mt-2">
                    {formData.selectedCookieFlavors.length}/4 selected
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="pickupOrDelivery" className="block text-sm font-medium text-[#541409] mb-2">
                  Pickup or Delivery? <span className="text-red-500">*</span>
                </label>
                <select
                  id="pickupOrDelivery"
                  required
                  className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white text-[#541409]"
                  value={formData.pickupOrDelivery}
                  onChange={(e) => setFormData({ ...formData, pickupOrDelivery: e.target.value, pickupSlot: null })}
                >
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery (fee starting at $20, if available)</option>
                </select>
              </div>

              {formData.pickupOrDelivery === 'pickup' && (
                <TimeSlotPicker
                  orderType="tasting"
                  value={formData.pickupSlot ?? undefined}
                  onChange={(slot) => setFormData({ ...formData, pickupSlot: slot })}
                  label="Preferred Pickup Date & Time"
                  required
                />
              )}

              {formData.pickupOrDelivery === 'delivery' && (
                <>
                  <div>
                    <label htmlFor="deliveryLocation" className="block text-sm font-medium text-[#541409] mb-2">
                      Delivery Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="deliveryLocation"
                      required
                      placeholder="Full address for delivery"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.deliveryLocation}
                      onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                    />
                  </div>
                  <TimeSlotPicker
                    orderType="tasting"
                    value={formData.pickupSlot ?? undefined}
                    onChange={(slot) => setFormData({ ...formData, pickupSlot: slot })}
                    label="Preferred Delivery Date & Time"
                    required
                  />
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Continue to Payment'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default function TastingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#541409]"></div>
      </div>
    }>
      <TastingPageContent />
    </Suspense>
  );
}
