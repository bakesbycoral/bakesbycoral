import Image from 'next/image';
import {
  ContentHero,
  Section,
  SectionHeader,
  LogoGrid,
  FeatureCards,
  FeatureIcons,
  UseCaseGrid,
  CTASection,
  NewsletterSignup
} from '@/components/leango';
import homeContent from '@/../content/home.json';

export default function LeanGoHomePage() {
  return (
    <>
      {/* Hero */}
      <ContentHero
        title={homeContent.hero.title}
        description={homeContent.hero.description}
        primaryCta={{
          ...homeContent.hero.primaryCta,
          href: '/leango/book/consultation'
        }}
        secondaryCta={{
          ...homeContent.hero.secondaryCta,
          href: '/leango/how-we-work'
        }}
        centered
        variant="dark"
      />

      {/* Logo Grid - Dark section flowing from hero */}
      <Section background="darker">
        <LogoGrid
          title={homeContent.logos.title}
          logos={homeContent.logos.items}
          variant="dark"
        />
      </Section>

      {/* Challenges - Glass cards on dark gradient */}
      <Section background="gradient" label={homeContent.challenges.label}>
        <SectionHeader
          title={homeContent.challenges.title}
          description={homeContent.challenges.description}
          centered
          className="mb-12"
          dark
        />
        <FeatureCards
          cards={homeContent.challenges.items.map((item: { title: string; description: string; icon: string }) => ({
            ...item,
            icon: FeatureIcons[item.icon as keyof typeof FeatureIcons],
            iconColor: 'bg-red-500/20 text-red-400',
          }))}
          variant="glass"
        />
      </Section>

      {/* How We Work */}
      <Section background="darker" label={homeContent.process.label}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {homeContent.process.title}
          </h2>
          <p className="text-lg text-gray-400 mb-16">
            {homeContent.process.intro}
          </p>

          {/* What This Looks Like */}
          <div className="mb-16">
            <h3 className="text-xl font-bold text-white mb-6">What this looks like</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {homeContent.process.whatItLooksLike.map((item: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-xl font-semibold text-white">
              {homeContent.process.tagline}
            </p>
          </div>

          <div className="border-t border-gray-800 pt-16">
            {/* Our Approach */}
            <h3 className="text-xl font-bold text-white mb-6">
              Our approach
            </h3>
            <ol className="space-y-3 mb-16">
              {homeContent.process.approach.items.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-4 text-gray-300">
                  <span className="text-[#00a1f1] font-semibold">{idx + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>

            {/* Results */}
            <h3 className="text-xl font-bold text-white mb-6">
              This is why our clients see
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {homeContent.process.results.items.map((item: string, idx: number) => (
                <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-xl px-5 py-4 text-gray-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Approach - 2x2 grid with links */}
      <Section background="gradient" label={homeContent.approach.label}>
        <SectionHeader
          title={homeContent.approach.title}
          centered
          className="mb-12"
          dark
        />
        <UseCaseGrid
          cases={homeContent.approach.items.map((item: { title: string; description: string; href: string }) => ({
            ...item,
            href: `/leango${item.href}`
          }))}
          columns={2}
          variant="dark"
        />
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
            <Image
              src="/leango/northglenn-group.jpg"
              alt="LeanGo team working with clients"
              fill
              className="object-cover object-[center_65%]"
            />
          </div>
        </div>
      </Section>

      {/* Newsletter */}
      <section className="relative py-24 bg-gray-950 overflow-hidden">
        {/* Accent stripe */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#00a1f1]/30 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-[#00a1f1] to-[#0077b5] rounded-3xl p-1">
            <div className="bg-gray-950 rounded-[22px] px-8 py-12 lg:px-16 lg:py-16">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a1f1]/10 border border-[#00a1f1]/20 text-sm font-medium text-[#00a1f1] mb-4">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Newsletter
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-bold text-white">
                    Stay Ahead of the Curve
                  </h2>
                  <p className="mt-4 text-lg text-gray-400">
                    Join operations leaders getting weekly insights on lean methodology, continuous improvement, and operational excellence.
                  </p>
                </div>
                <div>
                  <NewsletterSignup
                    variant="inline"
                    title=""
                    description=""
                  />
                  <p className="mt-4 text-xs text-gray-500">
                    No spam, ever. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        title={homeContent.cta.title}
        description={homeContent.cta.description}
        primaryCta={{
          ...homeContent.cta.primaryCta,
          href: '/leango/book/consultation'
        }}
        variant="gradient"
      />
    </>
  );
}
