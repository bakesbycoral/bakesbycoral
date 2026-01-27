import { Container } from './Container';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageHeader({ title, subtitle, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="bg-neutral-50 py-12 sm:py-16">
      <Container>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-neutral-500">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-amber-600 transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-neutral-900">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl">{subtitle}</p>
        )}
      </Container>
    </div>
  );
}
