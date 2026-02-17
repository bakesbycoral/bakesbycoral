import {
  ContentHero,
  Section,
  SectionHeader,
  CTASection
} from '@/components/leango';
import content from '@/../content/leango/lean-certifications.json';

export const metadata = {
  title: 'Lean Certifications',
  description: content.hero.description,
};

export default function LeanCertificationsPage() {
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

      {/* Intro */}
      <Section background="darker">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {content.intro.title}
          </h2>
          <p className="text-xl text-gray-400">
            {content.intro.description}
          </p>
        </div>
      </Section>

      {/* Lean Practitioner */}
      <Section background="gradient" label={content.practitioner.label}>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-[#00a1f1]/30 rounded-2xl overflow-hidden">
          <div className="bg-[#00a1f1]/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-[#00a1f1]">{content.practitioner.title}</h2>
            <span className="text-gray-400">{content.practitioner.duration}</span>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-6">{content.practitioner.description}</p>

            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-4">Ideal For</h3>
                <ul className="space-y-2">
                  {content.practitioner.idealFor.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-[#00a1f1] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">What You'll Learn</h3>
                <ul className="space-y-2">
                  {content.practitioner.outcomes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <h3 className="text-white font-semibold mb-3">{content.practitioner.format.title}</h3>
              <div className="flex flex-wrap gap-3">
                {content.practitioner.format.points.map((point, index) => (
                  <span key={index} className="bg-[#00a1f1]/10 text-[#00a1f1] text-sm px-3 py-1 rounded-full">
                    {point}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Lean Six Sigma */}
      <Section background="dark" label={content.sixSigma.label}>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-green-400/30 rounded-2xl overflow-hidden">
          <div className="bg-green-400/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-green-300">{content.sixSigma.title}</h2>
            <span className="text-gray-400">{content.sixSigma.duration}</span>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-6">{content.sixSigma.description}</p>

            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-4">Ideal For</h3>
                <ul className="space-y-2">
                  {content.sixSigma.idealFor.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">What You'll Learn</h3>
                <ul className="space-y-2">
                  {content.sixSigma.outcomes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <h3 className="text-white font-semibold mb-3">{content.sixSigma.format.title}</h3>
              <div className="flex flex-wrap gap-3">
                {content.sixSigma.format.points.map((point, index) => (
                  <span key={index} className="bg-green-400/10 text-green-400 text-sm px-3 py-1 rounded-full">
                    {point}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Comparison */}
      <Section background="darker">
        <SectionHeader
          title={content.comparison.title}
          centered
          className="mb-12"
          dark
        />
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-[#00a1f1]/10 border border-[#00a1f1]/30 rounded-xl p-6">
            <h3 className="text-[#00a1f1] font-semibold mb-4">{content.comparison.practitioner.title}</h3>
            <ul className="space-y-3">
              {content.comparison.practitioner.points.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#00a1f1] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
            <h3 className="text-green-300 font-semibold mb-4">{content.comparison.sixSigma.title}</h3>
            <ul className="space-y-3">
              {content.comparison.sixSigma.points.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Why Ours */}
      <Section background="gradient">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            {content.whyOurs.title}
          </h2>
          <ul className="space-y-4">
            {content.whyOurs.points.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">{point}</span>
              </li>
            ))}
          </ul>
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
