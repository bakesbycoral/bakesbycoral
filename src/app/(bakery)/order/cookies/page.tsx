'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { TimeSlotPicker, CouponInput } from '@/components/forms';
import { CartProvider, useCart, CartSidebar, FlavorCard } from '@/components/cart';
import { FLAVORS, SEASONAL_FLAVORS, PRICE_PER_DOZEN, SPRING_BOX_PRICE, HEAT_SEAL_FEE, SPRING_BOX_FLAVORS } from '@/types/cart';

function CookieOrderContent() {
  const isSeasonalLive = false;
  const { springBox, dozens, flavors, packaging, clearCart, isComplete, setSpringBox, setDozens, setPackaging, totalCookies, targetCookies, remainingCookies, maxBuildYourOwnDozens } = useCart();
  const checkoutFormRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupSlot: null as { date: string; time: string } | null,
    allergies: '',
    howDidYouHear: '',
    message: '',
    acknowledgePayment: false,
    acknowledgeAllergens: false,
    acknowledgeLeadTime: false,
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

  const handleCheckoutClick = () => {
    checkoutFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isComplete) {
      setSubmitError('Please complete your cookie selection first.');
      return;
    }

    if (!formData.pickupSlot) {
      setSubmitError('Please select a pickup date and time.');
      return;
    }

    setSubmitting(true);
    try {
      // Convert flavors to cart_items format for API
      const cartItems = flavors.flatMap((f) => {
        const items = [];
        // Each 6 cookies is a half-dozen entry
        for (let i = 0; i < f.quantity; i += 6) {
          items.push({ flavor: f.flavor });
        }
        return items;
      });

      const response = await fetch('/api/orders/cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          pickup_date: formData.pickupSlot.date,
          pickup_time: formData.pickupSlot.time,
          spring_box: springBox,
          cart_items: cartItems,
          packaging: packaging,
          allergies: formData.allergies,
          how_did_you_hear: formData.howDidYouHear,
          notes: formData.message,
          acknowledge_payment: formData.acknowledgePayment,
          acknowledge_allergy: formData.acknowledgeAllergens,
          acknowledge_pickup: formData.acknowledgeLeadTime,
          coupon_code: appliedCoupon?.code || null,
        }),
      });

      const data = await response.json() as { error?: string; checkoutUrl?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      // Clear cart on successful submission
      clearCart();

      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate order total for display
  const springBoxTotal = springBox ? SPRING_BOX_PRICE : 0;
  const buildYourOwnTotal = dozens ? dozens * PRICE_PER_DOZEN : 0;
  const subtotal = springBoxTotal + buildYourOwnTotal;
  const totalDozensForPackaging = (springBox ? 1 : 0) + (dozens || 0);
  const packagingFee = packaging === 'heat-sealed' && totalDozensForPackaging > 0 ? totalDozensForPackaging * HEAT_SEAL_FEE : 0;
  const total = subtotal + packagingFee;
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

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
            <em>Cookie</em> Order Form
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            Soft, chewy, gluten-free goodness
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Pricing Info */}
          <div className="bg-[#EAD6D6] rounded-lg p-6 mb-8 text-center">
            <p className="text-[#541409] font-medium">
              Up to 3 dozen | Mix & match flavors in half-dozens!
            </p>
            <p className="text-sm text-[#541409]/70 mt-1">
              For 4+ dozen, please use the <Link href="/order/cookies-large" className="underline hover:opacity-70">large order form</Link>.
            </p>
          </div>

          {/* Single Card Order Flow */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-[#EAD6D6] p-4 sm:p-6">
              {/* Step 1: Choose What You'd Like */}
              <div className="mb-6">
                <h2 className="text-lg font-serif text-[#541409] mb-3">1. What would you like?</h2>
                <p className="text-xs text-stone-600 mb-3">Select one or both!</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Spring Cookie Box Card */}
                  {isSeasonalLive && (
                    <button
                      onClick={() => setSpringBox(!springBox)}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        springBox
                          ? 'border-[#541409] bg-[#541409]/5 ring-1 ring-[#541409]'
                          : 'border-[#EAD6D6] hover:border-[#541409]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 bg-[#541409] text-[#EAD6D6] rounded text-[10px] font-medium">SEASONAL</span>
                        <span className="text-lg font-medium text-[#541409]">$35</span>
                      </div>
                      <h3 className="text-base font-serif text-[#541409] mt-2">Spring Cookie Box</h3>
                      <p className="text-xs text-[#541409]/70 mt-1">
                        A curated box of all 4 spring flavors — 3 of each (12 pieces)
                      </p>
                      <ul className="mt-2 text-xs text-[#541409]/60 space-y-0.5">
                        {SPRING_BOX_FLAVORS.map((f) => (
                          <li key={f.key}>{f.label} ({f.quantity})</li>
                        ))}
                      </ul>
                    </button>
                  )}

                  {/* Build Your Own Card */}
                  <button
                    onClick={() => {
                      if (dozens) {
                        // Toggling off: clear BYO selection
                        setDozens(null);
                      } else {
                        // Toggling on: default to 1 dozen
                        setDozens(1);
                      }
                    }}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      dozens !== null
                        ? 'border-[#541409] bg-[#541409]/5 ring-1 ring-[#541409]'
                        : 'border-[#EAD6D6] hover:border-[#541409]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 bg-[#EAD6D6] text-[#541409] rounded text-[10px] font-medium">CLASSIC</span>
                      <span className="text-lg font-medium text-[#541409]">$30<span className="text-xs font-normal">/dozen</span></span>
                    </div>
                    <h3 className="text-base font-serif text-[#541409] mt-2">Build Your Own</h3>
                    <p className="text-xs text-[#541409]/70 mt-1">
                      Mix & match from all flavors — pick your favorites in half-dozen increments
                    </p>
                  </button>
                </div>
              </div>

              {/* Build Your Own: Dozen Selection & Flavors */}
              {dozens !== null && (
                <>
                  <div className="mb-6 pt-6 border-t border-[#EAD6D6]">
                    <h2 className="text-lg font-serif text-[#541409] mb-3">2. How many dozen?</h2>
                    <div className="grid grid-cols-3 gap-2">
                      {([1, 2, 3] as const).filter((num) => num <= maxBuildYourOwnDozens).map((num) => (
                        <button
                          key={num}
                          onClick={() => setDozens(num)}
                          className={`py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                            dozens === num
                              ? 'bg-[#541409] text-[#EAD6D6]'
                              : 'border border-[#541409] text-[#541409] hover:bg-[#EAD6D6]'
                          }`}
                        >
                          {num} dozen
                        </button>
                      ))}
                    </div>
                    {springBox && (
                      <p className="text-xs text-[#541409]/60 mt-2">
                        Up to {maxBuildYourOwnDozens} dozen (Spring Box counts as 1 dozen)
                      </p>
                    )}
                  </div>

                  {/* Choose Flavors */}
                  <div className="mb-6 pt-6 border-t border-[#EAD6D6]">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-serif text-[#541409]">{springBox ? '3' : '2'}. Choose your flavors</h2>
                      <span className="text-sm text-[#541409]/70">
                        {totalCookies} / {targetCookies} cookies
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#EAD6D6] rounded-full h-2 mb-4">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          totalCookies === targetCookies ? 'bg-green-500' : 'bg-[#541409]'
                        }`}
                        style={{ width: `${Math.min((totalCookies / targetCookies) * 100, 100)}%` }}
                      />
                    </div>

                    <p className="text-xs text-stone-600 mb-4">
                      Add cookies in half-dozen (6) increments
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {FLAVORS.map((flavor) => (
                        <FlavorCard key={flavor.key} flavorKey={flavor.key} label={flavor.label} />
                      ))}
                    </div>

                    {/* Seasonal Flavors - only shows after March 2nd, 2026 */}
                    {isSeasonalLive && (
                      <div className="mt-6 pt-4 border-t border-[#EAD6D6]">
                        <p className="text-xs font-medium text-[#541409] mb-3 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#541409] text-[#EAD6D6] rounded text-[10px]">SEASONAL</span>
                          Limited Time Flavors
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {SEASONAL_FLAVORS.map((flavor) => (
                            <FlavorCard key={flavor.key} flavorKey={flavor.key} label={flavor.label} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Packaging - show when at least one option is selected */}
              {(springBox || dozens !== null) && (
                <>
                  {/* Packaging */}
                  <div className="pt-6 border-t border-[#EAD6D6]">
                    <h2 className="text-lg font-serif text-[#541409] mb-3">
                      {dozens !== null ? (springBox ? '4' : '3') : '2'}. Packaging
                    </h2>
                    <div className="space-y-2">
                      <label className="flex items-center cursor-pointer p-3 border border-[#EAD6D6] rounded hover:bg-[#EAD6D6]/10 transition-colors">
                        <input
                          type="radio"
                          name="packaging"
                          value="standard"
                          checked={packaging === 'standard'}
                          onChange={() => setPackaging('standard')}
                          className="w-4 h-4 accent-[#541409]"
                        />
                        <span className="ml-3 text-sm text-[#541409]">Standard packaging</span>
                      </label>
                      <label className="flex items-center cursor-pointer p-3 border border-[#EAD6D6] rounded hover:bg-[#EAD6D6]/10 transition-colors">
                        <input
                          type="radio"
                          name="packaging"
                          value="heat-sealed"
                          checked={packaging === 'heat-sealed'}
                          onChange={() => setPackaging('heat-sealed')}
                          className="w-4 h-4 accent-[#541409]"
                        />
                        <span className="ml-3 text-sm text-[#541409]">
                          Heat-sealed bags (+$5/dozen) — keeps cookies fresh longer
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Step 4: Your Information - Only shown when flavors are complete */}
                  {isComplete && (
                    <div ref={checkoutFormRef} className="pt-6 border-t border-[#EAD6D6]">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contact Info */}
                    <div>
                      <h3 className="text-xl font-serif text-[#541409] mb-4">Your Information</h3>
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
                      </div>
                    </div>

                    {/* Pickup Date & Time */}
                    <div>
                      <TimeSlotPicker
                        orderType="cookies"
                        value={formData.pickupSlot ?? undefined}
                        onChange={(slot) => setFormData({ ...formData, pickupSlot: slot })}
                        label="Preferred Pickup Date & Time"
                        required
                      />
                    </div>

                    {/* Additional Info */}
                    <div>
                      <h3 className="text-xl font-serif text-[#541409] mb-4">Additional Information</h3>
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
                            Notes or Questions
                          </label>
                          <textarea
                            id="message"
                            rows={3}
                            placeholder="Anything else I should know?"
                            className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409] placeholder:text-[#541409]/50"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Coupon Code */}
                    <CouponInput
                      orderType="cookies"
                      onCouponApplied={setAppliedCoupon}
                      appliedCoupon={appliedCoupon}
                    />

                    {/* Order Summary */}
                    <div className="bg-[#EAD6D6]/30 rounded-lg p-4">
                      <h3 className="text-lg font-serif text-[#541409] mb-3">Order Summary</h3>

                      {springBox && (
                        <>
                          <div className="text-sm flex justify-between text-[#541409] font-medium">
                            <span>Spring Cookie Box (12 pieces)</span>
                            <span>{formatPrice(SPRING_BOX_PRICE)}</span>
                          </div>
                          <ul className="ml-2 space-y-0.5 text-xs text-[#541409]/70 mb-2">
                            {SPRING_BOX_FLAVORS.map((f) => (
                              <li key={f.key}>{f.label} ({f.quantity})</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {dozens !== null && flavors.length > 0 && (
                        <>
                          {springBox && (
                            <div className="text-sm font-medium text-[#541409] mt-2 mb-1">Build Your Own</div>
                          )}
                          <ul className="space-y-1 text-sm text-[#541409]">
                            {flavors.map((f) => (
                              <li key={f.flavor} className="flex justify-between">
                                <span>{f.label}</span>
                                <span>{f.quantity} cookies</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-1 text-sm flex justify-between text-[#541409]">
                            <span>{dozens} dozen cookies</span>
                            <span>{formatPrice(buildYourOwnTotal)}</span>
                          </div>
                        </>
                      )}

                      {packagingFee > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#EAD6D6] text-sm flex justify-between text-[#541409]">
                          <span>Heat-sealed packaging</span>
                          <span>{formatPrice(packagingFee)}</span>
                        </div>
                      )}
                      <div className="mt-2 pt-2 border-t border-[#EAD6D6] font-medium flex justify-between text-[#541409]">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>

                    {/* Acknowledgements */}
                    <div>
                      <h3 className="text-xl font-serif text-[#541409] mb-4">Policies & Acknowledgements</h3>
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
                            I understand that cookie orders require at least <strong>4 days notice</strong>. <span className="text-red-500">*</span>
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
                      {submitting ? 'Processing...' : 'Proceed to Payment'}
                    </button>

                    <p className="text-sm text-stone-500 text-center">
                      You&apos;ll be redirected to Stripe to complete your payment securely.
                    </p>
                  </form>
                </div>
              )}
            </>
          )}
            </div>

            <div className="mt-8 text-center">
              <Link href="/cookies" className="text-[#541409] hover:opacity-70 transition-opacity">
                &larr; Back to Cookie Info
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function CookieOrderPage() {
  return (
    <CartProvider>
      <CookieOrderContent />
    </CartProvider>
  );
}
