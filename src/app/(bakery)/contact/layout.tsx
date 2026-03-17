import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Bakes by Coral — questions about gluten-free cakes, cookies or wedding desserts? Send us a message or text (513) 633-7850.',
  openGraph: {
    title: 'Contact | Bakes by Coral',
    description: 'Get in touch with Bakes by Coral — questions about gluten-free cakes, cookies or wedding desserts? We\'d love to hear from you!',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Contact Bakes by Coral' }],
  },
};

const contactBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bakesbycoral.com' },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://bakesbycoral.com/contact' },
  ],
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactBreadcrumb) }}
      />
      {children}
    </>
  );
}
