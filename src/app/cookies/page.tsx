import Link from 'next/link';

export default function CookiesPage() {
  const cookieFlavors = [
    { name: 'Chocolate Chip', description: 'Classic soft & chewy with semi-sweet chocolate chips, topped with flaky sea salt' },
    { name: 'Vanilla Bean Sugar', description: 'Melt-in-your-mouth vanilla bean cookie rolled in sugar' },
    { name: 'Cherry Almond', description: 'Sweet cherry with hints of almond & vanilla' },
    { name: 'Espresso Butterscotch', description: 'Rich & chewy espresso flavor with butterscotch and chocolate chips' },
    { name: 'Lemon Sugar', description: 'Bright lemon cookie with a sugar coating' },
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
            Cookies
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            Soft, chewy, and 100% gluten-free
          </p>
        </div>
      </section>

      {/* Intro & Pricing */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-lg text-stone-600 leading-relaxed mb-12">
            My cookies are soft, chewy, and packed with flavor. Each one is made from scratch
            with gluten-free ingredients that taste just like the real thing. You can't even tell.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-serif text-[#541409] mb-2">1 Dozen</h3>
              <p className="text-3xl font-bold text-[#541409]">$30</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-serif text-[#541409] mb-2">2 Dozen</h3>
              <p className="text-3xl font-bold text-[#541409]">$60</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-serif text-[#541409] mb-2">3 Dozen</h3>
              <p className="text-3xl font-bold text-[#541409]">$90</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-serif text-[#541409] mb-2">4+ Dozen</h3>
              <p className="text-lg font-medium text-[#541409]">$30/dozen</p>
              <p className="text-sm text-stone-600">10+ dozen: 5% off!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Flavors Section */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-12">
            Flavors
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cookieFlavors.map((cookie) => (
              <div
                key={cookie.name}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <h3 className="text-xl font-serif text-[#541409] mb-2">{cookie.name}</h3>
                <p className="text-stone-600 text-sm">{cookie.description}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-stone-700 mt-8">
            Seasonal flavors available! Ask about current specials.
          </p>
        </div>
      </section>

      {/* Cookie Images */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
              <img
                src="/choco-chip-tray.jpg"
                alt="Chocolate Chip Cookies"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
              <img
                src="/cherry.jpg"
                alt="Cherry Almond Cookies"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
              <img
                src="/vanilla.jpg"
                alt="Vanilla Bean Sugar Cookies"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
              <img
                src="/espresso.jpg"
                alt="Espresso Butterscotch Cookies"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Large Orders */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] mb-6">
            Large Orders
          </h2>
          <p className="text-lg text-stone-700 leading-relaxed mb-8">
            Planning an event? I offer special pricing for large cookie orders of 4 dozen or more.
            Perfect for events, showers, and parties.
          </p>
          <Link
            href="/order/cookies-large"
            className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
          >
            Large Cookie Order Form
          </Link>
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
                Please order at least 1 week in advance for regular orders.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-medium text-[#541409] mb-2">Mix & Match</h3>
              <p className="text-stone-600 text-sm">
                Love variety? Choose up to 2 flavors for 1 dozen, or up to 4 flavors for 2 dozen (6-cookie minimum per flavor).
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-medium text-[#541409] mb-2">Freshness</h3>
              <p className="text-stone-600 text-sm">
                Cookies are baked fresh for your pickup date. Best enjoyed within 5 days.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-medium text-[#541409] mb-2">Packaging</h3>
              <p className="text-stone-600 text-sm">
                Packaged in a bakery box, ready to gift. Heat sealing available for extended freshness.
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
            Ready to Order?
          </h2>
          <p className="text-lg text-[#4A2C21]/80 mb-8">
            Fill out the cookie order form and I'll confirm your order within 24-48 hours.
          </p>
          <Link
            href="/order/cookies"
            className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
          >
            Order Cookies
          </Link>
        </div>
      </section>
    </>
  );
}
