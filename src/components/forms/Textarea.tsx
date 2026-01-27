import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, required, showCount, maxLength, value, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const currentLength = value?.toString().length || 0;

    return (
      <div className={className}>
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={`
            block w-full px-4 py-2.5
            text-neutral-900 bg-white
            border rounded-lg
            placeholder:text-neutral-400
            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
            disabled:bg-neutral-100 disabled:cursor-not-allowed
            resize-y min-h-[100px]
            ${error ? 'border-red-500' : 'border-neutral-300'}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        <div className="flex justify-between mt-1.5">
          <div>
            {error && (
              <p id={`${inputId}-error`} className="text-sm text-red-600">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={`${inputId}-helper`} className="text-sm text-neutral-500">
                {helperText}
              </p>
            )}
          </div>
          {showCount && maxLength && (
            <p className="text-sm text-neutral-400">
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
