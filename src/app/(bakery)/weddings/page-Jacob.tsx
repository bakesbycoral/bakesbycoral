import Link from 'next/link';

export default function WeddingsPage() {
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
            Weddings
          </h1>
          <p className="mt-4 text-lg text-white/90 drop-shadow">
            Gluten-free desserts for your special day
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-lg text-stone-600 leading-relaxed">
            Your wedding day should be sweet—and that includes dessert! I create beautiful,
            delicious gluten-free wedding cakes and cookie favors so everyone at your celebration
            can enjoy a treat. Let's make your dessert table something special.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-12">
            Wedding Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Wedding Cakes */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-serif text-[#541409] mb-4">Wedding Cakes</h3>
              <p className="text-stone-600 mb-6">
                From elegant tiered cakes to simple single-tier beauties, I'll work with you
                to design a cake that fits your style and vision.
              </p>
              <ul className="space-y-2 text-stone-600 text-sm mb-6">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  Tiered cakes starting at $120
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  Custom flavors and fillings
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  Fresh or faux flowers available
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  Cake cutting set included
                </li>
              </ul>
              <Link
                href="/order/cake"
                className="inline-flex px-6 py-3 bg-[#541409] text-[#EAD6D6] text-sm font-medium rounded-sm hover:opacity-80 transition-opacity"
              >
                Inquire About Wedding Cakes
              </Link>
            </div>

            {/* Cookie Favors */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-serif text-[#541409] mb-4">Cookie Favors</h3>
              <p className="text-stone-600 mb-6">
                Send your guests home with a sweet treat! Individually wrapped cookies
                make perfect wedding favors.
              </p>
              <ul className="space-y-2 text-stone-600 text-sm mb-6">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  Individually wrapped & sealed
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  Custom labels available
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  Multiple flavor options
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  Bulk pricing for large orders
                </li>
              </ul>
              <Link
                href="/order/cookies-large"
                className="inline-flex px-6 py-3 bg-[#541409] text-[#EAD6D6] text-sm font-medium rounded-sm hover:opacity-80 transition-opacity"
              >
                Inquire About Cookie Favors
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tasting Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative bg-[#541409] rounded-lg p-8 sm:p-12 text-center">
            <div className="absolute inset-4 border border-[#EAD6D6]/30 rounded pointer-events-none"></div>

            <h2 className="text-3xl sm:text-4xl font-serif text-[#EAD6D6] mb-6">
              Cake & Cookie Tastings
            </h2>
            <p className="text-[#EAD6D6]/80 max-w-2xl mx-auto mb-6">
              Not sure which flavors to choose? Order a tasting box to sample before you decide!
              Each tasting box includes 4 flavors so you can find your perfect match.
            </p>
            <p className="text-[#EAD6D6]/80 max-w-2xl mx-auto mb-8 text-sm">
              Book your wedding desserts within 30 days of your tasting and the tasting fee
              will be credited toward your order.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
              <div className="bg-[#EAD6D6]/10 rounded-lg p-4">
                <h3 className="font-medium text-[#EAD6D6] mb-2">Cake Tasting Box</h3>
                <p className="text-sm text-[#EAD6D6]/70">
                  4 cake flavors in 8oz jars with vanilla buttercream + 4 fillings
                </p>
              </div>
              <div className="bg-[#EAD6D6]/10 rounded-lg p-4">
                <h3 className="font-medium text-[#EAD6D6] mb-2">Cookie Tasting Box</h3>
                <p className="text-sm text-[#EAD6D6]/70">
                  4 cookie flavors, 2 of each, individually bagged
                </p>
              </div>
            </div>

            <Link
              href="/tasting"
              className="inline-flex px-8 py-4 bg-[#EAD6D6] text-[#541409] font-medium rounded-sm hover:opacity-80 transition-opacity"
            >
              Order a Tasting Box
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#541409] text-[#EAD6D6] rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="font-medium text-[#541409] mb-2">Reach Out</h3>
              <p className="text-sm text-stone-600">
                Fill out the inquiry form with your wedding date and vision
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#541409] text-[#EAD6D6] rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="font-medium text-[#541409] mb-2">Taste & Plan</h3>
              <p className="text-sm text-stone-600">
                Order a tasting box and we'll discuss design details
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#541409] text-[#EAD6D6] rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="font-medium text-[#541409] mb-2">Confirm & Deposit</h3>
              <p className="text-sm text-stone-600">
                Secure your date with a 50% deposit
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#541409] text-[#EAD6D6] rounded-full flex items-center justify-center text-xl font-bold mb-4">
                4
              </div>
              <h3 className="font-medium text-[#541409] mb-2">Enjoy!</h3>
              <p className="text-sm text-stone-600">
                Pick up your beautiful desserts before the big day
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-[#541409]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#EAD6D6] mb-4">
            Let's Plan Your Wedding Desserts
          </h2>
          <p className="text-lg text-[#EAD6D6]/80 mb-8">
            I'd love to be part of your special day. Reach out to start planning!
          </p>
          <Link
            href="/contact"
            className="inline-flex px-8 py-4 bg-[#EAD6D6] text-[#541409] font-medium rounded-sm hover:opacity-80 transition-opacity"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
