import type { Metadata } from 'next';
import { Playfair_Display, PT_Serif } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
});

const ptSerif = PT_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-pt-serif',
});

const baseUrl = 'https://bakesbycoral.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Bakes by Coral | Gluten-Free Bakery in Cincinnati, OH',
    template: '%s | Bakes by Coral',
  },
  description:
    'Handcrafted gluten-free cookies and custom cakes made with love in Cincinnati, OH. Order cookies, custom cakes, wedding desserts, and more. 100% gluten-free dedicated kitchen.',
  keywords: [
    'gluten-free bakery',
    'gluten-free cookies',
    'gluten-free cakes',
    'Cincinnati bakery',
    'custom cakes Cincinnati',
    'wedding cakes Cincinnati',
    'gluten-free wedding cake',
    'celiac safe bakery',
    'gluten-free desserts Ohio',
    'Bakes by Coral',
  ],
  authors: [{ name: 'Bakes by Coral' }],
  creator: 'Bakes by Coral',
  publisher: 'Bakes by Coral',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Bakes by Coral',
    title: 'Bakes by Coral | Gluten-Free Bakery in Cincinnati, OH',
    description:
      'Handcrafted gluten-free cookies and custom cakes made with love in Cincinnati, OH. 100% dedicated gluten-free kitchen.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bakes by Coral - Gluten-Free Bakery in Cincinnati',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bakes by Coral | Gluten-Free Bakery in Cincinnati',
    description: 'Handcrafted gluten-free cookies and custom cakes made with love in Cincinnati, OH.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'JxhVRIEhsir-J6jEOLTmZlb6wzVKw23P8hRDYWavS5A',
  },
};

// JSON-LD Structured Data for LocalBusiness
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Bakery',
  name: 'Bakes by Coral',
  description: 'Handcrafted gluten-free cookies and custom cakes made with love in Cincinnati, OH. 100% dedicated gluten-free kitchen.',
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  image: `${baseUrl}/og-image.jpg`,
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
    latitude: 39.1031, // Cincinnati approximate
    longitude: -84.5120,
  },
  areaServed: {
    '@type': 'City',
    name: 'Cincinnati',
  },
  priceRange: '$$',
  servesCuisine: ['Gluten-Free', 'Bakery', 'Desserts'],
  hasMenu: `${baseUrl}/menu`,
  acceptsReservations: true,
  sameAs: [
    'https://www.instagram.com/bakesbycoral',
    'https://www.facebook.com/bakesbycoral',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${ptSerif.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F7F3ED] text-neutral-900 antialiased overflow-x-hidden">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
