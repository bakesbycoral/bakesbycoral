import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Bakes by Coral Admin',
  },
  robots: 'noindex, nofollow',
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
