import Image from 'next/image';
import Link from 'next/link';
import {
  ContentHero,
  Section,
  SectionHeader,
  FeatureCards,
  FeatureIcons,
  ProcessSteps,
  CTASection
} from '@/components/leango';
import content from '@/../content/how-we-work.json';

export const metadata = {
  title: 'How We Work',
  description: content.hero.description,
};

export default function HowWeWorkPage() {
  return (
    <>
      {/* Hero */}
      <ContentHero
        label={content.hero.label}
        title={content.hero.title}
        description={content.hero.description}
        primaryCta={{
          ...content.hero.primaryCta,
          href: '/leango/book/consultation'
        }}
        variant="dark"
      />

      {/* Value Props */}
      <Section background="darker">
        <FeatureCards
          cards={content.valueProps.items.map(item => ({
            ...item,
            icon: FeatureIcons[item.icon as keyof typeof FeatureIcons],
          }))}
          columns={4}
          variant="glass"
        />
      </Section>

      {/* Process */}
      <Section background="gradient" label={content.process.label}>
        <SectionHeader
          title={content.process.title}
          description={content.process.subtitle}
          className="mb-12"
          dark
        />
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <ProcessSteps steps={content.process.steps} variant="numbered" />
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden lg:sticky lg:top-32">
            <Image
              src="/leango/group.jpg"
              alt="LeanGo team working with clients"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      {/* Why This Matters */}
      <Section background="dark" label={content.whyMatters.label}>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionHeader
              title={content.whyMatters.title}
              description={content.whyMatters.description}
              dark
            />
          </div>
          <div>
            <ul className="space-y-4">
              {content.whyMatters.points.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{point}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-white font-medium">
              {content.whyMatters.closing}
            </p>
          </div>
        </div>
      </Section>

      {/* Our Role */}
      <Section background="gradient" label={content.ourRole.label}>
        <SectionHeader
          title={content.ourRole.title}
          description={content.ourRole.subtitle}
          className="mb-12"
          dark
        />
        <div className="grid lg:grid-cols-2 gap-12">
          {/* We Provide */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-white mb-6">We provide:</h3>
            <ul className="space-y-4">
              {content.ourRole.weProvide.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00a1f1] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">
                    <strong className="text-white">{item.title}</strong> - {item.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Your Team Provides */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-white mb-6">Your team provides:</h3>
            <ul className="space-y-4">
              {content.ourRole.youProvide.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xl font-semibold text-white">
          {content.ourRole.closing}
        </p>
      </Section>

      {/* Tools Table */}
      <Section background="darker" label={content.tools.label}>
        <SectionHeader
          title={content.tools.title}
          description={content.tools.intro}
          className="mb-12"
          dark
        />
        <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-700/50 bg-gray-800/50">
            <div className="text-sm font-semibold text-white uppercase tracking-wider">What We Use</div>
            <div className="text-sm font-semibold text-white uppercase tracking-wider">How It Helps</div>
          </div>
          {content.tools.items.map((item, index) => (
            <div key={index} className={`grid grid-cols-2 gap-4 p-4 ${index !== content.tools.items.length - 1 ? 'border-b border-gray-700/50' : ''}`}>
              <div className="font-medium">
                <Link href={item.href} className="text-white hover:text-[#00a1f1] transition-colors">
                  {item.tool}
                </Link>
              </div>
              <div className="text-[#00a1f1]">{item.benefit}</div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href={content.tools.ctaHref}
            className="inline-flex items-center gap-2 bg-[#00a1f1] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0091d6] transition-colors"
          >
            {content.tools.ctaLabel}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
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
