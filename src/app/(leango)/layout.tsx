import { Header, Footer } from '@/components/leango';

export const metadata = {
  title: {
    default: 'LeanGo - Real People. Real Improvements. Real Results.',
    template: '%s | LeanGo',
  },
  description: 'We help organizations build sustainable improvement capabilities through lean methodology, custom apps, and actionable analytics.',
};

export default function LeanGoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col leango-fonts">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
