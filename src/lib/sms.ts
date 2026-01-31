// SMS sending via Twilio

interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface SendSmsOptions {
  to: string;
  body: string;
}

// Format phone number to E.164 format
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If it's 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If it's 11 digits starting with 1, add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // If it already has a +, return as-is
  if (phone.startsWith('+')) {
    return phone;
  }

  // Otherwise just add + prefix
  return `+${digits}`;
}

export async function sendSms(
  credentials: TwilioCredentials,
  options: SendSmsOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { accountSid, authToken, fromNumber } = credentials;
  const { to, body } = options;

  const formattedTo = formatPhoneNumber(to);

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: fromNumber,
          Body: body,
        }),
      }
    );

    const result = await response.json() as { sid?: string; message?: string; code?: number };

    if (response.ok) {
      return { success: true, messageId: result.sid };
    } else {
      console.error('Twilio error:', result);
      return { success: false, error: result.message || 'Failed to send SMS' };
    }
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Default SMS templates
export const DEFAULT_SMS_TEMPLATES: Record<string, string> = {
  quote_sent: `Hi {{customer_name}}! You have a new quote from Bakes by Coral for {{order_type}}. View & approve here: {{quote_url}}`,

  order_confirmed: `Hi {{customer_name}}! Your order #{{order_number}} is confirmed. Pickup: {{pickup_date}} {{pickup_time}}. Thank you for choosing Bakes by Coral!`,

  balance_invoice: `Hi {{customer_name}}! Your balance of {{balance_due}} is due for order #{{order_number}}. Pay here: {{payment_url}} - Bakes by Coral`,

  pickup_reminder: `Hi {{customer_name}}! Reminder: Your order #{{order_number}} is ready for pickup tomorrow ({{pickup_date}}) {{pickup_time}}. See you soon! - Bakes by Coral`,

  // Delivery versions
  order_confirmed_delivery: `Hi {{customer_name}}! Your order #{{order_number}} is confirmed for delivery on {{delivery_date}} {{delivery_time}}. Thank you for choosing Bakes by Coral!`,

  balance_invoice_delivery: `Hi {{customer_name}}! Your balance of {{balance_due}} is due for order #{{order_number}} (delivery). Pay here: {{payment_url}} - Bakes by Coral`,

  delivery_reminder: `Hi {{customer_name}}! Reminder: Your order #{{order_number}} will be delivered tomorrow ({{delivery_date}}) {{delivery_time}}. - Bakes by Coral`,
};

// Build SMS message from template
export function buildSmsMessage(
  template: string | undefined,
  defaultTemplate: string,
  variables: Record<string, string>
): string {
  let message = template || defaultTemplate;

  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }

  return message;
}
