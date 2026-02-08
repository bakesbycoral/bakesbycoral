import Link from 'next/link';

interface CTASectionProps {
  title?: string;
  description?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  variant?: 'blue' | 'dark' | 'gradient';
}

export function CTASection({
  title = 'Ready to start improving?',
  description = 'Schedule a free consultation to discuss your challenges and how we can help.',
  primaryCta = {
    label: 'Schedule Your First Session',
    href: '/leango/book/consultation',
  },
  secondaryCta,
  variant = 'gradient',
}: CTASectionProps) {
  return (
    <section className={`relative overflow-hidden py-20 lg:py-28 ${
      variant === 'gradient'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : variant === 'dark'
        ? 'bg-gray-950'
        : 'bg-[#00a1f1]'
    }`}>
      {/* Decorative elements */}
      {variant === 'gradient' && (
        <>
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#00a1f1]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#66d200]/15 rounded-full blur-[100px]" />
        </>
      )}

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-white">{title}</h2>
        {description && (
          <p className="mt-6 text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto">
            {description}
          </p>
        )}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={primaryCta.href}
            className="inline-flex items-center justify-center px-8 py-4 bg-[#00a1f1] text-white text-base font-semibold rounded-xl hover:bg-[#0091d8] hover:shadow-xl hover:shadow-[#00a1f1]/30 transition-all duration-200"
          >
            {primaryCta.label}
          </Link>
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white text-base font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
