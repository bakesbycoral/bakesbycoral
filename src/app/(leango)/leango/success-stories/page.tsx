import Image from 'next/image';
import {
  ContentHero,
  Section,
  SectionHeader,
  CTASection
} from '@/components/leango';
import content from '@/../content/leango/success-stories.json';

export const metadata = {
  title: 'Success Stories',
  description: content.hero.description,
};

export default function SuccessStoriesPage() {
  return (
    <>
      {/* Hero */}
      <ContentHero
        label={content.hero.label}
        title={content.hero.title}
        description={content.hero.description}
        primaryCta={{
          label: 'Start Your Transformation',
          href: '/leango/book/consultation'
        }}
        variant="dark"
      />

      {/* Metrics */}
      <Section background="gradient" label={content.metrics.label}>
        <SectionHeader
          title={content.metrics.title}
          centered
          className="mb-12"
          dark
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {content.metrics.items.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#00a1f1] to-[#66d200] bg-clip-text text-transparent">
                {metric.value}
              </div>
              <div className="mt-2 text-gray-400 text-sm">{metric.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Success Stories */}
      <Section background="darker">
        <div className="space-y-16">
          {content.stories.map((story, index) => (
            <div
              key={index}
              className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#00a1f1]/20 to-[#66d200]/10 px-8 py-6 border-b border-gray-700/50">
                <div className="flex flex-wrap items-center gap-4">
                  <h2 className="text-2xl font-bold text-white">{story.company}</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#00a1f1]/20 text-[#00a1f1]">
                    {story.industry}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Challenge & Solution */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-[#00a1f1] uppercase tracking-wider mb-2">
                        The Challenge
                      </h3>
                      <p className="text-gray-300">{story.challenge}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#66d200] uppercase tracking-wider mb-2">
                        Our Approach
                      </h3>
                      <p className="text-gray-300">{story.solution}</p>
                    </div>
                  </div>

                  {/* Results */}
                  <div>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                      Results Achieved
                    </h3>
                    <ul className="space-y-3">
                      {story.results.map((result, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-300">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Quote */}
                <div className="mt-8 pt-8 border-t border-gray-700/50">
                  <blockquote className="relative">
                    <svg className="absolute -top-2 -left-2 w-8 h-8 text-[#00a1f1]/20" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
                    </svg>
                    <p className="text-lg text-gray-300 italic pl-6">
                      &ldquo;{story.quote}&rdquo;
                    </p>
                    <footer className="mt-3 pl-6 text-sm text-gray-500">
                      &mdash; {story.author}, {story.company}
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section background="gradient">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {content.cta.title}
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              {content.cta.description}
            </p>
            <a
              href="/leango/book/consultation"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#00a1f1] text-white font-medium rounded-lg hover:bg-[#0091d8] transition-colors"
            >
              Schedule Your First Session
            </a>
          </div>
          <div className="relative aspect-square rounded-2xl overflow-hidden">
            <Image
              src="/leango/northglenn-group.jpg"
              alt="LeanGo team celebrating success with a client"
              fill
              className="object-cover object-[center_75%]"
            />
          </div>
        </div>
      </Section>
    </>
  );
}
