import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cake Tasting Boxes',
  description: 'Sample gluten-free mini cakes before your wedding — 14 curated flavors with filling pairings & mock swiss buttercream. 4 count $55, 6 count $75. Cincinnati pickup.',
  keywords: ['gluten-free tasting box', 'wedding cake tasting Cincinnati', 'mini cake tasting', 'gluten-free cake flavors', 'wedding cake sampling'],
  openGraph: {
    title: 'Cake Tasting Boxes | Bakes by Coral',
    description: 'Sample gluten-free mini cakes before your wedding — 14 curated flavors with filling pairings & mock swiss buttercream.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Bakes by Coral cake tasting boxes' }],
  },
};

const tastingBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bakesbycoral.com' },
    { '@type': 'ListItem', position: 2, name: 'Tasting Boxes', item: 'https://bakesbycoral.com/tasting' },
  ],
};

export default function TastingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tastingBreadcrumb) }}
      />
      {children}
    </>
  );
}
