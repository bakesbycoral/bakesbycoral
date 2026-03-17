import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Bakes by Coral — questions about gluten-free cakes, cookies or wedding desserts? Send us a message or call (513) 633-7850.',
  openGraph: {
    title: 'Contact | Bakes by Coral',
    description: 'Get in touch with Bakes by Coral — questions about gluten-free cakes, cookies or wedding desserts? We\'d love to hear from you!',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Contact Bakes by Coral' }],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
