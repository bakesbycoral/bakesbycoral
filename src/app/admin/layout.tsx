import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Bakes by Coral Admin',
  },
  robots: 'noindex, nofollow',
  manifest: '/admin-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BBC Admin',
  },
  icons: {
    apple: '/apple-touch-icon-admin.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#541409',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-100">
      {children}
    </div>
  );
}
