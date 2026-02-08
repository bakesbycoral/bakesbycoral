import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  label?: string;
  background?: 'white' | 'gray' | 'dark' | 'darker' | 'gradient';
  id?: string;
}

const backgroundStyles = {
  white: 'bg-white text-gray-900',
  gray: 'bg-gray-50 text-gray-900',
  dark: 'bg-gray-900 text-white',
  darker: 'bg-gray-950 text-white',
  gradient: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white',
};

export function Section({
  children,
  className = '',
  label,
  background = 'white',
  id,
}: SectionProps) {
  const isDark = background === 'dark' || background === 'darker' || background === 'gradient';

  return (
    <section id={id} className={`py-16 lg:py-24 ${backgroundStyles[background]} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {label && (
          <p className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
            isDark ? 'text-[#00a1f1]' : 'text-[#00a1f1]'
          }`}>
            {label}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  title: React.ReactNode;
  description?: string;
  centered?: boolean;
  className?: string;
  dark?: boolean;
}

export function SectionHeader({
  title,
  description,
  centered = false,
  className = '',
  dark = false,
}: SectionHeaderProps) {
  return (
    <div className={`${centered ? 'text-center max-w-3xl mx-auto' : 'max-w-2xl'} ${className}`}>
      <h2 className={`text-3xl lg:text-4xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-lg ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>
      )}
    </div>
  );
}
