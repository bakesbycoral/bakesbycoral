'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  children?: { name: string; href: string }[];
}

const navigation: NavItem[] = [
  { name: 'How We Work', href: '/leango/how-we-work' },
  {
    name: 'Our Approach',
    href: '/leango/our-approach',
    children: [
      { name: 'Lean Problem Solving', href: '/leango/lean-problem-solving' },
      { name: 'Training', href: '/leango/training' },
      { name: 'Apps', href: '/leango/apps' },
      { name: 'Analytics', href: '/leango/analytics' },
    ],
  },
  { name: 'Blog', href: '/leango/blog' },
  { name: 'Contact', href: '/leango/contact' },
  {
    name: 'More',
    href: '#',
    children: [
      { name: 'Industries', href: '/leango/industries' },
      { name: 'About', href: '/leango/about' },
      { name: 'FAQ', href: '/leango/faq' },
      { name: 'Success Stories', href: '/leango/success-stories' },
      { name: 'Careers', href: '/leango/careers' },
    ],
  },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/leango" className="flex items-center gap-3">
            <Image
              src="/leango/logo.png"
              alt="LeanGo"
              width={140}
              height={40}
              className="h-8 lg:h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.children ? (
                  <div
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {/* For "Our Approach" - clickable link with dropdown */}
                    {item.href !== '#' ? (
                      <Link
                        href={item.href}
                        className="flex items-center gap-1 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                      >
                        {item.name}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Link>
                    ) : (
                      <button className="flex items-center gap-1 text-gray-300 hover:text-white text-sm font-medium transition-colors">
                        {item.name}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                    {openDropdown === item.name && (
                      <div className="absolute top-full left-0 pt-2">
                        <div className="bg-gray-900 rounded-lg shadow-xl border border-white/10 py-2 min-w-[180px]">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link
              href="/leango/book/consultation"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#00a1f1] text-white text-sm font-medium rounded-lg hover:bg-[#0091d8] hover:shadow-lg hover:shadow-[#00a1f1]/25 transition-all duration-200"
            >
              Schedule Your First Session
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <div className="space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <div>
                      {/* For items with children and a real href, show both link and toggle */}
                      <div className="flex items-center justify-between">
                        {item.href !== '#' ? (
                          <Link
                            href={item.href}
                            className="flex-1 px-4 py-2 text-gray-300 hover:text-white text-base font-medium"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <span className="flex-1 px-4 py-2 text-gray-300 text-base font-medium">
                            {item.name}
                          </span>
                        )}
                        <button
                          onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                          className="p-2 text-gray-300 hover:text-white"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${openDropdown === item.name ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      {openDropdown === item.name && (
                        <div className="pl-4 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="block px-4 py-2 text-gray-400 hover:text-white text-sm"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block px-4 py-2 text-gray-300 hover:text-white text-base font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 px-4">
              <Link
                href="/leango/book/consultation"
                className="block w-full text-center px-5 py-3 bg-[#00a1f1] text-white text-sm font-medium rounded-lg hover:bg-[#0091d8] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Schedule Your First Session
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
