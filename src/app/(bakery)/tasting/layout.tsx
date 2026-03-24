import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wedding Tasting Boxes',
  description: 'Find your wedding flavors — cake tasting boxes with 14 mini cake options, cookie tasting boxes & The All In Bride bundle. Gluten-free, Cincinnati pickup.',
  keywords: ['gluten-free tasting box', 'wedding cake tasting Cincinnati', 'mini cake tasting', 'cookie tasting box', 'wedding cake sampling', 'gluten-free wedding dessert'],
  openGraph: {
    title: 'Wedding Tasting Boxes | Bakes by Coral',
    description: 'Find your wedding flavors — cake tasting boxes, cookie tasting boxes & The All In Bride bundle. 100% gluten-free, made from scratch in Cincinnati.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Bakes by Coral wedding tasting boxes' }],
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
