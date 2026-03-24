import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Cookies',
  description: 'Order gluten-free cookies online — Spring Cookie Box ($35), build your own dozen ($30), or both. Chocolate chip, cherry almond, seasonal flavors & more. Cincinnati pickup.',
  keywords: ['order gluten-free cookies', 'spring cookie box', 'Cincinnati cookies', 'gluten-free cookie order'],
  openGraph: {
    title: 'Order Cookies | Bakes by Coral',
    description: 'Order gluten-free cookies — Spring Cookie Box, build your own dozen, or both. Made from scratch in Cincinnati.',
    images: [{ url: '/choco-chip-tray.jpg', width: 1200, height: 630, alt: 'Order gluten-free cookies from Bakes by Coral' }],
  },
};

export default function CookieOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
