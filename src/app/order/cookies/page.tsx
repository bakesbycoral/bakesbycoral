'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { TimeSlotPicker, CouponInput } from '@/components/forms';
import { CartProvider, useCart, CartSidebar, FlavorCard } from '@/components/cart';
import { FLAVORS, PRICE_PER_DOZEN, HEAT_SEAL_FEE } from '@/types/cart';

function CookieOrderContent() {
  const { dozens, flavors, packaging, clearCart, isComplete } = useCart();
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
        window.location.href = '/order/success?type=cookies';
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate order total for display
  const subtotal = dozens ? dozens * PRICE_PER_DOZEN : 0;
  const packagingFee = packaging === 'heat-sealed' && dozens ? dozens * HEAT_SEAL_FEE : 0;
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
              $30 per dozen | Up to 3 dozen | Mix & match flavors in half-dozens!
            </p>
            <p className="text-sm text-[#541409]/70 mt-1">
              For 4+ dozen, please use the <Link href="/order/cookies-large" className="underline hover:opacity-70">large order form</Link>.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Flavor Cards */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-serif text-[#541409] mb-6">Choose Your Flavors</h2>
              <p className="text-sm text-stone-600 mb-6">
                Select how many dozen in the sidebar, then use +/- to add cookies in half-dozen (6) increments.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {FLAVORS.map((flavor) => (
                  <FlavorCard key={flavor.key} flavorKey={flavor.key} label={flavor.label} />
                ))}
              </div>
            </div>

            {/* Cart Sidebar */}
            <div className="lg:col-span-1">
              <CartSidebar onCheckout={handleCheckoutClick} />
            </div>
          </div>

          {/* Checkout Form - Only shown when order is complete */}
          {isComplete && (
            <div ref={checkoutFormRef} className="mt-12 pt-12 border-t border-[#EAD6D6]">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-serif text-[#541409] mb-6 text-center">Complete Your Order</h2>

                <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
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
                      <ul className="space-y-1 text-sm text-[#541409]">
                        {flavors.map((f) => (
                          <li key={f.flavor} className="flex justify-between">
                            <span>{f.label}</span>
                            <span>{f.quantity} cookies</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 pt-2 border-t border-[#EAD6D6] text-sm flex justify-between text-[#541409]">
                        <span>{dozens} dozen cookies</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      {packagingFee > 0 && (
                        <div className="text-sm flex justify-between text-[#541409]">
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
                            I understand that cookie orders require at least <strong>1 week notice</strong>. <span className="text-red-500">*</span>
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
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/cookies" className="text-[#541409] hover:opacity-70 transition-opacity">
              &larr; Back to Cookie Info
            </Link>
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
