import Link from 'next/link';

export default function CakesPage() {
  const cakeFlavors = [
    'Vanilla Bean',
    'Chocolate',
    'Confetti',
    'Red Velvet',
    'Lemon',
    'Vanilla Latte',
  ];

  const fillings = [
    'Vanilla Buttercream',
    'Cookies & Cream',
    'Vanilla Bean Ganache',
    'Fresh Strawberries',
    'Lemon Curd',
    'Raspberry',
  ];

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
            Custom Cakes
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            Beautiful celebration cakes made just for you
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-lg text-stone-600 leading-relaxed">
            Every cake is a 3-layer masterpiece, baked fresh and decorated with care.
            Choose your size, flavor, filling, and let me know your design vision.
            I'll work with you to create something beautiful for your celebration.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-12">
            Sizes & Pricing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <h3 className="text-xl font-serif text-[#541409] mb-2">4" Heart or Round</h3>
              <p className="text-2xl font-bold text-[#541409] mb-2">Starting at $50</p>
              <p className="text-sm text-stone-600">Serves 2-4</p>
              <p className="text-xs text-stone-500 mt-2">Perfect for date nights</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <h3 className="text-xl font-serif text-[#541409] mb-2">6" Heart or Round</h3>
              <p className="text-2xl font-bold text-[#541409] mb-2">Starting at $100</p>
              <p className="text-sm text-stone-600">Serves 6-12</p>
              <p className="text-xs text-stone-500 mt-2">Perfect for small gatherings</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <h3 className="text-xl font-serif text-[#541409] mb-2">8" Heart or Round</h3>
              <p className="text-2xl font-bold text-[#541409] mb-2">Starting at $140</p>
              <p className="text-sm text-stone-600">Serves 14-20</p>
              <p className="text-xs text-stone-500 mt-2">Most popular size</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <h3 className="text-xl font-serif text-[#541409] mb-2">10" Round</h3>
              <p className="text-2xl font-bold text-[#541409] mb-2">Starting at $180</p>
              <p className="text-sm text-stone-600">Serves 24-30</p>
              <p className="text-xs text-stone-500 mt-2">Great for larger parties</p>
            </div>
          </div>

          <p className="text-center text-stone-600 mt-8 text-sm">
            * Design complexity may affect final pricing. I'll provide a quote after reviewing your request.
          </p>
        </div>
      </section>

      {/* Flavors Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Cake Flavors */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#541409] mb-6">
                Cake Flavors
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {cakeFlavors.map((flavor) => (
                  <div
                    key={flavor}
                    className="bg-white rounded-lg p-4 text-center shadow-sm"
                  >
                    <span className="text-stone-700">{flavor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fillings */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#541409] mb-6">
                Fillings & Frostings
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {fillings.map((filling) => (
                  <div
                    key={filling}
                    className="bg-white rounded-lg p-4 text-center shadow-sm"
                  >
                    <span className="text-stone-700">{filling}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-stone-600 mt-8">
            Don't see what you're looking for? Ask about custom flavors!
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-12">
            Recent Creations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="aspect-square rounded-lg overflow-hidden">
              <img src="/christmas-cake.jpg" alt="Custom cake" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" style={{ objectPosition: 'center 30%' }} />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img src="/49rs-cake.jpg" alt="Custom cake" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img src="/shannon-cake-top.jpg" alt="Custom cake" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" style={{ objectPosition: '20% center' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Important Info */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-12">
            Good to Know
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-medium text-[#541409] mb-2">Lead Time</h3>
              <p className="text-stone-600 text-sm">
                Please order at least 2 weeks in advance. Rush orders may be available at an extra cost - just ask!
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-medium text-[#541409] mb-2">Deposit</h3>
              <p className="text-stone-600 text-sm">
                A 50% deposit is required to secure your order date. Balance is due 7 days before pickup.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-medium text-[#541409] mb-2">Pickup</h3>
              <p className="text-stone-600 text-sm">
                All orders are pickup only from my home kitchen in Cincinnati, OH.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-medium text-[#541409] mb-2">Allergies</h3>
              <p className="text-stone-600 text-sm">
                All cakes are gluten-free and celiac-friendly. Please let me know about other allergies.
              </p>
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
            Ready to Order Your Cake?
          </h2>
          <p className="text-lg text-[#4A2C21]/80 mb-8">
            Fill out the cake inquiry form and I'll get back to you within 24-48 hours with a quote & invoice.
          </p>
          <Link
            href="/order/cake"
            className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
          >
            Start Your Cake Order
          </Link>
        </div>
      </section>
    </>
  );
}
