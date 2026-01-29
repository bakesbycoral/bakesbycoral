import { Container } from './Container';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  centered?: boolean;
  variant?: 'default' | 'pink';
}

export function PageHeader({ title, subtitle, breadcrumbs, centered = false, variant = 'default' }: PageHeaderProps) {
  const bgClass = variant === 'pink' ? 'bg-[#EAD6D6]' : 'bg-neutral-50';
  const textClass = variant === 'pink' ? 'text-[#541409]' : 'text-neutral-900';
  const subtitleClass = variant === 'pink' ? 'text-[#541409]/80' : 'text-neutral-600';

  return (
    <div className={`${bgClass} py-12 sm:py-16`}>
      <Container>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={`mb-4 ${centered ? 'text-center' : ''}`}>
            <ol className={`flex items-center space-x-2 text-sm text-neutral-500 ${centered ? 'justify-center' : ''}`}>
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-amber-600 transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className={textClass}>{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className={`text-3xl font-bold ${textClass} sm:text-4xl ${centered ? 'text-center' : ''}`}>{title}</h1>
        {subtitle && (
          <p className={`mt-4 text-lg ${subtitleClass} max-w-2xl ${centered ? 'text-center mx-auto' : ''}`}>{subtitle}</p>
        )}
      </Container>
    </div>
  );
}
