'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ContentHero,
  Section,
  SectionHeader,
  CTASection
} from '@/components/leango';
import content from '@/../content/careers.json';

// Icons for the "Why Work With Us" section
const icons: Record<string, React.ReactNode> = {
  impact: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  growth: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  flexibility: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  team: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

// Benefit category icons
const benefitIcons: Record<string, React.ReactNode> = {
  'Health & Wellness': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  'Time Off': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  'Growth': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  'Work Setup': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

export default function CareersPage() {
  const [expandedPosition, setExpandedPosition] = useState<number | null>(null);

  return (
    <>
      {/* Hero */}
      <ContentHero
        label={content.hero.label}
        title={content.hero.title}
        description={content.hero.description}
        primaryCta={{
          ...content.hero.primaryCta,
          href: '#positions'
        }}
        variant="dark"
      />

      {/* Intro Section */}
      <Section background="darker">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              {content.intro.title}
            </h2>
            <p className="mt-6 text-lg text-gray-400 leading-relaxed">
              {content.intro.description}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#00a1f1]/10 to-[#66d200]/5 rounded-2xl p-8 border border-gray-800">
            <ul className="space-y-4">
              {content.intro.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#00a1f1] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Why Work With Us */}
      <Section background="gradient" label={content.whyWork.label}>
        <SectionHeader
          title={content.whyWork.title}
          centered
          className="mb-12"
          dark
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.whyWork.items.map((item, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#00a1f1]/50 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00a1f1]/20 to-[#00a1f1]/5 flex items-center justify-center text-[#00a1f1] mb-4 group-hover:scale-110 transition-transform">
                {icons[item.icon]}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Benefits & Perks */}
      <Section background="dark" label={content.benefits.label}>
        <SectionHeader
          title={content.benefits.title}
          centered
          className="mb-12"
          dark
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.benefits.items.map((category, index) => (
            <div
              key={index}
              className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#66d200]/20 flex items-center justify-center text-[#66d200]">
                  {benefitIcons[category.category]}
                </div>
                <h3 className="font-semibold text-white">{category.category}</h3>
              </div>
              <ul className="space-y-3">
                {category.perks.map((perk, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Open Positions */}
      <Section background="darker" label={content.positions.label} id="positions">
        <SectionHeader
          title={content.positions.title}
          centered
          className="mb-12"
          dark
        />
        <div className="max-w-4xl mx-auto space-y-4">
          {content.positions.items.map((position, index) => (
            <div
              key={index}
              className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden hover:border-[#00a1f1]/50 transition-all"
            >
              {/* Position Header */}
              <button
                onClick={() => setExpandedPosition(expandedPosition === index ? null : index)}
                className="w-full p-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{position.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00a1f1]/20 text-[#00a1f1]">
                        {position.location}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        {position.type}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#66d200]/20 text-[#66d200]">
                        {position.department}
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-500 transition-transform ${expandedPosition === index ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className="mt-3 text-gray-400">{position.description}</p>
              </button>

              {/* Expanded Content */}
              {expandedPosition === index && (
                <div className="px-6 pb-6 border-t border-gray-700/50 pt-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Requirements */}
                    <div>
                      <h4 className="text-sm font-semibold text-[#00a1f1] uppercase tracking-wider mb-4">
                        Requirements
                      </h4>
                      <ul className="space-y-3">
                        {position.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <svg className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Responsibilities */}
                    <div>
                      <h4 className="text-sm font-semibold text-[#66d200] uppercase tracking-wider mb-4">
                        What You&apos;ll Do
                      </h4>
                      <ul className="space-y-3">
                        {position.responsibilities.map((resp, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <svg className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Link
                      href={`/leango/contact?position=${encodeURIComponent(position.title)}`}
                      className="inline-flex items-center justify-center px-6 py-3 bg-[#00a1f1] text-white font-medium rounded-xl hover:bg-[#0091d8] hover:shadow-lg hover:shadow-[#00a1f1]/25 transition-all"
                    >
                      Apply for This Position
                    </Link>
                    <button className="inline-flex items-center justify-center px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-xl hover:border-gray-500 hover:text-white transition-all">
                      Share Position
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Hiring Process */}
      <Section background="gradient" label={content.process.label}>
        <SectionHeader
          title={content.process.title}
          description={content.process.description}
          centered
          className="mb-12"
          dark
        />
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-[#00a1f1] to-[#66d200] hidden md:block" />

            <div className="space-y-6">
              {content.process.steps.map((step, index) => (
                <div key={index} className="flex gap-6">
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#00a1f1] to-[#0091d8] flex items-center justify-center text-white font-bold text-lg relative z-10">
                    {step.step}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-gray-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Culture */}
      <Section background="dark" label={content.culture.label}>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionHeader
              title={content.culture.title}
              description={content.culture.description}
              dark
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {content.culture.points.map((point, index) => (
              <div
                key={index}
                className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50"
              >
                <h3 className="font-semibold text-white mb-2">{point.title}</h3>
                <p className="text-sm text-gray-400">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section background="darker" label={content.values.label}>
        <SectionHeader
          title={content.values.title}
          centered
          className="mb-12"
          dark
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.values.items.map((value, index) => (
            <div
              key={index}
              className="relative bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50 overflow-hidden group hover:border-[#00a1f1]/30 transition-all"
            >
              {/* Background number */}
              <span className="absolute -right-2 -top-4 text-8xl font-bold text-white/[0.02] group-hover:text-[#00a1f1]/[0.05] transition-colors">
                {index + 1}
              </span>
              <h3 className="text-lg font-semibold text-white mb-3 relative">{value.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed relative">{value.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <CTASection
        title={content.cta.title}
        description={content.cta.description}
        variant="gradient"
      />
    </>
  );
}
