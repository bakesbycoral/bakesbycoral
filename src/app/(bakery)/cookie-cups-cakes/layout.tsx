import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gluten-Free Cookie Cups & Cookie Cakes',
  description: 'Order gluten-free cookie cups and cookie cakes in Cincinnati. Custom colors, piped designs, messaging, and celebration-ready details included.',
  keywords: ['gluten-free cookie cake', 'gluten-free cookie cups', 'Cincinnati desserts', 'custom cookie cake', 'party desserts'],
  openGraph: {
    title: 'Gluten-Free Cookie Cups & Cookie Cakes | Bakes by Coral',
    description: 'Custom gluten-free cookie cups and thick chocolate chip cookie cakes for birthdays, showers, and celebrations.',
    images: [{ url: '/cookie-cups.jpg', width: 1200, height: 630, alt: 'Gluten-free cookie cups and cookie cakes by Bakes by Coral' }],
  },
};

const cookieCupsAndCakesSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Gluten-Free Cookie Cups & Cookie Cakes',
    description: 'Mini chocolate chip cookie cups and thick chocolate chip cookie cakes with buttercream, piped designs, custom colors, and messaging.',
    image: 'https://bakesbycoral.com/cookie-cups.jpg',
    brand: { '@type': 'Brand', name: 'Bakes by Coral' },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '25.00',
      highPrice: '120.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://bakesbycoral.com/cookie-cups-cakes',
    },
    category: 'Gluten-Free Desserts',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bakesbycoral.com' },
      { '@type': 'ListItem', position: 2, name: 'Cookie Cups & Cakes', item: 'https://bakesbycoral.com/cookie-cups-cakes' },
    ],
  },
];

export default function CookieCupsAndCakesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {cookieCupsAndCakesSchema.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {children}
    </>
  );
}
