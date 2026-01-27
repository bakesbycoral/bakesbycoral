import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#541409] text-[#EAD6D6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block -ml-5">
              <div className="w-64 h-36 overflow-hidden">
                <img
                  src="/logo-footer.png"
                  alt="Bakes by Coral"
                  className="w-full h-full object-contain object-center"
                />
              </div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              Handcrafted gluten-free cakes and cookies made with love in Cincinnati.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#EAD6D6] font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/menu" className="hover:text-white transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/cakes" className="hover:text-white transition-colors">
                  Custom Cakes
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition-colors">
                  Cookies
                </Link>
              </li>
              <li>
                <Link href="/weddings" className="hover:text-white transition-colors">
                  Weddings
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-[#EAD6D6] font-medium mb-4">Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Me
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/policies" className="hover:text-white transition-colors">
                  Policies
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[#EAD6D6] font-medium mb-4">Get in Touch</h3>
            <ul className="space-y-2 text-sm">
              <li>Cincinnati, OH</li>
              <li>Pickup Only</li>
              <li className="pt-2">
                <Link
                  href="/order"
                  className="inline-flex px-4 py-2 bg-[#EAD6D6] text-[#541409] text-sm font-medium rounded-sm hover:bg-white transition-colors"
                >
                  Start an Order
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[#EAD6D6]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Bakes by Coral. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-[#EAD6D6]/20 text-[#EAD6D6] rounded-full text-xs font-medium">
              Gluten-Free
            </span>
            <span className="px-3 py-1 bg-[#EAD6D6]/10 text-[#EAD6D6] rounded-full text-xs font-medium">
              Pickup Only
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
