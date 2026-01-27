import { type InputHTMLAttributes, forwardRef, type ReactNode, useId } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={className}>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              className={`
                h-4 w-4
                rounded border-neutral-300
                text-amber-600
                focus:ring-amber-500 focus:ring-offset-0
                disabled:cursor-not-allowed
                ${error ? 'border-red-500' : ''}
              `}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${inputId}-error` : undefined}
              {...props}
            />
          </div>
          <label htmlFor={inputId} className="ml-3 text-sm text-neutral-700">
            {label}
          </label>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 ml-7 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
