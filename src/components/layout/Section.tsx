import { type ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: 'white' | 'neutral' | 'primary';
  padding?: 'sm' | 'md' | 'lg';
}

const bgClasses = {
  white: 'bg-[var(--background)]',
  neutral: 'bg-[var(--primary)]',
  primary: 'bg-[var(--primary-dark)]',
};

const paddingClasses = {
  sm: 'py-8 sm:py-12',
  md: 'py-12 sm:py-16',
  lg: 'py-16 sm:py-24',
};

export function Section({
  children,
  className = '',
  background = 'white',
  padding = 'md',
}: SectionProps) {
  return (
    <section className={`${bgClasses[background]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </section>
  );
}
