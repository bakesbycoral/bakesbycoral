import Link from 'next/link';

export default function PoliciesPage() {
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
          <h1 className="text-4xl sm:text-5xl font-serif text-[#541409] font-bold">
            Policies
          </h1>
          <p className="mt-4 text-lg text-[#541409]/80">
            Important information about ordering
          </p>
        </div>
      </section>

      {/* Policies Content */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="space-y-12">
            {/* Ordering */}
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-4">Ordering</h2>
              <ul className="space-y-3 text-stone-600">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>All orders must be placed through the order forms on this website.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Orders are confirmed once I've responded with availability and deposit is paid.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Please allow 24-48 hours for me to respond to order requests.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>I reserve the right to decline orders based on availability or complexity.</span>
                </li>
              </ul>
            </div>

            {/* Lead Times */}
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-4">Lead Times</h2>
              <ul className="space-y-3 text-stone-600">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span><strong>Cookies:</strong> Minimum 1 week notice required.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span><strong>Cakes:</strong> Minimum 2 weeks notice required.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span><strong>Wedding orders:</strong> Minimum 4-6 weeks notice recommended.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Rush orders may be accommodated for an additional fee if my schedule allows—please ask!</span>
                </li>
              </ul>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-4">Payment</h2>
              <ul className="space-y-3 text-stone-600">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>I accept credit cards, Venmo, PayPal, Apple Pay, and Cash App.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span><strong>Cookies:</strong> Full payment due at time of ordering. 50% is non-refundable.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span><strong>Cakes:</strong> 50% non-refundable deposit required to secure your date. Balance due 1 week before pickup.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span><strong>Wedding orders:</strong> 50% non-refundable deposit to book, balance due 1 month before pickup/delivery.</span>
                </li>
              </ul>
            </div>

            {/* Pickup */}
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-4">Pickup</h2>
              <ul className="space-y-3 text-stone-600">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>All orders are pickup only unless delivery is arranged for weddings or events.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Pickup times are firm—please arrive on time.</span>
                </li>
              </ul>

              <h3 className="text-lg font-medium text-[#541409] mt-6 mb-3 underline">Cookies:</h3>
              <ul className="space-y-3 text-stone-600">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Orders not picked up within 30 minutes may be rescheduled to my next available time.</span>
                </li>
              </ul>

              <h3 className="text-lg font-medium text-[#541409] mt-6 mb-3 underline">Cakes:</h3>
              <ul className="space-y-3 text-stone-600">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Orders not picked up within 30 minutes may experience changes (melting, softening, etc.) that I cannot be responsible for.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>No-shows forfeit full payment, and future orders will not be accepted.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Once the cake leaves my possession, I am not responsible for any damage.</span>
                </li>
              </ul>
            </div>

            {/* Cancellations */}
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-4">Cancellations & Refunds</h2>
              <ul className="space-y-3 text-stone-600">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Cancellations made <strong>more than 7 days</strong> before pickup: Deposit is non-refundable.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Cancellations made <strong>within 7 days</strong> of pickup: Full payment is non-refundable.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>No-shows or missed pickups: No refund will be issued.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>If I need to cancel due to emergency, you'll receive a full refund.</span>
                </li>
              </ul>
            </div>

            {/* Allergens */}
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-4">Allergens & Dietary</h2>
              <ul className="space-y-3 text-stone-600">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>All products are 100% gluten-free and celiac-friendly.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>My kitchen contains: dairy, eggs, tree nuts, peanuts, and soy.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Please disclose all allergies in your order form.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>I cannot guarantee products are free from trace allergens.</span>
                </li>
              </ul>
            </div>

            {/* SMS Messaging */}
            <div id="sms" className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-4">SMS Messaging Terms</h2>
              <ul className="space-y-3 text-stone-600">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>By providing your phone number when placing an order, you consent to receive transactional text messages from Bakes by Coral related to your order.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Messages may include order confirmations, pickup/delivery reminders, quote notifications, and balance due payment links.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Message frequency varies based on your order activity. Typically 1-5 messages per order.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Message and data rates may apply depending on your mobile carrier and plan.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Reply <strong>STOP</strong> to any message to opt out of future text messages. Reply <strong>HELP</strong> for assistance.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Opting out of SMS will not affect your order. You will still receive email communications.</span>
                </li>
              </ul>
            </div>

            {/* Privacy Policy */}
            <div id="privacy" className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-4">Privacy Policy</h2>
              <div className="space-y-4 text-stone-600">
                <div>
                  <h3 className="font-medium text-[#541409] mb-2">Information I Collect</h3>
                  <p>When you place an order or contact me, I collect your name, email address, phone number, and order details. I may also collect your mailing address if delivery is arranged.</p>
                </div>
                <div>
                  <h3 className="font-medium text-[#541409] mb-2">How I Use Your Information</h3>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-[#541409] mr-3">•</span>
                      <span>To process and fulfill your orders</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#541409] mr-3">•</span>
                      <span>To communicate with you about your order via email and text message</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#541409] mr-3">•</span>
                      <span>To send pickup/delivery reminders</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#541409] mr-3">•</span>
                      <span>To send invoices and payment links</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-[#541409] mb-2">Sharing Your Information</h3>
                  <p>I do not sell, trade, or share your personal information with third parties. Your information is only shared with payment processors (Stripe) and communication services (email and SMS providers) as needed to fulfill your order.</p>
                </div>
                <div>
                  <h3 className="font-medium text-[#541409] mb-2">Data Security</h3>
                  <p>I take reasonable measures to protect your personal information. Payment information is processed securely through Stripe and is never stored on my systems.</p>
                </div>
                <div>
                  <h3 className="font-medium text-[#541409] mb-2">Your Rights</h3>
                  <p>You may request to view, update, or delete your personal information at any time by contacting me at <a href="mailto:hello@bakesbycoral.com" className="text-[#541409] underline">hello@bakesbycoral.com</a>.</p>
                </div>
                <div>
                  <h3 className="font-medium text-[#541409] mb-2">Updates</h3>
                  <p>This privacy policy may be updated from time to time. Any changes will be reflected on this page.</p>
                </div>
              </div>
            </div>

            {/* Terms of Service */}
            <div id="terms" className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-4">Terms of Service</h2>
              <div className="space-y-4 text-stone-600">
                <p>By placing an order with Bakes by Coral, you agree to the following terms along with all policies listed on this page.</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#541409] mr-3">•</span>
                    <span>All orders are subject to the ordering, payment, pickup, and cancellation policies above.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#541409] mr-3">•</span>
                    <span>Bakes by Coral is a home-based bakery. Products are made in a home kitchen that is not inspected by a regulatory authority.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#541409] mr-3">•</span>
                    <span>While all products are gluten-free, they are prepared in a kitchen that handles common allergens. I cannot guarantee products are free from trace allergens.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#541409] mr-3">•</span>
                    <span>Custom designs are based on my artistic interpretation. Final products may vary slightly from reference images.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#541409] mr-3">•</span>
                    <span>By providing your phone number, you consent to receive transactional SMS messages related to your order. See the SMS Messaging Terms above for details.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#541409] mr-3">•</span>
                    <span>I reserve the right to refuse service or cancel orders at my discretion.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section
        className="py-16 sm:py-24"
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
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] mb-4">
            Questions About Policies?
          </h2>
          <p className="text-lg text-[#541409]/80 mb-8">
            Feel free to reach out if you need any clarification.
          </p>
          <Link
            href="/contact"
            className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
          >
            Contact Me
          </Link>
        </div>
      </section>
    </>
  );
}
