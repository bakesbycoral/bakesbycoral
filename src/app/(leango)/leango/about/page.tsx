import Image from 'next/image';
import {
  ContentHero,
  Section,
  SectionHeader,
  FeatureCards,
  CTASection
} from '@/components/leango';
import content from '@/../content/leango/about.json';

export const metadata = {
  title: 'About',
  description: content.hero.description,
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <ContentHero
        label={content.hero.label}
        title={content.hero.title}
        description={content.hero.description}
        variant="dark"
      />

      {/* Story */}
      <Section background="darker" label={content.story.label}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeader title={content.story.title} className="mb-8" dark />
            <div className="prose prose-lg prose-invert">
              {content.story.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-400">{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src="/leango/group.jpg"
              alt="LeanGo team working with clients"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      {/* Team */}
      <Section background="gradient" label={content.team.label}>
        <SectionHeader
          title={content.team.title}
          centered
          className="mb-12"
          dark
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.team.members.map((member, index) => (
            <div key={index} className="text-center">
              <div className="w-32 h-32 mx-auto bg-gray-700 rounded-full mb-4 border-2 border-[#00a1f1]/30" />
              <h3 className="text-lg font-semibold text-white">{member.name}</h3>
              <p className="text-sm text-[#00a1f1] mb-2">{member.role}</p>
              <p className="text-sm text-gray-400">{member.bio}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Values */}
      <Section background="dark" label={content.values.label}>
        <SectionHeader
          title={content.values.title}
          centered
          className="mb-12"
          dark
        />
        <FeatureCards
          cards={content.values.items.map(value => ({
            title: value.title,
            description: value.description,
          }))}
          columns={4}
          variant="glass"
        />
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
