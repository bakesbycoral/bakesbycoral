import {
  ContentHero,
  Section,
  SectionHeader,
  FeatureCards,
  UseCaseGrid,
  ProcessSteps,
  CTASection
} from '@/components/leango';
import content from '@/../content/apps.json';

export const metadata = {
  title: 'Apps',
  description: content.hero.description,
};

export default function AppsPage() {
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

      {/* The Problem */}
      <Section background="darker" label={content.problem.label}>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionHeader
              title={content.problem.title}
              description={content.problem.description}
              dark
            />
          </div>
          <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/20">
            <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">
              Common Issues
            </h4>
            <ul className="space-y-3">
              {content.problem.issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-300">{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Our Approach */}
      <Section background="gradient" label={content.approach.label}>
        <SectionHeader
          title={content.approach.title}
          centered
          className="mb-12"
          dark
        />
        <FeatureCards cards={content.approach.items} variant="glass" />
      </Section>

      {/* Use Cases */}
      <Section background="dark" label={content.useCases.label}>
        <SectionHeader
          title={content.useCases.title}
          centered
          className="mb-12"
          dark
        />
        <UseCaseGrid cases={content.useCases.items} variant="dark" />
      </Section>

      {/* Apps + Analytics */}
      <Section background="darker" label={content.integration.label}>
        <div className="text-center max-w-3xl mx-auto">
          <SectionHeader
            title={content.integration.title}
            description={content.integration.description}
            centered
            dark
          />
        </div>
      </Section>

      {/* How We Build */}
      <Section background="gradient" label={content.process.label}>
        <SectionHeader
          title={content.process.title}
          centered
          className="mb-12"
          dark
        />
        <ProcessSteps steps={content.process.steps} variant="cards" />
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
