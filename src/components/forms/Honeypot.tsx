interface HoneypotProps {
  name?: string;
}

export function Honeypot({ name = 'website' }: HoneypotProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        opacity: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <label htmlFor={name}>
        Please leave this field empty
        <input
          type="text"
          id={name}
          name={name}
          autoComplete="off"
          tabIndex={-1}
        />
      </label>
    </div>
  );
}

// Check if honeypot was filled (indicates spam)
export function isHoneypotFilled(formData: FormData, fieldName: string = 'website'): boolean {
  const value = formData.get(fieldName);
  return value !== null && value !== '';
}
