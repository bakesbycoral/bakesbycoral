import Image from 'next/image';
import Link from 'next/link';
import {
  ContentHero,
  Section,
  SectionHeader,
  FeatureCards,
  CTASection
} from '@/components/leango';
import content from '@/../content/leango/training.json';

export const metadata = {
  title: 'Training',
  description: content.hero.description,
};

export default function TrainingPage() {
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

      {/* When Certification Makes Sense */}
      <Section background="darker" label={content.whenCertification.label}>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionHeader
              title={content.whenCertification.title}
              description={content.whenCertification.description}
              dark
            />
            <ul className="space-y-4 mt-6">
              {content.whenCertification.scenarios.map((scenario, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#00a1f1] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{scenario}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
            <Image
              src="/leango/lego-certs.jpg"
              alt="Team members receiving lean certifications"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      {/* How We Deliver */}
      <Section background="gradient" label={content.delivery.label}>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionHeader
              title={content.delivery.title}
              description={content.delivery.description}
              dark
            />
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {content.delivery.approach.map((item, index) => (
                <div key={index} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
            <Image
              src="/leango/terra-lego.jpg"
              alt="Hands-on lean simulation training"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      {/* Certification Programs */}
      <Section background="dark" label={content.certifications.label}>
        <SectionHeader
          title={content.certifications.title}
          centered
          className="mb-12"
          dark
        />
        <div className="grid lg:grid-cols-3 gap-8">
          {content.certifications.items.map((cert, index) => (
            <Link
              key={index}
              href={cert.color === 'yellow' ? '/leango/lean-lego-simulation' : '/leango/lean-certifications'}
              className={`block bg-gray-800/50 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 ${
                cert.color === 'yellow' ? 'border border-yellow-400/30 hover:border-yellow-400/50' :
                cert.color === 'green' ? 'border border-green-400/30 hover:border-green-400/50' :
                'border border-[#00a1f1]/30 hover:border-[#00a1f1]/50'
              }`}
            >
              <div className={`px-6 py-4 ${
                cert.color === 'yellow' ? 'bg-yellow-400/20' :
                cert.color === 'green' ? 'bg-green-400/20' :
                'bg-[#00a1f1]/20'
              }`}>
                <h3 className={`text-xl font-semibold ${
                  cert.color === 'yellow' ? 'text-yellow-300' :
                  cert.color === 'green' ? 'text-green-300' :
                  'text-[#00a1f1]'
                }`}>{cert.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{cert.duration}</p>
              </div>
              <div className="p-6">
                <p className="text-gray-400 mb-6">{cert.description}</p>
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                  What You&apos;ll Learn
                </h4>
                <ul className="space-y-2">
                  {cert.outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        cert.color === 'yellow' ? 'text-yellow-400' :
                        cert.color === 'green' ? 'text-green-400' :
                        'text-[#00a1f1]'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
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
