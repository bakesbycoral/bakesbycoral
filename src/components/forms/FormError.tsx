interface FormErrorProps {
  errors: Record<string, string>;
  className?: string;
}

export function FormError({ errors, className = '' }: FormErrorProps) {
  const errorList = Object.entries(errors).filter(([, message]) => message);

  if (errorList.length === 0) return null;

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        <svg
          className="h-5 w-5 text-red-400 mt-0.5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            There {errorList.length === 1 ? 'is' : 'are'} {errorList.length} error
            {errorList.length !== 1 && 's'} with your submission
          </h3>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
            {errorList.map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
