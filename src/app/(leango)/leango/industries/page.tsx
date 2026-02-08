import {
  ContentHero,
  Section,
  SectionHeader,
  CTASection
} from '@/components/leango';
import content from '@/../content/industries.json';

export const metadata = {
  title: 'Industries',
  description: content.hero.description,
};

export default function IndustriesPage() {
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

      {/* Industry Cards */}
      <Section background="darker">
        <div className="space-y-16">
          {content.industries.items.map((industry, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-12 items-start ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <h2 className="text-3xl font-bold text-white">{industry.title}</h2>
                <p className="mt-4 text-lg text-gray-300">{industry.description}</p>
                <p className="mt-4 text-sm text-gray-500">{industry.experience}</p>
              </div>
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                    Common Challenges We Address
                  </h3>
                  <ul className="space-y-3">
                    {industry.challenges.map((challenge, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-[#00a1f1] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-gray-400">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Cross-Industry */}
      <Section background="gradient" label={content.crossIndustry.label}>
        <SectionHeader
          title={content.crossIndustry.title}
          description={content.crossIndustry.description}
          className="mb-8"
          dark
        />
        <ul className="space-y-4 max-w-3xl">
          {content.crossIndustry.principles.map((principle, index) => (
            <li key={index} className="flex items-start gap-3">
              <svg className="w-6 h-6 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">{principle}</span>
            </li>
          ))}
        </ul>
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
