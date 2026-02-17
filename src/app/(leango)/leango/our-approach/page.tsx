import Link from 'next/link';
import Image from 'next/image';
import {
  ContentHero,
  Section,
  SectionHeader,
  CTASection
} from '@/components/leango';
import content from '@/../content/our-approach.json';

export const metadata = {
  title: 'Our Approach',
  description: content.hero.description,
};

export default function OurApproachPage() {
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

      {/* Tools Intro */}
      <Section background="darker">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {content.toolsIntro.title}
          </h2>
          <p className="text-lg text-white font-medium mb-4">
            {content.toolsIntro.description}
          </p>
          <p className="text-gray-400 italic mb-4">
            Why? {content.toolsIntro.why}
          </p>
          <p className="text-lg text-white font-medium">
            We flip that.
          </p>
          <p className="text-[#00a1f1] mt-2">
            {content.toolsIntro.flip}
          </p>
        </div>
      </Section>

      {/* Lean Problem Solving */}
      <Section background="gradient">
        <Link href="/leango/lean-problem-solving" className="group block">
          <span className="bg-[#66d200]/20 text-[#66d200] text-sm font-semibold px-4 py-2 rounded-t-xl inline-block mb-0 group-hover:bg-[#66d200]/30 transition-colors">
            {content.lean.label}
          </span>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl rounded-tl-none p-6 group-hover:border-[#66d200]/30 transition-colors">
            <p className="text-lg italic text-white mb-4">{content.lean.subtitle}</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-white font-medium mb-3">{content.lean.title}:</p>
                <ul className="space-y-1 mb-4">
                  {content.lean.questions.map((q, i) => (
                    <li key={i} className="text-[#00a1f1] italic text-sm">• {q}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-white font-medium mb-3">{content.lean.helpTitle}</p>
                <ul className="space-y-1">
                  {content.lean.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-700/50">
              <div>
                <p className="text-white font-semibold">{content.lean.closing}</p>
                <p className="text-[#00a1f1] text-sm">{content.lean.closingSub}</p>
              </div>
              <span className="inline-flex items-center justify-center px-5 py-2 bg-[#00a1f1] text-white text-sm font-medium rounded-lg group-hover:bg-[#0091d8] transition-colors ml-auto">
                Learn More
              </span>
            </div>
          </div>
        </Link>
      </Section>

      {/* Digitization */}
      <Section background="darker">
        <Link href="/leango/apps" className="group block">
          <span className="bg-[#66d200]/20 text-[#66d200] text-sm font-semibold px-4 py-2 rounded-t-xl inline-block mb-0 group-hover:bg-[#66d200]/30 transition-colors">
            {content.apps.label}
          </span>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl rounded-tl-none p-6 group-hover:border-[#66d200]/30 transition-colors">
            <p className="text-lg italic text-white mb-2">{content.apps.subtitle}</p>
            <p className="text-gray-300 mb-4">{content.apps.title} {content.apps.description}</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-white font-medium mb-3">{content.apps.examplesTitle}</p>
                <ul className="space-y-1">
                  {content.apps.examples.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-[#00a1f1] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-white font-medium mb-3">{content.apps.benefitsTitle}</p>
                <ul className="space-y-1">
                  {content.apps.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-700/50">
              <p className="text-white font-semibold">{content.apps.closing}</p>
              <span className="inline-flex items-center justify-center px-5 py-2 bg-[#00a1f1] text-white text-sm font-medium rounded-lg group-hover:bg-[#0091d8] transition-colors ml-auto">
                Explore Apps
              </span>
            </div>
          </div>
        </Link>
      </Section>

      {/* Analytics */}
      <Section background="dark">
        <Link href="/leango/analytics" className="group block">
          <span className="bg-[#66d200]/20 text-[#66d200] text-sm font-semibold px-4 py-2 rounded-t-xl inline-block mb-0 group-hover:bg-[#66d200]/30 transition-colors">
            {content.analytics.label}
          </span>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl rounded-tl-none p-6 group-hover:border-[#66d200]/30 transition-colors">
            <p className="text-lg italic text-white mb-2">{content.analytics.subtitle}</p>
            <p className="text-gray-300 mb-4">{content.analytics.title} - {content.analytics.description}</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-white font-medium mb-3">{content.analytics.helpTitle}</p>
                <ul className="space-y-1">
                  {content.analytics.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-700/50">
              <div>
                <p className="text-white font-semibold">{content.analytics.closing}</p>
                <p className="text-gray-400 text-sm">{content.analytics.closingSub}</p>
              </div>
              <span className="inline-flex items-center justify-center px-5 py-2 bg-[#00a1f1] text-white text-sm font-medium rounded-lg group-hover:bg-[#0091d8] transition-colors ml-auto">
                Improve Your Analytics
              </span>
            </div>
          </div>
        </Link>
      </Section>

      {/* Training */}
      <Section background="gradient">
        <Link href="/leango/training" className="bg-[#66d200]/20 text-[#66d200] text-sm font-semibold px-4 py-2 rounded-t-xl inline-block mb-0 hover:bg-[#66d200]/30 transition-colors">
          {content.training.label}
        </Link>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl rounded-tl-none p-6">
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <div>
              <p className="text-lg italic text-white mb-2">{content.training.subtitle}</p>
              <p className="text-gray-300 mb-4">{content.training.title}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white font-medium mb-3">{content.training.weTrainTitle}</p>
                  <ul className="space-y-1">
                    {content.training.weTrain.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <svg className="w-4 h-4 text-[#00a1f1] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-300">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-white font-medium mb-3">{content.training.focusTitle}</p>
                  <ul className="space-y-1">
                    {content.training.focus.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <svg className="w-4 h-4 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-white font-semibold italic">{content.training.closing}</p>
                <Link
                  href="/leango/training"
                  className="inline-flex items-center justify-center px-5 py-2 bg-[#00a1f1] text-white text-sm font-medium rounded-lg hover:bg-[#0091d8] transition-colors ml-auto"
                >
                  View Programs
                </Link>
              </div>
            </div>

            {/* Certification Cards */}
            <div className="grid gap-3">
              {content.training.certifications.map((cert, i) => (
                <Link
                  key={i}
                  href={cert.color === 'yellow' ? '/leango/lean-lego-simulation' : '/leango/lean-certifications'}
                  className={`block rounded-lg overflow-hidden border transition-all hover:-translate-y-0.5 ${
                    cert.color === 'yellow' ? 'border-yellow-400/30 hover:border-yellow-400/50' :
                    cert.color === 'green' ? 'border-green-400/30 hover:border-green-400/50' :
                    'border-[#00a1f1]/30 hover:border-[#00a1f1]/50'
                  }`}
                >
                  <div className={`px-3 py-1.5 font-semibold text-sm ${
                    cert.color === 'yellow' ? 'bg-yellow-400/20 text-yellow-300' :
                    cert.color === 'green' ? 'bg-green-400/20 text-green-300' :
                    'bg-[#00a1f1]/20 text-[#00a1f1]'
                  }`}>
                    {cert.title.toUpperCase()}
                  </div>
                  <div className="p-3 bg-gray-900/50">
                    <p className="text-xs text-gray-400 mb-2">{cert.who}</p>
                    <span
                      className={`text-xs font-medium ${
                        cert.color === 'yellow' ? 'text-yellow-400' :
                        cert.color === 'green' ? 'text-green-400' :
                        'text-[#00a1f1]'
                      }`}
                    >
                      {cert.cta}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* How It All Comes Together */}
      <Section background="darker">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {content.together.title}
          </h2>
          <p className="text-xl text-gray-400">
            {content.together.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-white font-medium mb-4">{content.together.weaveTitle}</p>
            <ol className="space-y-3 mb-8">
              {content.together.weave.map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-gray-300">
                  <span className="text-[#00a1f1] font-semibold">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>

            <p className="text-white font-medium mb-4">{content.together.resultsTitle}</p>
            <ul className="space-y-2">
              {content.together.results.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/leango/group.jpg"
                alt="LeanGo team"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/leango/lego-certs.jpg"
                alt="Team certifications"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/leango/terra-lego.jpg"
                alt="Training session"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/leango/northglenn-group.jpg"
                alt="Client success"
                fill
                className="object-cover"
              />
            </div>
          </div>
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
