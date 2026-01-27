import { type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CardProps {
  title: string;
  description?: string;
  image?: string;
  href?: string;
  cta?: string;
  badge?: string;
  children?: ReactNode;
  className?: string;
}

export function Card({
  title,
  description,
  image,
  href,
  cta,
  badge,
  children,
  className = '',
}: CardProps) {
  const content = (
    <div className={`bg-[var(--primary)] rounded-2xl overflow-hidden shadow-sm border border-[var(--primary-dark)]/20 hover:shadow-md transition-shadow ${className}`}>
      {image && (
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {badge && (
            <span className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold bg-[var(--background)] text-[var(--foreground)] rounded-full">
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-[var(--primary-dark)]">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-[var(--primary-dark)]/80">{description}</p>
        )}
        {children}
        {cta && (
          <div className="mt-4">
            <span className="text-sm font-semibold text-[var(--background)] hover:text-[var(--primary-dark)]">
              {cta} &rarr;
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
