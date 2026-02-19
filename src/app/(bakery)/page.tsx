import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* Decorative Stripe Banner */}
      <div
        className="w-full h-12 sm:h-16"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            #541409 0px,
            #541409 40px,
            #EAD6D6 40px,
            #EAD6D6 80px
          )`
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-[55vh] sm:min-h-[65vh] flex items-center bg-[#3D2318]">
        {/* Background image - positioned to show lighter marble/bowl area on mobile */}
        <div
          className="absolute inset-0 bg-[length:180%] sm:bg-cover bg-[position:30%_65%] sm:bg-[position:center_60%]"
          style={{
            backgroundImage: 'url("/hero-cookies.jpg")',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Headline */}
            <div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-[#4A2C21] leading-tight font-playfair font-bold">
                Gluten-Free Baking<br />
                You'll <em className="italic">Actually</em> Crave
              </h1>
            </div>

            {/* Right: Description + CTA */}
            <div className="lg:pl-8">
              <p className="text-base sm:text-xl text-[#4A2C21] leading-relaxed mb-8">
                Custom cakes & cookies made from scratch in my home bakery that taste just like the classics, without the gluten.
              </p>
              <Link
                href="/menu"
                className="inline-flex px-10 py-5 bg-[#EAD6D6] text-[#541409] text-lg font-medium rounded-sm hover:opacity-80 transition-opacity text-center"
              >
                See The Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Me Section */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Profile Image */}
            <div className="flex justify-center md:justify-end">
              <Link href="/about" className="w-72 h-72 sm:w-96 sm:h-96 rounded-full overflow-hidden shadow-lg block hover:shadow-xl hover:scale-[1.02] transition-all">
                <img
                  src="/profile.jpg"
                  alt="Coralyn - Bakes by Coral"
                  className="w-full h-full object-cover"
                />
              </Link>
            </div>

            {/* Text Content */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] italic mb-6">
                Hey there!
              </h2>
              <p className="text-lg text-stone-700 leading-relaxed mb-8">
                I'm Coralyn, the home baker behind Bakes by Coral. After having to go gluten-free, I turned my love for baking into a little dream come true by creating desserts that are as beautiful as they are delicious. Every treat is handcrafted with care, creativity, and a touch of sweetness. My goal is to make you feel a little extra special with every bite. :)
              </p>
              <Link
                href="/about"
                className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] text-lg font-medium rounded-sm hover:opacity-80 transition-opacity"
              >
                About Me
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-[#EAD6D6] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#541409]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-[#541409] mb-2">100% Gluten-Free</h3>
              <p className="text-stone-600">
                Every recipe crafted specifically for celiacs & sensitivities. No compromises, just delicious.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-[#EAD6D6] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#541409]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-[#541409] mb-2">Made with Love</h3>
              <p className="text-stone-600">
                Every cake and cookie is handcrafted with care. Your celebration deserves the best.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-[#EAD6D6] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#541409]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-[#541409] mb-2">Local Pickup</h3>
              <p className="text-stone-600">
                Fresh from my home kitchen to your hands. Located in Cincinnati, Ohio 45245.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Easter Collection Featured */}
      <section className="py-16 sm:py-24 bg-[#541409]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block px-4 py-1.5 bg-[#EAD6D6]/20 text-[#EAD6D6] text-sm font-medium rounded-full mb-6">
            Limited Time
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#EAD6D6] mb-4">
            Easter Collection
          </h2>
          <p className="text-lg text-[#EAD6D6]/80 max-w-2xl mx-auto mb-8">
            Celebrate Easter with festive bento cakes and thumbprint confetti cookies.
            Order individually or save with our bundle deal!
          </p>
          <Link
            href="/collection/easter"
            className="inline-flex px-8 py-4 bg-[#EAD6D6] text-[#541409] font-medium rounded-sm hover:opacity-80 transition-opacity"
          >
            View Collection & Order
          </Link>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif text-[#541409]">
              What I Bake
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              From custom celebration cakes to perfectly chewy cookies
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-8">
            {/* Custom Cakes Card */}
            <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <Link href="/cakes" className="aspect-[4/3] overflow-hidden block">
                <img
                  src="/miles-cake.jpg"
                  alt="Custom Cake"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-3 sm:p-6">
                <Link href="/cakes" className="block hover:opacity-70 transition-opacity">
                  <h3 className="text-lg sm:text-2xl font-serif text-[#541409] mb-1 sm:mb-2">Custom Cakes</h3>
                </Link>
                <p className="text-stone-600 mb-2 sm:mb-4 text-xs sm:text-base">
                  Beautiful 3-layer cakes for birthdays, showers, and celebrations.
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#EAD6D6] text-[#541409] text-xs sm:text-sm rounded-full">From $60</span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#F7F3ED] text-stone-600 text-xs sm:text-sm rounded-full">2 weeks</span>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <Link
                    href="/order/cake"
                    className="inline-flex items-center text-[#541409] font-medium hover:opacity-70 transition-opacity text-xs sm:text-base"
                  >
                    Order
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/cakes"
                    className="inline-flex items-center text-[#541409]/70 font-medium hover:opacity-70 transition-opacity text-xs sm:text-base"
                  >
                    Cake Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Cookies Card */}
            <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <Link href="/cookies" className="aspect-[4/3] overflow-hidden block">
                <img
                  src="/choco-chip.jpg"
                  alt="Chocolate Chip Cookies"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-3 sm:p-6">
                <Link href="/cookies" className="block hover:opacity-70 transition-opacity">
                  <h3 className="text-lg sm:text-2xl font-serif text-[#541409] mb-1 sm:mb-2">Cookies</h3>
                </Link>
                <p className="text-stone-600 mb-2 sm:mb-4 text-xs sm:text-base">
                  Soft, chewy cookies in classic flavors. Perfect for gifts or events.
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#EAD6D6] text-[#541409] text-xs sm:text-sm rounded-full">$30/dozen</span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#F7F3ED] text-stone-600 text-xs sm:text-sm rounded-full">1 week</span>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <Link
                    href="/order/cookies"
                    className="inline-flex items-center text-[#541409] font-medium hover:opacity-70 transition-opacity text-xs sm:text-base"
                  >
                    Order
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/cookies"
                    className="inline-flex items-center text-[#541409]/70 font-medium hover:opacity-70 transition-opacity text-xs sm:text-base"
                  >
                    View Flavors
                  </Link>
                </div>
              </div>
            </div>

            {/* Cookie Cups Card */}
            <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden col-span-2 md:col-span-1">
              <Link href="/cookie-cups" className="aspect-[4/3] overflow-hidden block">
                <img
                  src="/cookie-cups.jpg"
                  alt="Cookie Cups"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-3 sm:p-6">
                <Link href="/cookie-cups" className="block hover:opacity-70 transition-opacity">
                  <h3 className="text-lg sm:text-2xl font-serif text-[#541409] mb-1 sm:mb-2">Cookie Cups</h3>
                </Link>
                <p className="text-stone-600 mb-2 sm:mb-4 text-xs sm:text-base">
                  Mini chocolate chip cookie cups with vanilla buttercream.
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#EAD6D6] text-[#541409] text-xs sm:text-sm rounded-full">From $30</span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#F7F3ED] text-stone-600 text-xs sm:text-sm rounded-full">1 week</span>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <Link
                    href="/cookie-cups"
                    className="inline-flex items-center text-[#541409] font-medium hover:opacity-70 transition-opacity text-xs sm:text-base"
                  >
                    Order
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weddings Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative bg-[#541409] rounded-lg p-8 sm:p-12 lg:p-16 text-center">
            {/* Decorative border */}
            <div className="absolute inset-4 border border-[#EAD6D6]/30 rounded pointer-events-none"></div>

            <Link href="/weddings" className="inline-block px-4 py-1.5 bg-[#EAD6D6]/20 text-[#EAD6D6] text-sm font-medium rounded-full mb-6 hover:bg-[#EAD6D6]/30 transition-colors">
              Weddings
            </Link>
            <Link href="/weddings" className="block hover:opacity-80 transition-opacity">
              <h2 className="text-3xl sm:text-4xl font-serif text-[#EAD6D6] mb-6">
                Make Your Day Sweeter
              </h2>
            </Link>
            <p className="text-lg text-[#EAD6D6]/80 max-w-2xl mx-auto mb-8">
              Make your special day even sweeter with custom gluten-free desserts.
              From elegant wedding cakes to cookie favors for your guests.
            </p>
            <Link
              href="/weddings"
              className="inline-flex px-8 py-4 bg-[#EAD6D6] text-[#541409] font-medium rounded-sm hover:opacity-80 transition-opacity"
            >
              Plan Your Event
            </Link>

            {/* Divider */}
            <div className="my-10 border-t border-[#EAD6D6]/30"></div>

            {/* Tasting Box Section */}
            <Link href="/tasting" className="block hover:opacity-80 transition-opacity">
              <h3 className="text-2xl sm:text-3xl font-serif text-[#EAD6D6] mb-4">
                Cake & Cookie Tastings
              </h3>
            </Link>
            <p className="text-[#EAD6D6]/80 max-w-2xl mx-auto mb-8">
              Sample flavors before your big day! Tasting boxes include 4 cake flavors with fillings or 4 cookie flavors (2 of each). Book within 30 days and your tasting fee is credited toward your order.
            </p>
            <Link
              href="/tasting"
              className="inline-flex px-8 py-4 bg-transparent border-2 border-[#EAD6D6] text-[#EAD6D6] font-medium rounded-sm hover:bg-[#EAD6D6]/10 transition-colors"
            >
              Order a Tasting Box
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif text-[#541409]">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              From order to pickup in a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#541409] text-[#EAD6D6] rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="font-medium text-[#541409] mb-2">Choose Your Treats</h3>
              <p className="text-sm text-stone-600">
                Browse my menu and select your flavors
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#541409] text-[#EAD6D6] rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="font-medium text-[#541409] mb-2">Place Your Order</h3>
              <p className="text-sm text-stone-600">
                Fill out the order form with your details
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#541409] text-[#EAD6D6] rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="font-medium text-[#541409] mb-2">Confirm & Pay</h3>
              <p className="text-sm text-stone-600">
                Secure your pickup time with payment
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#541409] text-[#EAD6D6] rounded-full flex items-center justify-center text-xl font-bold mb-4">
                4
              </div>
              <h3 className="font-medium text-[#541409] mb-2">Pick Up & Enjoy</h3>
              <p className="text-sm text-stone-600">
                Collect your fresh-baked goodies
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
            #EAD6D6 0px,
            #EAD6D6 40px,
            #F7F3ED 40px,
            #F7F3ED 80px
          )`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] mb-4">
            Ready to Order?
          </h2>
          <p className="text-lg text-stone-600 mb-8">
            Whether it's a custom cake for your celebration or cookies for a gathering,
            I'd love to bake something special for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/order"
              className="w-full sm:w-auto px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-90 transition-opacity text-center"
            >
              Start Your Order
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#541409] font-medium rounded-sm border border-[#541409] hover:bg-[#EAD6D6] transition-colors text-center"
            >
              Ask a Question
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
