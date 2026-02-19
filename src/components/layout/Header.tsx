'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from './Container';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Menu', href: '/menu' },
  { name: 'Weddings', href: '/weddings' },
  { name: 'About Me', href: '/about' },
  { name: 'FAQ', href: '/faq' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 bg-[var(--background)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <nav className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <span className="text-base sm:text-xl italic text-[var(--foreground)]" style={{ fontFamily: 'Georgia, serif' }}>
                Bakes by Coral
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:gap-8">
              <Link
                href="/collection/easter"
                className={`text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors flex items-center gap-1.5 ${
                  pathname === '/collection/easter' ? 'underline underline-offset-4' : ''
                }`}
              >
                Easter Collection
                <span className="px-1.5 py-0.5 bg-[var(--primary)] text-[var(--background)] text-[10px] font-bold rounded-full leading-none">
                  NEW
                </span>
              </Link>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors ${
                    pathname === item.href ? 'underline underline-offset-4' : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <Link
                href="/order/cake"
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-[var(--foreground)] border border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
              >
                Custom Cake Form
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 text-[var(--foreground)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--foreground)]/20 bg-[var(--background)]">
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/collection/easter"
                className={`flex items-center gap-2 py-2 text-base font-medium text-[var(--foreground)] hover:text-[var(--primary)] ${
                  pathname === '/collection/easter' ? 'underline underline-offset-4' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Easter Collection
                <span className="px-1.5 py-0.5 bg-[var(--primary)] text-[var(--background)] text-[10px] font-bold rounded-full leading-none">
                  NEW
                </span>
              </Link>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block py-2 text-base font-medium text-[var(--foreground)] hover:text-[var(--primary)] ${
                    pathname === item.href ? 'underline underline-offset-4' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/order/cake"
                className="block w-full text-center py-3 mt-4 text-sm font-medium text-[var(--foreground)] border border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Custom Cake Form
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Stripe Divider */}
      <div
        className="h-8 w-full"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            var(--background) 0px,
            var(--background) 20px,
            var(--primary) 20px,
            var(--primary) 40px
          )`
        }}
      />
    </>
  );
}
