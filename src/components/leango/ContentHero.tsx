import Link from 'next/link';

interface ContentHeroProps {
  label?: string;
  labelColor?: string;
  title: string;
  description?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  image?: string;
  imageAlt?: string;
  centered?: boolean;
  variant?: 'light' | 'dark';
}

export function ContentHero({
  label,
  labelColor,
  title,
  description,
  primaryCta,
  secondaryCta,
  image,
  imageAlt,
  centered = false,
  variant = 'light',
}: ContentHeroProps) {
  const isDark = variant === 'dark';

  return (
    <section className={`relative overflow-hidden pt-32 pb-16 lg:pt-40 lg:pb-24 ${
      isDark
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950'
        : 'bg-gradient-to-b from-blue-50 to-white'
    }`}>
      {/* Dark variant decorative elements */}
      {isDark && (
        <>
          {/* Animated gradient orbs */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#00a1f1]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#66d200]/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-[#00a1f1]/10 rounded-full blur-[80px]" />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Diagonal accent lines */}
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-20 right-[20%] w-[2px] h-[400px] bg-gradient-to-b from-transparent via-[#00a1f1]/30 to-transparent rotate-[30deg]" />
            <div className="absolute -top-10 right-[35%] w-[1px] h-[300px] bg-gradient-to-b from-transparent via-[#66d200]/20 to-transparent rotate-[25deg]" />
            <div className="absolute top-20 right-[10%] w-[1px] h-[250px] bg-gradient-to-b from-transparent via-[#00a1f1]/20 to-transparent rotate-[35deg]" />
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950/50 to-transparent" />
        </>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {image ? (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {label && (
                <p className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                  labelColor || (isDark ? 'text-[#00a1f1]' : 'text-blue-600')
                }`}>
                  {label}
                </p>
              )}
              <h1 className={`text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h1>
              {description && (
                <p className={`mt-6 text-lg lg:text-xl leading-relaxed ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {description}
                </p>
              )}
              {(primaryCta || secondaryCta) && (
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  {primaryCta && (
                    <Link
                      href={primaryCta.href}
                      className={`inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                        isDark
                          ? 'bg-[#00a1f1] text-white hover:bg-[#0091d8] hover:shadow-lg hover:shadow-[#00a1f1]/25'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {primaryCta.label}
                    </Link>
                  )}
                  {secondaryCta && (
                    <Link
                      href={secondaryCta.href}
                      className={`inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                        isDark
                          ? 'border border-gray-600 text-gray-200 hover:border-[#66d200] hover:text-[#66d200]'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {secondaryCta.label}
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <div className={`aspect-[4/3] rounded-2xl overflow-hidden ${
                isDark ? 'bg-gray-800' : 'bg-gray-200'
              }`}>
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={imageAlt || title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={centered ? 'text-center max-w-4xl mx-auto' : 'max-w-3xl'}>
            {label && (
              <p className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                labelColor || (isDark ? 'text-[#00a1f1]' : 'text-blue-600')
              }`}>
                {label}
              </p>
            )}
            <h1 className={`text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h1>
            {description && (
              <p className={`mt-6 text-lg lg:text-xl leading-relaxed ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {description}
              </p>
            )}
            {(primaryCta || secondaryCta) && (
              <div className={`mt-8 flex flex-col sm:flex-row gap-4 ${centered ? 'justify-center' : ''}`}>
                {primaryCta && (
                  <Link
                    href={primaryCta.href}
                    className={`inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                      isDark
                        ? 'bg-[#00a1f1] text-white hover:bg-[#0091d8] hover:shadow-lg hover:shadow-[#00a1f1]/25'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {primaryCta.label}
                  </Link>
                )}
                {secondaryCta && (
                  <Link
                    href={secondaryCta.href}
                    className={`inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                      isDark
                        ? 'border border-gray-600 text-gray-200 hover:border-[#66d200] hover:text-[#66d200]'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {secondaryCta.label}
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
