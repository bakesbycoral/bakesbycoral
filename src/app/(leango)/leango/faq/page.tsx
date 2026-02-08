'use client';

import { useState } from 'react';
import {
  ContentHero,
  Section,
  CTASection
} from '@/components/leango';
import content from '@/../content/faq.json';

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <ContentHero
        label={content.hero.label}
        title={content.hero.title}
        description={content.hero.description}
        variant="dark"
      />

      {content.categories.map((category, catIndex) => (
        <Section
          key={catIndex}
          background={catIndex % 2 === 0 ? 'darker' : 'dark'}
          label={category.title}
        >
          <div className="max-w-3xl mx-auto space-y-3">
            {category.questions.map((item, qIndex) => {
              const key = `${catIndex}-${qIndex}`;
              const isOpen = openItems[key];

              return (
                <div
                  key={qIndex}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(key)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-700/20 transition-colors"
                  >
                    <span className="text-white font-medium pr-4">{item.question}</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4">
                      <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      ))}

      <CTASection
        title={content.cta.title}
        description={content.cta.description}
        variant="gradient"
      />
    </>
  );
}
