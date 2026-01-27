import { type ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className = '' }: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
