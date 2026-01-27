import Link from 'next/link';

export default function MenuPage() {
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
            Menu
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            Handcrafted gluten-free treats made with love
          </p>
        </div>
      </section>

      {/* Custom Cakes Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-[#EAD6D6] text-[#541409] text-sm font-medium rounded-full mb-4">
                Celebration Cakes
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] mb-6">
                Custom Cakes
              </h2>
              <p className="text-stone-600 leading-relaxed mb-6">
                Beautiful 3-layer cakes perfect for birthdays, showers, and any celebration.
                Each cake is made to order with your choice of flavors, fillings, and design.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                  <span className="font-medium text-[#541409]">4" Heart or Round (serves 2-4)</span>
                  <span className="text-stone-600">Starting at $60</span>
                </div>
                <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                  <span className="font-medium text-[#541409]">6" Heart or Round (serves 6-12)</span>
                  <span className="text-stone-600">Starting at $100</span>
                </div>
                <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                  <span className="font-medium text-[#541409]">8" Heart or Round (serves 14-20)</span>
                  <span className="text-stone-600">Starting at $140</span>
                </div>
                <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                  <span className="font-medium text-[#541409]">10" Round (serves 24-30)</span>
                  <span className="text-stone-600">Starting at $180</span>
                </div>
              </div>

              <Link
                href="/cakes"
                className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
              >
                View Cake Details
              </Link>
            </div>

            <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
              <img
                src="/25th-cake.jpg"
                alt="Custom Cake"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cookies Section */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 aspect-square rounded-lg overflow-hidden shadow-lg">
              <img
                src="/cherry.jpg"
                alt="Cookies"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="order-1 lg:order-2">
              <span className="inline-block px-4 py-1.5 bg-[#541409] text-[#EAD6D6] text-sm font-medium rounded-full mb-4">
                Fresh Baked
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] mb-6">
                Cookies
              </h2>
              <p className="text-stone-700 leading-relaxed mb-6">
                Soft, chewy cookies in delicious flavors. Perfect for gifts, events,
                or treating yourself. Available by the dozen.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-[#541409]/20 pb-2">
                  <span className="font-medium text-[#541409]">Per Dozen</span>
                  <span className="text-stone-700">$30</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#541409]/20 pb-2">
                  <span className="font-medium text-[#541409]">10+ Dozen</span>
                  <span className="text-stone-700">5% off!</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/cookies"
                  className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
                >
                  View Cookie Flavors
                </Link>
                <Link
                  href="/order/cookies-large"
                  className="inline-flex px-8 py-4 bg-transparent border-2 border-[#541409] text-[#541409] font-medium rounded-sm hover:bg-[#541409]/10 transition-colors"
                >
                  Large Cookie Order Form
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
          <h2 className="text-3xl sm:text-4xl font-serif text-[#4A2C21] mb-4">
            Ready to Order?
          </h2>
          <p className="text-lg text-[#4A2C21]/80 mb-8">
            Fill out an order form and I'll get back to you within 24-48 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/order/cake"
              className="w-full sm:w-auto px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity text-center"
            >
              Order a Cake
            </Link>
            <Link
              href="/order/cookies"
              className="w-full sm:w-auto px-8 py-4 bg-[#EAD6D6] text-[#541409] font-medium rounded-sm border border-[#541409] hover:opacity-80 transition-opacity text-center"
            >
              Order Cookies
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
