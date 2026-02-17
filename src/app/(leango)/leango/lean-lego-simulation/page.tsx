import Image from 'next/image';
import Link from 'next/link';
import {
  ContentHero,
  Section,
  SectionHeader,
  CTASection
} from '@/components/leango';
import content from '@/../content/leango/lean-lego-simulation.json';

export const metadata = {
  title: 'Lean Lego Simulation Training',
  description: content.hero.description,
};

export default function LeanLegoSimulationPage() {
  return (
    <>
      {/* Hero */}
      <ContentHero
        label="Lean Lego Simulation"
        labelColor="text-yellow-400"
        title={content.hero.title}
        description={content.hero.subtitle}
        primaryCta={{
          label: content.hero.primaryCta.label,
          href: '/leango/book/consultation'
        }}
        variant="dark"
      />

      {/* Why This Works */}
      <Section background="darker" label={content.whyThisWorks.title}>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-gray-400 mb-2">{content.whyThisWorks.intro} <span className="text-white font-semibold">This experience makes them real.</span></p>
            <p className="text-yellow-400 font-medium mt-6 mb-3">{content.whyThisWorks.teamsCanTitle}</p>
            <ul className="space-y-2">
              {content.whyThisWorks.teamsCan.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-[#00a1f1] mt-6">{content.whyThisWorks.closing}</p>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden w-full max-w-md">
            <Image
              src="/leango/terra-lego.jpg"
              alt="Teams learning through simulation"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      {/* What Is It */}
      <Section background="gradient">
        <SectionHeader
          title={<>{content.whatIsIt.title} <span className="text-yellow-400">{content.whatIsIt.titleHighlight}</span></>}
          centered
          className="mb-12"
          dark
        />
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <p className="text-yellow-400 font-medium">{content.whatIsIt.intro}</p>
              <p className="text-gray-300 mb-4">{content.whatIsIt.description}</p>
              <p className="text-white font-medium mb-3">{content.whatIsIt.challengesTitle}</p>
              <ul className="space-y-1">
                {content.whatIsIt.challenges.map((challenge, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white font-medium mb-3">{content.whatIsIt.impactTitle}</p>
              <ul className="space-y-1 mb-6">
                {content.whatIsIt.impacts.map((impact, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">{impact}</span>
                  </li>
                ))}
              </ul>
              <p className="text-yellow-400 font-semibold">{content.whatIsIt.closing}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Why Teams Love It */}
      <Section background="dark">
        <SectionHeader
          title={<>Why Teams <span className="italic text-yellow-400">Love</span> It!</>}
          centered
          className="mb-8"
          dark
        />
        <div className="max-w-2xl mx-auto">
          <ul className="space-y-3 mb-8">
            {content.whyTeamsLove.points.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">{point}</span>
              </li>
            ))}
          </ul>
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-3">{content.whyTeamsLove.mostImportantly}</p>
            <p className="text-white font-semibold text-xl">{content.whyTeamsLove.quote}</p>
          </div>
        </div>
      </Section>

      {/* Yellow Belt + How We Deliver */}
      <Section background="darker">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">{content.yellowBelt.title}</h3>
            <p className="text-gray-300 text-sm mb-4">{content.yellowBelt.intro}</p>
            <p className="text-white font-medium text-sm mb-2">{content.yellowBelt.focusTitle}</p>
            <ul className="space-y-1 mb-4">
              {content.yellowBelt.focus.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-[#00a1f1] text-sm">{content.yellowBelt.closing}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-[#00a1f1]/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-[#00a1f1] mb-4">{content.howWeDeliver.title}</h3>
            <p className="text-gray-300 text-sm mb-4">{content.howWeDeliver.intro}</p>
            <p className="text-white font-medium text-sm mb-2">{content.howWeDeliver.useTitle}</p>
            <ul className="space-y-1 mb-4">
              {content.howWeDeliver.uses.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-[#00a1f1] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-white font-medium text-sm mb-2">{content.howWeDeliver.teamsUseTitle}</p>
            <ul className="space-y-1">
              {content.howWeDeliver.teamsUse.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Training Options */}
      <Section background="gradient">
        <SectionHeader
          title={content.trainingOptions.title}
          description={content.trainingOptions.subtitle}
          centered
          className="mb-8"
          dark
        />
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {content.trainingOptions.options.map((option, i) => (
            <div key={i} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
              <div className="bg-yellow-400/20 px-5 py-3">
                <h4 className="text-yellow-300 font-semibold">{option.title}</h4>
              </div>
              <div className="p-5">
                <p className="text-gray-300 text-sm mb-4">{option.description}</p>
                {option.details && (
                  <ul className="space-y-2">
                    {option.details.map((detail, j) => (
                      <li key={j} className="text-sm">
                        <span className="text-white font-medium">{detail.title}:</span>
                        <span className="text-gray-400"> {detail.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/leango/book/consultation"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#00a1f1] text-white font-medium rounded-lg hover:bg-[#0091d8] transition-colors"
          >
            Schedule Your First Session
          </Link>
        </div>
      </Section>

      {/* Comparison */}
      <Section background="dark">
        <SectionHeader
          title={content.comparison.title}
          centered
          className="mb-8"
          dark
        />
        <div className="max-w-4xl mx-auto bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-700/50 bg-gray-800/50">
            <div className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">LeanGo Training</div>
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Others</div>
          </div>
          {content.comparison.items.map((item, i) => (
            <div key={i} className={`grid grid-cols-2 gap-4 p-4 ${i !== content.comparison.items.length - 1 ? 'border-b border-gray-700/50' : ''}`}>
              <div>
                <span className="text-white font-medium">{item.leango}</span>
                <p className="text-gray-400 text-sm">{item.leangoDesc}</p>
              </div>
              <div className="text-gray-500 text-sm">{item.others}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Perfect For + Benefits */}
      <Section background="darker">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <SectionHeader title={content.perfectFor.title} dark />
            <ul className="space-y-3 mt-6">
              {content.perfectFor.audiences.map((audience, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{audience}</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-500 italic text-sm mt-6">{content.perfectFor.note}</p>
          </div>

          <div>
            <SectionHeader title={content.benefits.title} dark />
            <ul className="space-y-4 mt-6">
              {content.benefits.items.slice(0, 4).map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <span className="text-white font-medium">{benefit.title}</span>
                    <p className="text-gray-400 text-sm">{benefit.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section background="gradient" label="What People Say">
        <div className="grid md:grid-cols-3 gap-6">
          {content.testimonials.map((testimonial, i) => (
            <div key={i} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-white font-bold mb-3">"{testimonial.headline}"</p>
              <p className="text-gray-400 text-sm mb-4">{testimonial.quote}</p>
              <div className="border-t border-gray-700/50 pt-3">
                <p className="text-white font-medium text-sm">{testimonial.name}</p>
                <p className="text-gray-500 text-xs">{testimonial.title}{testimonial.title && ', '}{testimonial.company}</p>
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
