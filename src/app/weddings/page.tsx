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
            #F7F3ED 0px,
            #F7F3ED 40px,
            #EAD6D6 40px,
            #EAD6D6 80px
          )`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif text-[#4A2C21] font-bold">
            Weddings
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            Gluten-free desserts for your special day
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-lg text-stone-600 leading-relaxed">
            Your wedding day should be unforgettable—and that includes dessert! I create beautiful,
            delicious gluten-free cutting cakes and cookies so everyone at your celebration
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
              <h3 className="text-2xl font-serif text-[#541409] mb-4">Cutting Cakes</h3>
              <p className="text-stone-600 mb-6">
                Beautiful single-tier cutting cakes perfect for your cake cutting moment. I'll work with you
                to design a cake that fits your style and vision.
              </p>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  Custom flavors and fillings
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  Elegant designs for your special day
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  Perfect for your cake cutting moment
                </li>
              </ul>
            </div>

            {/* Cookies */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-serif text-[#541409] mb-4">Cookies</h3>
              <p className="text-stone-600 mb-6">
                Add something sweet to your celebration! Perfect for dessert tables
                or as a treat for your guests.
              </p>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  Perfect for any wedding celebration
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  Heat sealing available for extended freshness
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  Mix and match flavors available
                </li>
                <li className="flex items-start">
                  <span className="text-[#541409] mr-2">•</span>
                  5 delicious flavors to choose from
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/order/wedding"
              className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
            >
              Wedding Inquiry Form
            </Link>
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
              Book your wedding desserts within 30 days of your tasting form submission and the tasting fee
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
              <h3 className="font-medium text-[#541409] mb-2">Taste First</h3>
              <p className="text-sm text-stone-600">
                Order a tasting box to find your perfect flavors (optional)
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#541409] text-[#EAD6D6] rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="font-medium text-[#541409] mb-2">Reach Out</h3>
              <p className="text-sm text-stone-600">
                Fill out the inquiry form with your wedding date and vision
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#541409] text-[#EAD6D6] rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="font-medium text-[#541409] mb-2">Confirm & Deposit</h3>
              <p className="text-sm text-stone-600">
                Secure your date with a 50% non-refundable deposit
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#541409] text-[#EAD6D6] rounded-full flex items-center justify-center text-xl font-bold mb-4">
                4
              </div>
              <h3 className="font-medium text-[#541409] mb-2">Enjoy!</h3>
              <p className="text-sm text-stone-600">
                Pick up your desserts or have them delivered for a fee
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
            Let's Plan Your Wedding Desserts
          </h2>
          <p className="text-lg text-[#4A2C21]/80 mb-8">
            I'd love to be part of your special day. Reach out to start planning!
          </p>
          <Link
            href="/order/wedding"
            className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
          >
            Inquiry Form
          </Link>
        </div>
      </section>
    </>
  );
}
