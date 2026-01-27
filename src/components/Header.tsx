'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/weddings', label: 'Weddings' },
  { href: '/about', label: 'About Me' },
];

const moreLinks = [
  { href: '/order/cookies-large', label: 'Large Cookie Orders' },
  { href: '/order/cake', label: 'Cake Inquiry Form' },
  { href: '/order/cookies', label: 'Cookie Order Form' },
  { href: '/contact', label: 'Contact' },
  { href: '/policies', label: 'Policies' },
  { href: '/faq', label: 'FAQ' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#541409]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center h-16 sm:h-20 overflow-hidden -ml-16 sm:-ml-24">
            <Image
              src="/logo.png"
              alt="Bakes by Coral"
              width={250}
              height={250}
              className="h-28 sm:h-32 w-auto object-cover object-center"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium text-[#EAD6D6] hover:text-white transition-colors ${
                  pathname === link.href ? 'underline underline-offset-4 decoration-[#EAD6D6]' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* More Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMoreDropdownOpen(true)}
              onMouseLeave={() => setMoreDropdownOpen(false)}
            >
              <button
                className={`text-sm font-medium text-[#EAD6D6] hover:text-white transition-colors flex items-center gap-1 ${
                  moreLinks.some((link) => pathname === link.href) ? 'underline underline-offset-4 decoration-[#EAD6D6]' : ''
                }`}
              >
                More
                <svg
                  className={`w-4 h-4 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {moreDropdownOpen && (
                <div className="absolute top-full right-0 pt-2 w-56">
                  <div className="bg-[#541409] border border-[#EAD6D6]/20 rounded-lg shadow-lg py-2">
                    {moreLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2 text-sm text-[#EAD6D6] hover:bg-[#EAD6D6]/10 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/admin/login"
              className={`text-sm font-medium text-[#EAD6D6] hover:text-white transition-colors ${
                pathname === '/admin/login' ? 'underline underline-offset-4 decoration-[#EAD6D6]' : ''
              }`}
            >
              Login
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-4 -mr-16 sm:-mr-24">
            <Link
              href="/order/cake"
              className="hidden sm:inline-flex px-6 py-3 bg-[#EAD6D6] text-[#541409] text-base font-medium rounded-sm hover:opacity-80 transition-opacity"
            >
              Custom Cake Form
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#EAD6D6] hover:text-white"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-[#541409]/50">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#EAD6D6] hover:text-white hover:bg-[#541409]/70 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {/* More section in mobile */}
              <div className="px-4 py-2 text-xs font-semibold text-[#EAD6D6]/60 uppercase tracking-wider mt-2">
                More
              </div>
              {moreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#EAD6D6] hover:text-white hover:bg-[#541409]/70 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-[#EAD6D6] hover:text-white hover:bg-[#541409]/70 rounded-lg transition-colors"
              >
                Login
              </Link>

              <Link
                href="/order/cake"
                onClick={() => setMobileMenuOpen(false)}
                className="mx-4 mt-2 px-5 py-3 bg-[#EAD6D6] text-[#541409] font-medium rounded-sm text-center hover:opacity-80 transition-opacity"
              >
                Custom Cake Form
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
