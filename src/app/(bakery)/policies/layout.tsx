import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Policies',
  description: "Review Bakes by Coral's ordering policies — lead times, payment options, pickup details, cancellations & allergen info for our gluten-free bakery.",
  openGraph: {
    title: 'Policies | Bakes by Coral',
    description: "Review Bakes by Coral's ordering policies — lead times, payment options, pickup details, cancellations & allergen info.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Bakes by Coral policies' }],
  },
};

const policiesBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bakesbycoral.com' },
    { '@type': 'ListItem', position: 2, name: 'Policies', item: 'https://bakesbycoral.com/policies' },
  ],
};

export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(policiesBreadcrumb) }}
      />
      {children}
    </>
  );
}
