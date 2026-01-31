import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Bakes by Coral. Learn about our gluten-free process, ordering, allergies, pickup, and more. Cincinnati gluten-free bakery.',
  openGraph: {
    title: 'FAQ | Bakes by Coral',
    description: 'Find answers to common questions about ordering gluten-free cakes and cookies from Bakes by Coral.',
  },
};

// FAQ Schema for Google rich results
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Are your products really 100% gluten-free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely! Every single product I make is 100% gluten-free and celiac-safe. I use only certified gluten-free ingredients and my recipes are developed and tested specifically for gluten-free baking.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you accommodate other allergies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'I can accommodate some allergies on a case-by-case basis. Please mention any allergies in your order form. Common allergens in my kitchen include dairy, eggs, nuts, and soy.',
      },
    },
    {
      '@type': 'Question',
      name: 'How far in advance should I order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For cookies, please order at least 1 week in advance. For cakes, I recommend 2 weeks notice. For wedding orders or large events, please reach out at least 4-6 weeks ahead.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you deliver?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All orders are pickup only in Cincinnati, Ohio unless delivery is arranged for weddings or events. I\'ll provide the address once your order is confirmed.',
      },
    },
    {
      '@type': 'Question',
      name: 'What forms of payment do you accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'I accept credit cards, Venmo, PayPal, Apple Pay, and Cash App.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I customize my order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely! I love creating custom designs. For cakes, share your vision and inspiration photos. For cookies, you can mix and match flavors.',
      },
    },
    {
      '@type': 'Question',
      name: 'How should I store my order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cookies are best stored at room temperature in an airtight container and enjoyed within 5 days. Cakes should be refrigerated if they have perishable fillings, but brought to room temperature before serving.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer tastings?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! I offer tasting boxes for couples planning wedding desserts. Cake tasting boxes include 4 flavors with fillings, and cookie boxes include 4 flavors. If you book within 30 days, the tasting fee is credited to your order.',
      },
    },
  ],
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
