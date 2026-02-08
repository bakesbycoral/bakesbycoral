interface Logo {
  name: string;
  src?: string;
}

interface LogoGridProps {
  title?: string;
  logos: Logo[];
  variant?: 'light' | 'dark';
}

export function LogoGrid({ title = 'Trusted by leading organizations', logos, variant = 'light' }: LogoGridProps) {
  const isDark = variant === 'dark';

  return (
    <div className="text-center">
      <p className={`text-sm font-medium uppercase tracking-wider mb-8 ${
        isDark ? 'text-gray-500' : 'text-gray-500'
      }`}>
        {title}
      </p>
      <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
        {logos.map((logo, index) => (
          <div
            key={index}
            className="flex items-center justify-center h-12 px-4"
          >
            {logo.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo.src}
                alt={logo.name}
                className={`h-8 lg:h-10 object-contain transition-all ${
                  isDark
                    ? 'opacity-50 hover:opacity-100 brightness-0 invert'
                    : 'grayscale hover:grayscale-0 opacity-60 hover:opacity-100'
                }`}
              />
            ) : (
              <span className={`text-lg font-semibold transition-colors ${
                isDark
                  ? 'text-gray-600 hover:text-gray-400'
                  : 'text-gray-400 hover:text-gray-600'
              }`}>
                {logo.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
