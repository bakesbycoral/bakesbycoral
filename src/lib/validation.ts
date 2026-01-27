// Form validation utilities

// Simple input sanitization
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 10000); // Limit length
}

// Honeypot spam check
export function isSpamSubmission(website?: string, company?: string): boolean {
  // If honeypot fields are filled, it's likely spam
  return !!(website || company);
}

// Common order validation
export function validateOrder(data: {
  name: string;
  email: string;
  phone: string;
  pickup_date?: string;
  pickup_time?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Name is required');
  }

  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!data.phone?.trim()) {
    errors.push('Phone number is required');
  }

  if (data.pickup_date !== undefined && !data.pickup_date) {
    errors.push('Pickup date is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  // Block obviously fake emails
  const blockedEmails = ['test@test.com', 'test@example.com', 'fake@fake.com'];
  if (blockedEmails.includes(email.toLowerCase())) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 10) {
    return { valid: false, error: 'Please enter a valid phone number' };
  }

  if (digits.length > 15) {
    return { valid: false, error: 'Phone number is too long' };
  }

  return { valid: true };
}

export function validateRequired(value: string | undefined | null, fieldName: string): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

export function validateMinLength(value: string, min: number, fieldName: string): { valid: boolean; error?: string } {
  if (!value || value.length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters` };
  }
  return { valid: true };
}

export function validateMaxLength(value: string, max: number, fieldName: string): { valid: boolean; error?: string } {
  if (value && value.length > max) {
    return { valid: false, error: `${fieldName} must be at most ${max} characters` };
  }
  return { valid: true };
}

export function validateDate(dateStr: string, minDays: number = 0): { valid: boolean; error?: string } {
  if (!dateStr) {
    return { valid: false, error: 'Date is required' };
  }

  const date = new Date(dateStr + 'T12:00:00');
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Please enter a valid date' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + minDays);

  if (date < minDate) {
    if (minDays === 0) {
      return { valid: false, error: 'Date cannot be in the past' };
    }
    return { valid: false, error: `Date must be at least ${minDays} days from today` };
  }

  // Don't allow dates more than 1 year out
  const maxDate = new Date(today);
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  if (date > maxDate) {
    return { valid: false, error: 'Date cannot be more than 1 year in the future' };
  }

  return { valid: true };
}

export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url || url.trim() === '') {
    return { valid: true }; // URLs are typically optional
  }

  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}

export function validateNumber(
  value: string | number,
  options: { min?: number; max?: number; fieldName?: string } = {}
): { valid: boolean; error?: string } {
  const { min, max, fieldName = 'Value' } = options;
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (min !== undefined && num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { valid: true };
}

export function validateCheckbox(checked: boolean, message: string): { valid: boolean; error?: string } {
  if (!checked) {
    return { valid: false, error: message };
  }
  return { valid: true };
}

// Validate an entire form and return all errors
export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export function validateForm(
  validations: Array<{ field: string; result: { valid: boolean; error?: string } }>
): ValidationResult {
  const errors: Record<string, string> = {};
  let valid = true;

  for (const { field, result } of validations) {
    if (!result.valid && result.error) {
      errors[field] = result.error;
      valid = false;
    }
  }

  return { valid, errors };
}
