'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TimeSlotPicker, CouponInput } from '@/components/forms';

export default function CakeOrderPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupSlot: null as { date: string; time: string } | null,
    eventType: '',
    cakeSize: '',
    cakeShape: '',
    cakeFlavor: '',
    filling: '',
    baseColor: '',
    pipingColors: '',
    customMessaging: '',
    messageStyle: '',
    toppings: [] as string[],
    inspirationFiles: [] as File[],
    allergies: '',
    message: '',
    howDidYouHear: '',
    acknowledgeDeposit: false,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (formData.inspirationFiles.length === 0) {
      setSubmitError('Please upload at least one inspiration image.');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('pickup_date', formData.pickupSlot?.date || '');
      submitData.append('pickup_time', formData.pickupSlot?.time || '');
      submitData.append('event_type', formData.eventType);
      submitData.append('cake_size', formData.cakeSize);
      submitData.append('cake_shape', formData.cakeShape);
      submitData.append('cake_flavor', formData.cakeFlavor);
      submitData.append('filling', formData.filling);
      submitData.append('base_color', formData.baseColor);
      submitData.append('piping_colors', formData.pipingColors);
      submitData.append('custom_messaging', formData.customMessaging);
      submitData.append('message_style', formData.messageStyle);
      submitData.append('toppings', JSON.stringify(formData.toppings));
      submitData.append('allergies', formData.allergies);
      submitData.append('notes', formData.message);
      submitData.append('how_did_you_hear', formData.howDidYouHear);
      submitData.append('acknowledge_deposit', String(formData.acknowledgeDeposit));
      submitData.append('acknowledge_allergens', String(formData.acknowledgeAllergens));
      submitData.append('acknowledge_lead_time', String(formData.acknowledgeLeadTime));
      if (appliedCoupon) {
        submitData.append('coupon_code', appliedCoupon.code);
      }

      // Append inspiration images
      formData.inspirationFiles.forEach((file) => {
        submitData.append('inspiration_images', file);
      });

      const response = await fetch('/api/orders/cake', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
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
            <em>Custom Cake</em> Inquiry Form
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            Tell me about your dream cake
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Info */}
          <div className="bg-[#EAD6D6] rounded-lg p-6 mb-8">
            <p className="text-[#541409] text-sm font-medium">
              Rush orders may be available for an additional fee—just ask!
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
                    <option value="baby-shower">Baby Shower</option>
                    <option value="bridal-shower">Bridal Shower</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="graduation">Graduation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Cake Details */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Cake Details</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cakeSize" className="block text-sm font-medium text-[#541409] mb-2">
                      Cake Size <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="cakeSize"
                      required
                      className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.cakeSize ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                      value={formData.cakeSize}
                      onChange={(e) => {
                        const newSize = e.target.value;
                        // If switching to 10-inch and heart was selected, reset shape
                        if (newSize === '10-inch' && formData.cakeShape === 'heart') {
                          setFormData({ ...formData, cakeSize: newSize, cakeShape: '' });
                        } else {
                          setFormData({ ...formData, cakeSize: newSize });
                        }
                      }}
                    >
                      <option value="">Select an option</option>
                      <option value="4-inch">4" (serves 2-4) - Starting at $60</option>
                      <option value="6-inch">6" (serves 6-12) - Starting at $100</option>
                      <option value="8-inch">8" (serves 14-20) - Starting at $140</option>
                      <option value="10-inch">10" (serves 24-30) - Starting at $180</option>
                      <option value="unsure">Not sure - need guidance</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cakeShape" className="block text-sm font-medium text-[#541409] mb-2">
                      Cake Shape <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="cakeShape"
                      required
                      className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.cakeShape ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                      value={formData.cakeShape}
                      onChange={(e) => setFormData({ ...formData, cakeShape: e.target.value })}
                    >
                      <option value="">Select an option</option>
                      <option value="round">Round</option>
                      {formData.cakeSize !== '10-inch' && <option value="heart">Heart</option>}
                    </select>
                  </div>

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
                      <option value="vanilla-bean">Vanilla Bean</option>
                      <option value="chocolate">Chocolate</option>
                      <option value="confetti">Confetti</option>
                      <option value="red-velvet">Red Velvet</option>
                      <option value="lemon">Lemon</option>
                      <option value="vanilla-latte">Vanilla Latte (+$5)</option>
                      <option value="marble">Marble (vanilla & chocolate)</option>
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
                      <option value="chocolate-ganache">Chocolate Ganache (+$10)</option>
                      <option value="cookies-and-cream">Cookies & Cream (+$5)</option>
                      <option value="vanilla-bean-ganache">Vanilla Bean Ganache (+$10)</option>
                      <option value="fresh-strawberries">Fresh Strawberries (+$8)</option>
                      <option value="lemon-curd">Lemon Curd (+$5)</option>
                      <option value="raspberry">Raspberry (+$8)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Design */}
              <div>
                <h2 className="text-xl font-serif text-[#541409] mb-4">Design</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="baseColor" className="block text-sm font-medium text-[#541409] mb-2">
                      Base Color <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="baseColor"
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.baseColor}
                      onChange={(e) => setFormData({ ...formData, baseColor: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="pipingColors" className="block text-sm font-medium text-[#541409] mb-2">
                      Piping Color(s) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="pipingColors"
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.pipingColors}
                      onChange={(e) => setFormData({ ...formData, pipingColors: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="customMessaging" className="block text-sm font-medium text-[#541409] mb-2">
                      What would you like your custom messaging to say? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="customMessaging"
                      required
                      placeholder="If no messaging, type N/A"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.customMessaging}
                      onChange={(e) => setFormData({ ...formData, customMessaging: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="messageStyle" className="block text-sm font-medium text-[#541409] mb-2">
                      How would you like your message to be written? <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="messageStyle"
                      required
                      className={`w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent bg-white ${formData.messageStyle ? 'text-[#541409]' : 'text-[#541409]/50'}`}
                      value={formData.messageStyle}
                      onChange={(e) => setFormData({ ...formData, messageStyle: e.target.value })}
                    >
                      <option value="">Select an option</option>
                      <option value="piped">Piped</option>
                      <option value="piped-cursive">Piped Cursive</option>
                      <option value="block">Block</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#541409] mb-2">
                      Toppings
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'light-beading', label: 'Light Beading (+$8)' },
                        { value: 'moderate-beading', label: 'Moderate Beading (+$15)' },
                        { value: 'heavy-beading', label: 'Heavy Beading (+$20)' },
                        { value: 'ribbon-bows', label: 'Ribbon Bows (+$8)' },
                        { value: 'cherries', label: 'Cherries (+$8)' },
                        { value: 'glitter-cherries', label: 'Glitter Cherries (+$15)' },
                        { value: 'disco-balls', label: 'Disco Balls (+$10)' },
                        { value: 'balloons', label: 'Balloons (+$10)' },
                        { value: 'fresh-florals', label: 'Fresh Florals (starting at +$15)' },
                        { value: 'faux-florals', label: 'Faux Florals (starting at +$15)' },
                        { value: 'edible-image', label: 'Edible Image (starting at +$10)' },
                        { value: 'other', label: 'Other (starting at +$8)' },
                      ].map((topping) => (
                        <label key={topping.value} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.toppings.includes(topping.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, toppings: [...formData.toppings, topping.value] });
                              } else {
                                setFormData({ ...formData, toppings: formData.toppings.filter(t => t !== topping.value) });
                              }
                            }}
                            className="w-5 h-5 rounded border-stone-300 accent-[#541409] focus:ring-[#541409]"
                          />
                          <span className="ml-3 text-sm text-stone-700">{topping.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#541409] mb-2">
                      Inspiration Images <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-stone-500 mb-2">Upload up to 10 images for inspiration</p>
                    <input
                      type="file"
                      id="inspirationFiles"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const totalFiles = formData.inspirationFiles.length + files.length;
                        if (totalFiles > 10) {
                          alert('You can upload a maximum of 10 images');
                          return;
                        }
                        setFormData({ ...formData, inspirationFiles: [...formData.inspirationFiles, ...files] });
                        e.target.value = '';
                      }}
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent text-[#541409] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-[#541409] file:text-[#EAD6D6] file:cursor-pointer"
                      disabled={formData.inspirationFiles.length >= 10}
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
                      {formData.inspirationFiles.length}/10 images uploaded
                    </p>
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
                    <label htmlFor="message" className="block text-sm font-medium text-[#541409] mb-2">
                      Special Requests & Anything Else I Need to Know
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      placeholder="Be specific! Color scheme, theme, inspo, certain details, etc"
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#541409] focus:border-transparent resize-none text-[#541409] placeholder:text-[#541409]/50"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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

              {/* Coupon Code */}
              <CouponInput
                orderType="cake"
                onCouponApplied={setAppliedCoupon}
                appliedCoupon={appliedCoupon}
              />

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
