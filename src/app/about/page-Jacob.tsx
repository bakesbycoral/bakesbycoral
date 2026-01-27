import Link from 'next/link';

export default function AboutPage() {
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
            About Me
          </h1>
          <p className="mt-4 text-lg text-white/90 drop-shadow">
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
              <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-full overflow-hidden shadow-lg">
                <img
                  src="/profile.jpg"
                  alt="Coralyn - Bakes by Coral"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] italic mb-6">
                Hey there!
              </h2>
              <div className="space-y-4 text-stone-600 leading-relaxed">
                <p>
                  I'm Coralyn, the home baker behind Bakes by Coral. After being diagnosed
                  with celiac disease, I found myself missing all the treats I used to love.
                  Store-bought gluten-free options just didn't cut it—they were dry, crumbly,
                  and tasted like cardboard.
                </p>
                <p>
                  So I started experimenting in my kitchen, determined to create gluten-free
                  desserts that actually taste amazing. After countless batches (and maybe
                  a few failures), I finally cracked the code. Now I get to share that joy
                  with others who thought they'd never have a delicious cake or cookie again.
                </p>
                <p>
                  Every treat I make is handcrafted with care, creativity, and a whole lot
                  of love. Whether it's a birthday cake, wedding dessert, or just a dozen
                  cookies because you deserve it, my goal is to make you feel special with
                  every bite.
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
                <span className="font-medium text-[#541409]">Favorite flavor combo:</span> Chocolate cake with raspberry filling
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-stone-600">
                <span className="font-medium text-[#541409]">Most requested cookie:</span> Chocolate chip (a classic for a reason!)
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-stone-600">
                <span className="font-medium text-[#541409]">Located in:</span> Cincinnati, Ohio
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-stone-600">
                <span className="font-medium text-[#541409]">When I'm not baking:</span> Spending time with family and exploring local coffee shops
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-[#541409]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#EAD6D6] mb-4">
            Let's Create Something Sweet
          </h2>
          <p className="text-lg text-[#EAD6D6]/80 mb-8">
            Ready to order or just have questions? I'd love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/menu"
              className="w-full sm:w-auto px-8 py-4 bg-[#EAD6D6] text-[#541409] font-medium rounded-sm hover:opacity-80 transition-opacity text-center"
            >
              View the Menu
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-[#EAD6D6] text-[#EAD6D6] font-medium rounded-sm hover:bg-[#EAD6D6]/10 transition-colors text-center"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
