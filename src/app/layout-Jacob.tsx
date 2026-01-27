import type { Metadata } from 'next';
import { Playfair_Display, PT_Serif } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  title: 'Bakes by Coral | Gluten-Free Baking You\'ll Actually Crave',
  description: 'Handcrafted gluten-free cakes and cookies in Cincinnati. Custom cakes for birthdays, weddings, and special events. Pickup only.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${ptSerif.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
