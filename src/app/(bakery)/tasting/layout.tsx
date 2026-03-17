import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tasting Boxes',
  description: 'Try before you order — sample gluten-free cake flavors and fillings with a tasting box from Bakes by Coral. Perfect for weddings and celebrations.',
  keywords: ['gluten-free tasting box', 'wedding cake tasting Cincinnati', 'cake sampling', 'gluten-free cake flavors'],
  openGraph: {
    title: 'Tasting Boxes | Bakes by Coral',
    description: 'Try before you order — sample gluten-free cake flavors and fillings with a tasting box. Perfect for weddings and celebrations.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Bakes by Coral tasting boxes' }],
  },
};

export default function TastingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
