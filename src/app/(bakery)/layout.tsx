import Header from '@/components/Header';
import Footer from '@/components/Footer';

// JSON-LD Structured Data for LocalBusiness
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Bakery',
  name: 'Bakes by Coral',
  description: 'Handcrafted gluten-free cookies and custom cakes made with love in Cincinnati, OH. 100% dedicated gluten-free kitchen.',
  url: 'https://bakesbycoral.com',
  logo: 'https://bakesbycoral.com/logo.png',
  image: 'https://bakesbycoral.com/og-image.jpg',
  telephone: '+1-513-633-7850',
  email: 'hello@bakesbycoral.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cincinnati',
    addressRegion: 'OH',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 39.1031,
    longitude: -84.5120,
  },
  areaServed: {
    '@type': 'City',
    name: 'Cincinnati',
  },
  priceRange: '$$',
  servesCuisine: ['Gluten-Free', 'Bakery', 'Desserts'],
  hasMenu: 'https://bakesbycoral.com/menu',
  acceptsReservations: true,
  sameAs: [
    'https://www.instagram.com/bakesbycoral',
    'https://www.facebook.com/bakesbycoral',
  ],
};

export const metadata = {
  title: {
    default: 'Bakes by Coral | Gluten-Free Bakery in Cincinnati, OH',
    template: '%s | Bakes by Coral',
  },
  description:
    'Handcrafted gluten-free cookies and custom cakes made with love in Cincinnati, OH. Order cookies, custom cakes, wedding desserts, and more. 100% gluten-free dedicated kitchen.',
};

export default function BakeryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#F7F3ED] text-neutral-900 min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
