'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface NavChild {
  name: string;
  href: string;
  description?: string;
  icon?: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  children?: NavChild[];
  megaMenu?: boolean;
}

const approachChildren: NavChild[] = [
  {
    name: 'Lean Problem Solving',
    href: '/leango/lean-problem-solving',
    description: 'Structured methods to fix problems permanently',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    name: 'Training & Certifications',
    href: '/leango/training',
    description: 'Build capability, not dependency',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-3-3l3 3 3-3" />
      </svg>
    ),
  },
  {
    name: 'Apps & Automation',
    href: '/leango/apps',
    description: 'Custom tools built around your workflow',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'Analytics & Dashboards',
    href: '/leango/analytics',
    description: 'Data that drives decisions, not just displays',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const navigation: NavItem[] = [
  { name: 'How We Work', href: '/leango/how-we-work' },
  {
    name: 'Our Approach',
    href: '/leango/our-approach',
    children: approachChildren,
    megaMenu: true,
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
                    {openDropdown === item.name && item.megaMenu && (
                      <div className="absolute top-full -left-32 pt-2">
                        <div className="bg-gray-900 rounded-xl shadow-2xl border border-white/10 p-4 grid grid-cols-2 gap-2 w-[520px]">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#00a1f1]/10 text-[#00a1f1] flex items-center justify-center group-hover:bg-[#00a1f1]/20 transition-colors">
                                {child.icon}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">{child.name}</div>
                                {child.description && (
                                  <div className="text-xs text-gray-400 mt-0.5">{child.description}</div>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    {openDropdown === item.name && !item.megaMenu && (
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
