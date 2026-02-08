import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Menu & Pricing',
  description: 'View our gluten-free bakery menu. Cookies from $30/dozen, custom cakes from $60, wedding desserts, and tasting boxes. All celiac-safe, made in Cincinnati.',
  keywords: ['gluten-free menu', 'bakery prices', 'cookie prices', 'cake prices', 'Cincinnati bakery menu'],
  openGraph: {
    title: 'Menu & Pricing | Bakes by Coral',
    description: 'Browse our full menu of gluten-free cookies, cakes, and wedding desserts with pricing.',
  },
};

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
              <Link href="/cakes" className="inline-block px-4 py-1.5 bg-[#EAD6D6] text-[#541409] text-sm font-medium rounded-full mb-4 hover:opacity-80 transition-opacity">
                Celebration Cakes
              </Link>
              <Link href="/cakes" className="block hover:opacity-70 transition-opacity">
                <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] mb-6">
                  Custom Cakes
                </h2>
              </Link>
              <p className="text-stone-600 leading-relaxed mb-6">
                Beautiful 3-layer cakes perfect for birthdays, showers, and any celebration.
                Each cake is made to order with your choice of flavors, fillings, and design.
              </p>

              <div className="space-y-4 mb-8">
                <Link href="/order/cake?size=4-inch" className="flex justify-between items-center border-b border-stone-200 pb-2 hover:bg-[#EAD6D6]/25 -mx-2 px-2 py-1 rounded transition-colors">
                  <span className="font-medium text-[#541409]">4" Heart or Round (serves 2-4)</span>
                  <span className="text-stone-600">Starting at $60</span>
                </Link>
                <Link href="/order/cake?size=6-inch" className="flex justify-between items-center border-b border-stone-200 pb-2 hover:bg-[#EAD6D6]/25 -mx-2 px-2 py-1 rounded transition-colors">
                  <span className="font-medium text-[#541409]">6" Heart or Round (serves 6-12)</span>
                  <span className="text-stone-600">Starting at $100</span>
                </Link>
                <Link href="/order/cake?size=8-inch" className="flex justify-between items-center border-b border-stone-200 pb-2 hover:bg-[#EAD6D6]/25 -mx-2 px-2 py-1 rounded transition-colors">
                  <span className="font-medium text-[#541409]">8" Heart or Round (serves 14-20)</span>
                  <span className="text-stone-600">Starting at $140</span>
                </Link>
                <Link href="/order/cake?size=10-inch" className="flex justify-between items-center border-b border-stone-200 pb-2 hover:bg-[#EAD6D6]/25 -mx-2 px-2 py-1 rounded transition-colors">
                  <span className="font-medium text-[#541409]">10" Round (serves 24-30)</span>
                  <span className="text-stone-600">Starting at $180</span>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/order/cake"
                  className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
                >
                  Order Now
                </Link>
                <Link
                  href="/cakes"
                  className="inline-flex px-8 py-4 bg-transparent border-2 border-[#541409] text-[#541409] font-medium rounded-sm hover:bg-[#541409]/10 transition-colors"
                >
                  View Cake Details
                </Link>
              </div>
            </div>

            <Link href="/cakes" className="aspect-square rounded-lg overflow-hidden shadow-lg block hover:shadow-xl hover:scale-[1.02] transition-all">
              <img
                src="/25th-cake.jpg"
                alt="Custom Cake"
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Cookies Section */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Link href="/cookies" className="order-2 lg:order-1 aspect-square rounded-lg overflow-hidden shadow-lg block hover:shadow-xl hover:scale-[1.02] transition-all">
              <img
                src="/cherry.jpg"
                alt="Cookies"
                className="w-full h-full object-cover"
              />
            </Link>

            <div className="order-1 lg:order-2">
              <Link href="/cookies" className="inline-block px-4 py-1.5 bg-[#541409] text-[#EAD6D6] text-sm font-medium rounded-full mb-4 hover:opacity-80 transition-opacity">
                Fresh Baked
              </Link>
              <Link href="/cookies" className="block hover:opacity-70 transition-opacity">
                <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] mb-6">
                  Cookies
                </h2>
              </Link>
              <p className="text-stone-700 leading-relaxed mb-6">
                Soft, chewy cookies in delicious flavors. Perfect for gifts, events,
                or treating yourself. Available by the dozen.
              </p>

              <div className="space-y-4 mb-8">
                <Link href="/order/cookies" className="flex justify-between items-center border-b border-[#541409]/20 pb-2 hover:bg-[#FFF8F0]/25 -mx-2 px-2 py-1 rounded transition-colors">
                  <span className="font-medium text-[#541409]">Per Dozen</span>
                  <span className="text-stone-700">$30</span>
                </Link>
                <Link href="/order/cookies-large" className="flex justify-between items-center border-b border-[#541409]/20 pb-2 hover:bg-[#FFF8F0]/25 -mx-2 px-2 py-1 rounded transition-colors">
                  <span className="font-medium text-[#541409]">10+ Dozen</span>
                  <span className="text-stone-700">5% off!</span>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/order/cookies"
                  className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
                >
                  Order Now
                </Link>
                <Link
                  href="/cookies"
                  className="inline-flex px-8 py-4 bg-transparent border-2 border-[#541409] text-[#541409] font-medium rounded-sm hover:bg-[#541409]/10 transition-colors"
                >
                  View Cookie Flavors
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cookie Cups Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Link href="/cookie-cups" className="inline-block px-4 py-1.5 bg-[#EAD6D6] text-[#541409] text-sm font-medium rounded-full mb-4 hover:opacity-80 transition-opacity">
                Party Perfect
              </Link>
              <Link href="/cookie-cups" className="block hover:opacity-70 transition-opacity">
                <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] mb-6">
                  Cookie Cups
                </h2>
              </Link>
              <p className="text-stone-600 leading-relaxed mb-6">
                Mini chocolate chip cookie cups filled with vanilla buttercream frosting.
                Fully customized with your colors and designs. Perfect for parties,
                showers, and celebrations.
              </p>

              <div className="space-y-4 mb-8">
                <Link href="/cookie-cups" className="flex justify-between items-center border-b border-stone-200 pb-2 hover:bg-[#EAD6D6]/25 -mx-2 px-2 py-1 rounded transition-colors">
                  <span className="font-medium text-[#541409]">1 Dozen</span>
                  <span className="text-stone-600">$30</span>
                </Link>
                <Link href="/cookie-cups" className="flex justify-between items-center border-b border-stone-200 pb-2 hover:bg-[#EAD6D6]/25 -mx-2 px-2 py-1 rounded transition-colors">
                  <span className="font-medium text-[#541409]">2 Dozen</span>
                  <span className="text-stone-600">$60</span>
                </Link>
                <Link href="/cookie-cups" className="flex justify-between items-center border-b border-stone-200 pb-2 hover:bg-[#EAD6D6]/25 -mx-2 px-2 py-1 rounded transition-colors">
                  <span className="font-medium text-[#541409]">3 Dozen</span>
                  <span className="text-stone-600">$90</span>
                </Link>
                <Link href="/cookie-cups" className="flex justify-between items-center border-b border-stone-200 pb-2 hover:bg-[#EAD6D6]/25 -mx-2 px-2 py-1 rounded transition-colors">
                  <span className="font-medium text-[#541409]">4 Dozen</span>
                  <span className="text-stone-600">$120</span>
                </Link>
                <div className="text-sm text-stone-500 pt-1">
                  Includes piped designs & sprinkles. Add chocolate molds or edible glitter +$4/dozen each
                </div>
              </div>

              <Link
                href="/cookie-cups"
                className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
              >
                Order Cookie Cups
              </Link>
            </div>

            <Link href="/cookie-cups" className="aspect-square rounded-lg overflow-hidden shadow-lg block hover:shadow-xl hover:scale-[1.02] transition-all">
              <img
                src="/cookie-cups.jpg"
                alt="Cookie Cups"
                className="w-full h-full object-cover"
              />
            </Link>
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
