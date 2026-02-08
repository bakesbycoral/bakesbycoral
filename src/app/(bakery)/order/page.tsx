import Link from 'next/link';

export default function OrderPage() {
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
            Place an Order
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            Choose what you'd like to order
          </p>
        </div>
      </section>

      {/* Order Options */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cake Order */}
            <Link
              href="/order/cake"
              className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="/miles-cake.jpg"
                  alt="Custom Cake"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-serif text-[#541409] mb-2">Custom Cakes</h2>
                <p className="text-stone-600 mb-4">
                  3-layer celebration cakes for birthdays, showers, and special occasions.
                </p>
                <span className="inline-flex items-center text-[#541409] font-medium group-hover:opacity-70 transition-opacity">
                  Start Cake Order
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Cookie Order */}
            <Link
              href="/order/cookies"
              className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="/choco-chip.jpg"
                  alt="Cookies"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-serif text-[#541409] mb-2">Cookies</h2>
                <p className="text-stone-600 mb-4">
                  Soft, chewy cookies by the dozen. Perfect for any occasion.
                </p>
                <span className="inline-flex items-center text-[#541409] font-medium group-hover:opacity-70 transition-opacity">
                  Start Cookie Order
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Cookie Cups Order */}
            <Link
              href="/cookie-cups"
              className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="/cookie-cups.jpg"
                  alt="Cookie Cups"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-serif text-[#541409] mb-2">Cookie Cups</h2>
                <p className="text-stone-600 mb-4">
                  Mini chocolate chip cookie cups with vanilla buttercream.
                </p>
                <span className="inline-flex items-center text-[#541409] font-medium group-hover:opacity-70 transition-opacity">
                  Start Cookie Cups Order
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>

          {/* Large Orders */}
          <div className="mt-12 bg-[#EAD6D6] rounded-lg p-8 text-center">
            <h3 className="text-2xl font-serif text-[#541409] mb-4">Planning a Large Event?</h3>
            <p className="text-stone-700 mb-6">
              For orders of 4+ dozen cookies, fill out the large order form.
            </p>
            <Link
              href="/order/cookies-large"
              className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
            >
              Large Cookie Orders
            </Link>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-12">
            What to Expect
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#541409] text-[#EAD6D6] rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="font-medium text-[#541409] mb-2">Submit Your Request</h3>
              <p className="text-sm text-stone-600">
                Fill out the order form with your details and preferences
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#541409] text-[#EAD6D6] rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="font-medium text-[#541409] mb-2">Get a Quote</h3>
              <p className="text-sm text-stone-600">
                I'll respond within 24-48 hours with pricing and availability
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#541409] text-[#EAD6D6] rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="font-medium text-[#541409] mb-2">Confirm & Pay</h3>
              <p className="text-sm text-stone-600">
                Secure your order with payment and schedule pickup
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
