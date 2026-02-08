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
            #541409 0px,
            #541409 40px,
            #EAD6D6 40px,
            #EAD6D6 80px
          )`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif text-white font-bold drop-shadow-lg">
            Policies
          </h1>
          <p className="mt-4 text-lg text-white/90 drop-shadow">
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
                  <span>Orders are confirmed once I've responded with availability and you've agreed to the quote.</span>
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
                  <span>Rush orders may be accommodated if my schedule allows—please ask!</span>
                </li>
              </ul>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-4">Payment</h2>
              <ul className="space-y-3 text-stone-600">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>I accept Venmo, PayPal, and cash.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span><strong>Cookies:</strong> Full payment due at time of ordering.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span><strong>Cakes:</strong> 50% deposit required to secure your date. Balance due at pickup.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span><strong>Wedding orders:</strong> 50% deposit to book, balance due 2 weeks before pickup.</span>
                </li>
              </ul>
            </div>

            {/* Pickup */}
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-4">Pickup</h2>
              <ul className="space-y-3 text-stone-600">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>All orders are pickup only from my home kitchen in Cincinnati, Ohio.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Address will be provided once your order is confirmed.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Pickup times are scheduled when we confirm your order.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Please be on time! I prepare your order fresh and have it ready for you.</span>
                </li>
              </ul>
            </div>

            {/* Cancellations */}
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-serif text-[#541409] mb-4">Cancellations & Refunds</h2>
              <ul className="space-y-3 text-stone-600">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Cancellations made <strong>more than 7 days</strong> before pickup: Full refund.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-3">•</span>
                  <span>Cancellations made <strong>within 7 days</strong> of pickup: Deposit is non-refundable.</span>
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
                  <span>All products are 100% gluten-free, made in a dedicated gluten-free kitchen.</span>
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
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] mb-4">
            Questions About Policies?
          </h2>
          <p className="text-lg text-stone-700 mb-8">
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
