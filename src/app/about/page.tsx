import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Coralyn',
  description: 'Meet Coralyn, the baker behind Bakes by Coral. A Cincinnati-based gluten-free bakery born from a personal journey with IBS and a passion for delicious treats everyone can enjoy.',
  openGraph: {
    title: 'About Coralyn | Bakes by Coral',
    description: 'Meet Coralyn, the baker behind Bakes by Coral. A Cincinnati-based gluten-free bakery born from a personal journey with IBS and a passion for delicious treats.',
  },
};

export default function AboutPage() {
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
            About Me
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            The story behind Bakes by Coral
          </p>
        </div>
      </section>

      {/* Main About Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -left-4 top-8 sm:-left-8 sm:top-12 w-20 h-20 sm:w-24 sm:h-24 bg-[#541409] rounded-full flex items-center justify-center shadow-md z-10">
                  <span className="text-[#EAD6D6] font-serif italic text-lg sm:text-xl">hello!</span>
                </div>
                <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-full overflow-hidden shadow-lg">
                  <img
                    src="/profile.jpg"
                    alt="Coralyn - Bakes by Coral"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Text */}
            <div>
              <div className="space-y-4 text-stone-600 leading-relaxed">
                <p>
                  Hi! I'm <strong>Coralyn</strong>, the baker, creator, and heart behind <strong>Bakes by Coral</strong>, a home-based bakery dedicated to making delicious gluten-free treats that taste just as good as the classics (and sometimes even better!).
                </p>
                <p>
                  Baking has always been part of who I am. When I was diagnosed with IBS and gluten was identified as my biggest trigger, I turned that challenge into motivation. I became determined to recreate the sweets I loved in a gluten-free form that still tasted amazing—and after lots of experimentation (and plenty of taste-testing!), I did just that.
                </p>
                <p>
                  Whether you're gluten-free by necessity, by choice, or not gluten-free at all, my goal is simple: every bite should bring joy. Bakes by Coral is built on passion, creativity, and a whole lot of heart. Thanks for being here, and I can't wait to bake for you. :)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24 bg-[#EAD6D6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-12">
            What I Believe In
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto bg-[#541409] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#EAD6D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-[#541409] mb-2">Made with Love</h3>
              <p className="text-stone-600 text-sm">
                Every single item is made by hand with attention to detail and genuine care.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto bg-[#541409] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#EAD6D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-[#541409] mb-2">No Compromises</h3>
              <p className="text-stone-600 text-sm">
                Gluten-free doesn't mean sacrificing taste. I use quality ingredients for incredible flavor.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto bg-[#541409] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#EAD6D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-[#541409] mb-2">Celebrate You</h3>
              <p className="text-stone-600 text-sm">
                Every order is a chance to make someone's day sweeter. That's what this is all about.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fun Facts */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] text-center mb-12">
            A Few Fun Facts
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-stone-600">
                <span className="font-medium text-[#541409]">Favorite flavor combo:</span> Red velvet cake with vanilla bean ganache filling
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-stone-600">
                <span className="font-medium text-[#541409]">Most requested cookie:</span> Chocolate chip (a classic for a reason!)
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-stone-600">
                <span className="font-medium text-[#541409]">What I listen to while baking:</span> Morbid, Twin Paranormal, or The Basement Yard!
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-stone-600">
                <span className="font-medium text-[#541409]">When I'm not baking:</span> Spending time with friends and family, and teaching dance
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
            Let's Create Something Sweet
          </h2>
          <p className="text-lg text-[#4A2C21]/80 mb-8">
            Ready to order or just have questions? I'd love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/menu"
              className="w-full sm:w-auto px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity text-center"
            >
              View the Menu
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-[#541409] text-[#541409] font-medium rounded-sm hover:bg-[#541409]/10 transition-colors text-center"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
