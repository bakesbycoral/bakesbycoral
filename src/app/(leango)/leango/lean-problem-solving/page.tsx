import {
  ContentHero,
  Section,
  SectionHeader,
  FeatureCards,
  CTASection
} from '@/components/leango';
import content from '@/../content/lean-problem-solving.json';

export const metadata = {
  title: 'Lean Problem Solving',
  description: content.hero.description,
};

export default function LeanProblemSolvingPage() {
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

      {/* The Challenge */}
      <Section background="darker" label={content.challenge.label}>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionHeader
              title={content.challenge.title}
              description={content.challenge.description}
              dark
            />
          </div>
          <ul className="space-y-4">
            {content.challenge.points.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-gray-300">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Our Approach */}
      <Section background="gradient" label={content.approach.label}>
        <SectionHeader
          title={content.approach.title}
          description={content.approach.description}
          className="mb-12"
          dark
        />
        <div className="space-y-6">
          {content.approach.methods.map((method, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 flex gap-6 items-start"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00a1f1]/20 flex items-center justify-center">
                <span className="text-[#00a1f1] font-bold">{index + 1}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{method.title}</h3>
                <p className="text-gray-400">{method.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Tools We Use */}
      <Section background="darker" label={content.tools.label}>
        <SectionHeader
          title={content.tools.title}
          description={content.tools.description}
          centered
          className="mb-12"
          dark
        />
        <FeatureCards
          cards={content.tools.items.map(item => ({
            title: item.title,
            description: item.description,
          }))}
          columns={4}
          variant="dark"
        />
      </Section>

      {/* Results */}
      <Section background="dark" label={content.results.label}>
        <SectionHeader
          title={content.results.title}
          centered
          className="mb-12"
          dark
        />
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {content.results.items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-gray-800/50 border border-gray-700/50 rounded-xl p-5"
            >
              <svg className="w-6 h-6 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <div className="text-lg font-semibold text-white mb-1">{item.metric}</div>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
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
