import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gluten-Free Cookie Cups',
  description: 'Order gluten-free cookie cups for your next celebration — mini chocolate chip cups with vanilla buttercream, custom colors & designs. Cincinnati pickup.',
  keywords: ['gluten-free cookie cups', 'mini desserts Cincinnati', 'party desserts', 'gluten-free party treats', 'celiac safe desserts'],
  openGraph: {
    title: 'Gluten-Free Cookie Cups | Bakes by Coral',
    description: 'Order gluten-free cookie cups for your next celebration — mini chocolate chip cups with vanilla buttercream, custom colors & designs.',
    images: [{ url: '/cookie-cups.jpg', width: 1200, height: 630, alt: 'Gluten-free cookie cups with vanilla buttercream by Bakes by Coral' }],
  },
};

const cookieCupsSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Gluten-Free Cookie Cups',
    description: 'Mini chocolate chip cookie cups with vanilla buttercream. Customizable with piped designs, sprinkles, custom colors, chocolate molds, and edible glitter.',
    image: 'https://bakesbycoral.com/cookie-cups.jpg',
    brand: { '@type': 'Brand', name: 'Bakes by Coral' },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '30.00',
      highPrice: '120.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://bakesbycoral.com/cookie-cups',
    },
    category: 'Gluten-Free Desserts',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bakesbycoral.com' },
      { '@type': 'ListItem', position: 2, name: 'Cookie Cups', item: 'https://bakesbycoral.com/cookie-cups' },
    ],
  },
];

export default function CookieCupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {cookieCupsSchema.map((schema, i) => (
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
