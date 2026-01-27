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

export const metadata: Metadata = {
  title: {
    default: 'Bakes by Coral | Gluten-Free Baked Goods in Cincinnati',
    template: '%s | Bakes by Coral',
  },
  description:
    'Handcrafted gluten-free cookies and custom cakes made with love in Cincinnati, OH. Order cookies, custom cakes, and wedding desserts.',
  keywords: ['gluten-free', 'bakery', 'Cincinnati', 'cookies', 'cakes', 'wedding cakes', 'custom cakes'],
  authors: [{ name: 'Bakes by Coral' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Bakes by Coral',
    title: 'Bakes by Coral | Gluten-Free Baked Goods in Cincinnati',
    description:
      'Handcrafted gluten-free cookies and custom cakes made with love in Cincinnati, OH.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${ptSerif.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#F7F3ED] text-neutral-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
