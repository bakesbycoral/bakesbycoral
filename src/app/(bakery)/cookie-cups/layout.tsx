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

export default function CookieCupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
