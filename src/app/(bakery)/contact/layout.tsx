import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Bakes by Coral. Questions about gluten-free cakes, cookies, or wedding desserts? Send us a message. Cincinnati-based bakery.',
  openGraph: {
    title: 'Contact | Bakes by Coral',
    description: 'Have questions about our gluten-free baked goods? We\'d love to hear from you!',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
