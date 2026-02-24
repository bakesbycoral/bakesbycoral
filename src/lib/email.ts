// Email sending utility using Resend

// Parse comma-separated admin emails into an array
export function parseAdminEmails(emailString: string | undefined, fallback = 'hello@bakesbycoral.com'): string[] {
  if (!emailString) return [fallback];
  const emails = emailString.split(',').map(e => e.trim()).filter(e => e.length > 0);
  return emails.length > 0 ? emails : [fallback];
}

// Escape HTML entities to prevent injection in email templates
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail(
  apiKey: string,
  options: SendEmailOptions
): Promise<boolean> {
  if (!apiKey) {
    console.warn('Resend API key not configured, skipping email');
    return false;
  }

  try {
    const emailData: Record<string, unknown> = {
      from: options.from || 'Bakes by Coral <hello@bakesbycoral.com>',
      to: Array.isArray(options.to) ? options.to : [options.to],
      reply_to: options.replyTo,
      subject: options.subject,
      html: options.html,
    };

    if (options.attachments && options.attachments.length > 0) {
      emailData.attachments = options.attachments;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send email:', response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

// Template variable replacement
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>,
  escapeValues = true
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const safeValue = escapeValues ? escapeHtml(value || '') : (value || '');
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), safeValue);
  }
  return result;
}

// Convert plain text template to HTML email
export function textToHtmlEmail(text: string, title: string): string {
  // Convert markdown-style bold to HTML
  const htmlContent = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #541409;
          color: #EAD6D6;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: normal;
          font-family: 'Playfair Display', Georgia, serif;
        }
        .content {
          background: #fff;
          padding: 30px;
          border: 1px solid #EAD6D6;
          border-top: none;
        }
        .content p {
          margin: 0 0 16px 0;
        }
        .footer {
          background: #EAD6D6;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #541409;
          border-radius: 0 0 8px 8px;
        }
        .order-number {
          font-size: 20px;
          font-weight: bold;
          color: #541409;
          background: #EAD6D6;
          padding: 10px 20px;
          border-radius: 4px;
          display: inline-block;
        }
        strong { color: #541409; }
        a { color: #541409; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bakes by Coral</h1>
        </div>
        <div class="content">
          <p>${htmlContent}</p>
        </div>
        <div class="footer">
          <p>Bakes by Coral • Cincinnati, OH</p>
          <p>100% Gluten-Free Home Bakery</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Order type labels
const ORDER_TYPE_LABELS: Record<string, string> = {
  cookies: 'Cookie Order',
  cookies_large: 'Large Cookie Order',
  cake: 'Custom Cake',
  wedding: 'Wedding Inquiry',
  tasting: 'Tasting Order',
};

// Format order details for email
export function formatOrderDetails(orderType: string, formData: Record<string, unknown>): string {
  const lines: string[] = [];

  if (orderType === 'cookies' || orderType === 'cookies_large') {
    if (formData.flavor_counts) {
      lines.push('**Cookies:**');
      const counts = formData.flavor_counts as Record<string, number>;
      for (const [flavor, count] of Object.entries(counts)) {
        const label = flavor.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        lines.push(`• ${label}: ${count} cookies`);
      }
    } else if (formData.flavors) {
      lines.push('**Flavors:** ' + (formData.flavors as string[]).join(', '));
    }
    if (formData.quantity) {
      lines.push(`**Quantity:** ${formData.quantity} dozen`);
    }
    if (formData.packaging === 'heat-sealed') {
      lines.push('**Packaging:** Heat-sealed (+$5/dozen)');
    }
  }

  if (orderType === 'cake') {
    if (formData.size) lines.push(`**Size:** ${formData.size}-inch`);
    if (formData.shape) lines.push(`**Shape:** ${formData.shape}`);
    if (formData.flavor) lines.push(`**Flavor:** ${formData.flavor}`);
    if (formData.filling) lines.push(`**Filling:** ${formData.filling}`);
    if (formData.frosting || formData.buttercream) {
      lines.push(`**Frosting:** ${formData.frosting || formData.buttercream}`);
    }
    if (formData.design_style) lines.push(`**Design Style:** ${formData.design_style}`);
    if (formData.color_palette) lines.push(`**Colors:** ${formData.color_palette}`);
  }

  if (orderType === 'wedding') {
    if (formData.guest_count) lines.push(`**Guest Count:** ${formData.guest_count}`);
    if (formData.services_needed) lines.push(`**Services:** ${formData.services_needed}`);
    if (formData.cake_tiers) lines.push(`**Cake Tiers:** ${formData.cake_tiers}`);
    if (formData.theme) lines.push(`**Theme:** ${formData.theme}`);
  }

  return lines.join('\n');
}

// Format time for display
function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Format date for display
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format price for display
function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Build email from database template
export function buildEmailFromTemplate(
  template: string,
  subject: string,
  data: {
    customerName: string;
    orderNumber: string;
    orderType: string;
    pickupDate?: string;
    pickupTime?: string;
    totalAmount?: number;
    formData?: Record<string, unknown>;
  }
): { subject: string; html: string } {
  const variables: Record<string, string> = {
    customer_name: data.customerName,
    order_number: data.orderNumber,
    order_type: ORDER_TYPE_LABELS[data.orderType] || data.orderType,
    pickup_date: data.pickupDate ? formatDate(data.pickupDate) : 'TBD',
    pickup_time: data.pickupTime ? formatTime(data.pickupTime) : 'TBD',
    total_amount: data.totalAmount ? formatPrice(data.totalAmount) : '',
    order_details: data.formData ? formatOrderDetails(data.orderType, data.formData) : '',
  };

  const processedSubject = replaceTemplateVariables(subject, variables);
  const processedBody = replaceTemplateVariables(template, variables);
  const html = textToHtmlEmail(processedBody, processedSubject);

  return { subject: processedSubject, html };
}

// Legacy template functions for backward compatibility

export function orderConfirmationEmail(data: {
  customerName: string;
  orderNumber: string;
  orderType: string;
  pickupDate?: string;
  pickupTime?: string;
}): string {
  const orderTypeLabels: Record<string, string> = {
    cookies: 'Cookie Order',
    cookies_large: 'Large Cookie Order',
    cake: 'Custom Cake',
    wedding: 'Wedding Inquiry',
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #541409; color: #EAD6D6; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #EAD6D6; border-top: none; }
        .footer { background: #EAD6D6; padding: 20px; text-align: center; font-size: 14px; color: #541409; border-radius: 0 0 8px 8px; }
        .order-number { font-size: 24px; font-weight: bold; color: #541409; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif;">Bakes by Coral</h1>
        </div>
        <div class="content">
          <h2>Thank you for your order, ${escapeHtml(data.customerName)}!</h2>
          <p>We've received your ${orderTypeLabels[data.orderType] || 'order'} and will be in touch soon.</p>

          <p><strong>Order Number:</strong></p>
          <p class="order-number">${escapeHtml(data.orderNumber)}</p>

          ${data.pickupDate ? `
          <p><strong>Requested Pickup:</strong><br>
          ${formatDate(data.pickupDate)}
          ${data.pickupTime ? ` at ${formatTime(data.pickupTime)}` : ''}</p>
          ` : ''}

          <p>We'll review your order and send you a confirmation or follow up with any questions within 24-48 hours.</p>

          <p style="margin-top: 30px;">
            <strong>Questions?</strong><br>
            Reply to this email or contact us at <a href="mailto:hello@bakesbycoral.com">hello@bakesbycoral.com</a>
          </p>
        </div>
        <div class="footer">
          <p>Bakes by Coral • Cincinnati, OH</p>
          <p>100% Gluten-Free Home Bakery</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function adminNewOrderEmail(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderNumber: string;
  orderType: string;
  pickupDate?: string;
  formData?: Record<string, unknown>;
}): string {
  const orderTypeLabels: Record<string, string> = {
    cookies: 'Cookie Order',
    cookies_large: 'Large Cookie Order',
    cake: 'Custom Cake',
    wedding: 'Wedding Inquiry',
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #541409; color: #EAD6D6; padding: 20px; text-align: center; }
        .content { background: #fff; padding: 30px; border: 1px solid #EAD6D6; }
        .label { font-weight: bold; color: #541409; }
        .btn { display: inline-block; background: #541409; color: #EAD6D6; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">New ${orderTypeLabels[data.orderType] || 'Order'}</h1>
        </div>
        <div class="content">
          <p><span class="label">Order Number:</span> ${escapeHtml(data.orderNumber)}</p>
          <p><span class="label">Type:</span> ${orderTypeLabels[data.orderType]}</p>
          <hr>
          <p><span class="label">Customer:</span> ${escapeHtml(data.customerName)}</p>
          <p><span class="label">Email:</span> <a href="mailto:${escapeHtml(data.customerEmail)}">${escapeHtml(data.customerEmail)}</a></p>
          <p><span class="label">Phone:</span> <a href="tel:${escapeHtml(data.customerPhone)}">${escapeHtml(data.customerPhone)}</a></p>
          ${data.pickupDate ? `<p><span class="label">Requested Pickup:</span> ${data.pickupDate}</p>` : ''}

          ${data.formData ? `
          <hr>
          <p><span class="label">Order Details:</span></p>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(data.formData, null, 2)}</pre>
          ` : ''}

          <a href="https://bakesbycoral.com/admin/orders" class="btn">View in Dashboard</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Pickup reminder email
export function pickupReminderEmail(data: {
  customerName: string;
  orderNumber: string;
  orderType: string;
  pickupDate: string;
  pickupTime: string;
  formData?: Record<string, unknown>;
}): string {
  const orderDetails = data.formData ? formatOrderDetails(data.orderType, data.formData) : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #541409; color: #EAD6D6; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #EAD6D6; border-top: none; }
        .footer { background: #EAD6D6; padding: 20px; text-align: center; font-size: 14px; color: #541409; border-radius: 0 0 8px 8px; }
        .highlight { background: #EAD6D6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .order-number { color: #541409; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif;">Pickup Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(data.customerName)},</p>

          <p>Just a friendly reminder that your order is ready for pickup <strong>tomorrow</strong>!</p>

          <div class="highlight">
            <p><strong>Order:</strong> <span class="order-number">${escapeHtml(data.orderNumber)}</span></p>
            <p><strong>Pickup Date:</strong> ${formatDate(data.pickupDate)}</p>
            <p><strong>Pickup Time:</strong> ${formatTime(data.pickupTime)}</p>
          </div>

          ${orderDetails ? `<p><strong>Order Details:</strong></p><p>${orderDetails.replace(/\n/g, '<br>')}</p>` : ''}

          <p>Please reply to this email or text me if you need to reschedule.</p>

          <p>See you soon!</p>

          <p>Sweet regards,<br>Coral</p>
        </div>
        <div class="footer">
          <p>Bakes by Coral • Cincinnati, OH</p>
          <p>100% Gluten-Free Home Bakery</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Admin reminder about upcoming pickup
export function adminPickupReminderEmail(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderNumber: string;
  orderType: string;
  pickupDate: string;
  pickupTime: string;
  formData?: Record<string, unknown>;
}): string {
  const orderTypeLabels: Record<string, string> = {
    cookies: 'Cookie Order',
    cookies_large: 'Large Cookie Order',
    cake: 'Custom Cake',
    wedding: 'Wedding',
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #541409; color: #EAD6D6; padding: 20px; text-align: center; }
        .content { background: #fff; padding: 30px; border: 1px solid #EAD6D6; }
        .label { font-weight: bold; color: #541409; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Pickup Tomorrow</h1>
        </div>
        <div class="content">
          <p><span class="label">Order:</span> ${escapeHtml(data.orderNumber)}</p>
          <p><span class="label">Type:</span> ${orderTypeLabels[data.orderType] || data.orderType}</p>
          <p><span class="label">Pickup:</span> ${formatDate(data.pickupDate)} at ${formatTime(data.pickupTime)}</p>
          <hr>
          <p><span class="label">Customer:</span> ${escapeHtml(data.customerName)}</p>
          <p><span class="label">Email:</span> <a href="mailto:${escapeHtml(data.customerEmail)}">${escapeHtml(data.customerEmail)}</a></p>
          <p><span class="label">Phone:</span> <a href="tel:${escapeHtml(data.customerPhone)}">${escapeHtml(data.customerPhone)}</a></p>

          ${data.formData ? `
          <hr>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${JSON.stringify(data.formData, null, 2)}</pre>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

// Quote email - sent when admin sends quote to customer
export function quoteEmail(data: {
  customerName: string;
  quoteNumber: string;
  orderNumber: string;
  orderType: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  subtotal: number;
  depositAmount: number;
  depositPercentage: number;
  totalAmount: number;
  validUntil: string;
  customerMessage: string;
  quoteUrl: string;
}): string {
  const lineItemsHtml = data.lineItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #EAD6D6;">${item.description}</td>
      <td style="padding: 12px; border-bottom: 1px solid #EAD6D6; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #EAD6D6; text-align: right;">${formatPrice(item.unit_price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #EAD6D6; text-align: right;">${formatPrice(item.total_price)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote from Bakes by Coral</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header {
          background: #541409;
          color: #EAD6D6;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 { margin: 0; font-size: 28px; font-weight: normal; font-family: 'Playfair Display', Georgia, serif; }
        .content {
          background: #fff;
          padding: 30px;
          border: 1px solid #EAD6D6;
          border-top: none;
        }
        .footer {
          background: #EAD6D6;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #541409;
          border-radius: 0 0 8px 8px;
        }
        .quote-number {
          font-size: 18px;
          font-weight: bold;
          color: #541409;
          background: #EAD6D6;
          padding: 8px 16px;
          border-radius: 4px;
          display: inline-block;
        }
        .btn {
          display: inline-block;
          background: #541409;
          color: #EAD6D6 !important;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 20px;
          font-weight: bold;
        }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #EAD6D6; color: #541409; padding: 12px; text-align: left; }
        .total-row { font-weight: bold; background: #f9f9f9; }
        .deposit-row { color: #541409; }
        strong { color: #541409; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bakes by Coral</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Quote for Your Order</p>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(data.customerName)},</p>

          <p>Thank you for your inquiry! Here's your personalized quote for your ${ORDER_TYPE_LABELS[data.orderType] || data.orderType}:</p>

          <p class="quote-number">${escapeHtml(data.quoteNumber)}</p>
          <p style="color: #666; font-size: 14px;">Order: ${escapeHtml(data.orderNumber)}</p>

          ${data.customerMessage ? `
          <div style="background: #EAD6D6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #541409;">${escapeHtml(data.customerMessage)}</p>
          </div>
          ` : ''}

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lineItemsHtml}
              <tr class="total-row">
                <td colspan="3" style="padding: 12px; text-align: right;"><strong>Subtotal</strong></td>
                <td style="padding: 12px; text-align: right;"><strong>${formatPrice(data.subtotal)}</strong></td>
              </tr>
              <tr class="deposit-row">
                <td colspan="3" style="padding: 12px; text-align: right;">
                  <strong>Deposit Due (${data.depositPercentage}%)</strong>
                </td>
                <td style="padding: 12px; text-align: right;"><strong>${formatPrice(data.depositAmount)}</strong></td>
              </tr>
            </tbody>
          </table>

          <p style="color: #666; font-size: 14px;">
            <strong>Valid until:</strong> ${formatDate(data.validUntil)}
          </p>

          <p>To approve this quote and pay your deposit, click the button below:</p>

          <div style="text-align: center;">
            <a href="${data.quoteUrl}" class="btn">View & Approve Quote</a>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you have any questions or would like to make changes, please reply to this email.
          </p>

          <p>Sweet regards,<br><strong>Coral</strong></p>
        </div>
        <div class="footer">
          <p>Bakes by Coral • Cincinnati, OH</p>
          <p>100% Gluten-Free Home Bakery</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Quote approved email - sent when customer approves quote
export function quoteApprovedEmail(data: {
  customerName: string;
  quoteNumber: string;
  orderNumber: string;
  depositAmount: number;
  totalAmount: number;
  invoiceUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote Approved - Bakes by Coral</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header {
          background: #541409;
          color: #EAD6D6;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 { margin: 0; font-size: 28px; font-weight: normal; font-family: 'Playfair Display', Georgia, serif; }
        .content {
          background: #fff;
          padding: 30px;
          border: 1px solid #EAD6D6;
          border-top: none;
        }
        .footer {
          background: #EAD6D6;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #541409;
          border-radius: 0 0 8px 8px;
        }
        .success-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .btn {
          display: inline-block;
          background: #541409;
          color: #EAD6D6 !important;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 20px;
          font-weight: bold;
        }
        .summary {
          background: #EAD6D6;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        strong { color: #541409; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">✓</div>
          <h1>Quote Approved!</h1>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(data.customerName)},</p>

          <p>Thank you for approving your quote! Your order is now confirmed and we've sent you an invoice for the deposit.</p>

          <div class="summary">
            <p style="margin: 0 0 10px 0;"><strong>Quote:</strong> ${escapeHtml(data.quoteNumber)}</p>
            <p style="margin: 0 0 10px 0;"><strong>Order:</strong> ${escapeHtml(data.orderNumber)}</p>
            <p style="margin: 0 0 10px 0;"><strong>Deposit Due:</strong> ${formatPrice(data.depositAmount)}</p>
            <p style="margin: 0;"><strong>Total Order:</strong> ${formatPrice(data.totalAmount)}</p>
          </div>

          <p>Please pay your deposit to secure your order:</p>

          <div style="text-align: center;">
            <a href="${data.invoiceUrl}" class="btn">Pay Deposit</a>
          </div>

          <p style="margin-top: 30px;">
            Once your deposit is paid, we'll reach out to confirm all the details for your order.
            The remaining balance will be due before pickup.
          </p>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Questions? Just reply to this email!
          </p>

          <p>Sweet regards,<br><strong>Coral</strong></p>
        </div>
        <div class="footer">
          <p>Bakes by Coral • Cincinnati, OH</p>
          <p>100% Gluten-Free Home Bakery</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// Template-based email builders (use admin settings)
// ============================================

export const DEFAULT_TEMPLATES: Record<string, string> = {
  form_submission: `Hi {{customer_name}},

Thank you for your order request! We've received your {{order_type}} inquiry and will review it shortly.

**Order Details:**
Order Number: {{order_number}}
Pickup Date: {{pickup_date}}
{{pickup_time}}

{{order_details}}

We'll be in touch within 24-48 hours to confirm your order and discuss any details.

Thank you for choosing Bakes by Coral!

Best,
Coral`,

  reminder: `Hi {{customer_name}},

Just a friendly reminder that your order is ready for pickup tomorrow!

**Pickup Details:**
Order Number: {{order_number}}
Pickup Date: {{pickup_date}}
{{pickup_time}}

{{order_details}}

Please pick up at our location. If you need to make any changes, please contact us as soon as possible.

See you soon!
Coral`,

  confirmation: `Hi {{customer_name}},

Great news! Your order has been confirmed and payment received.

**Order Details:**
Order Number: {{order_number}}
Pickup Date: {{pickup_date}}
{{pickup_time}}

{{order_details}}

**Total:** {{total_amount}}

We're excited to bake for you! If you have any questions, just reply to this email.

Thank you for choosing Bakes by Coral!

Best,
Coral`,

  quote: `Hi {{customer_name}},

Thank you for your inquiry! Here's your personalized quote for your {{order_type}}:

{{customer_message}}
{{line_items_table}}
**Subtotal:** {{subtotal}}
**Deposit Due ({{deposit_percentage}}%):** {{deposit_amount}}

This quote is valid until {{valid_until}}.

To approve this quote and pay your deposit, click the button below.

If you have any questions or would like to make changes, please reply to this email.

Sweet regards,
Coral`,

  quote_approved: `Hi {{customer_name}},

Thank you for approving your quote! Your order is now confirmed.

**Quote:** {{quote_number}}
**Order:** {{order_number}}
**Deposit Due:** {{deposit_amount}}
**Total Order:** {{total_amount}}

Please pay your deposit to secure your order. Once your deposit is paid, we'll reach out to confirm all the details for your order. The remaining balance will be due 1 week before pickup.

Questions? Just reply to this email!

Sweet regards,
Coral`,

  balance_invoice: `Hi {{customer_name}},

Your order is almost ready! Here's the remaining balance for your order:

**Order:** {{order_number}}
**Pickup Date:** {{pickup_date}}

**Order Total:** {{total_amount}}
**Deposit Paid:** {{deposit_amount}}
**Balance Due:** {{balance_due}}

Please click the button below to pay your remaining balance.

Thank you for choosing Bakes by Coral! We can't wait for you to enjoy your order.

Sweet regards,
Coral`,

  // DELIVERY VERSIONS
  confirmation_delivery: `Hi {{customer_name}},

Great news! Your order has been confirmed and payment received.

**Order Details:**
Order Number: {{order_number}}
Delivery Date: {{delivery_date}}
{{delivery_time}}
Delivery Address: {{delivery_address}}

{{order_details}}

**Total:** {{total_amount}}

We're excited to bake for you! If you have any questions, just reply to this email.

Thank you for choosing Bakes by Coral!

Best,
Coral`,

  reminder_delivery: `Hi {{customer_name}},

Just a friendly reminder that your order will be delivered tomorrow!

**Delivery Details:**
Order Number: {{order_number}}
Delivery Date: {{delivery_date}}
{{delivery_time}}
Delivery Address: {{delivery_address}}

{{order_details}}

Please make sure someone is available to receive the delivery. If you need to make any changes, please contact us as soon as possible.

See you soon!
Coral`,

  balance_invoice_delivery: `Hi {{customer_name}},

Your order is almost ready! Here's the remaining balance for your order:

**Order:** {{order_number}}
**Delivery Date:** {{delivery_date}}
**Delivery Address:** {{delivery_address}}

**Order Total:** {{total_amount}}
**Deposit Paid:** {{deposit_amount}}
**Balance Due:** {{balance_due}}

Please click the button below to pay your remaining balance.

Thank you for choosing Bakes by Coral! We can't wait for you to enjoy your order.

Sweet regards,
Coral`,

  contract_sent: `Hi {{customer_name}},

Thank you for choosing Bakes by Coral for your wedding! I'm thrilled to be part of your special day.

Please review your wedding contract (**{{contract_number}}**) and sign it to confirm your booking. This contract is valid until {{valid_until}}.

Please review all details carefully and sign by clicking the button below. If you have any questions, please don't hesitate to reply to this email.

Sweet regards,
Coral`,

  contract_signed: `Hi {{customer_name}},

Thank you for signing your wedding contract (**{{contract_number}}**)! Your booking is now confirmed.

Next steps:
- I'll be in touch to schedule a tasting session
- Any changes must be communicated at least 4 weeks before the event

I'm so excited to create something beautiful for your wedding!

Sweet regards,
Coral`,
};

export const DEFAULT_SUBJECTS: Record<string, string> = {
  reminder: 'Pickup Reminder - {{order_number}}',
  confirmation: 'Order Confirmed - {{order_number}}',
  quote: 'Your Quote from Bakes by Coral - {{quote_number}}',
  quote_approved: 'Quote Approved! - {{quote_number}}',
  balance_invoice: 'Balance Due - {{order_number}}',
  form_submission: 'Order Request Received - {{order_number}}',
  // Delivery versions
  reminder_delivery: 'Delivery Reminder - {{order_number}}',
  confirmation_delivery: 'Order Confirmed - {{order_number}}',
  balance_invoice_delivery: 'Balance Due - {{order_number}}',
  // Contract emails
  contract_sent: 'Your Wedding Contract from Bakes by Coral - {{contract_number}}',
  contract_signed: 'Contract Signed! - {{contract_number}}',
};

// Wrap template text in styled HTML email
function wrapInEmailTemplate(content: string, title: string, headerText?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header {
          background: #541409;
          color: #EAD6D6;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: normal;
          font-family: 'Playfair Display', Georgia, serif;
        }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content {
          background: #fff;
          padding: 30px;
          border: 1px solid #EAD6D6;
          border-top: none;
        }
        .content p { margin: 0 0 16px 0; }
        .footer {
          background: #EAD6D6;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #541409;
          border-radius: 0 0 8px 8px;
        }
        .btn {
          display: inline-block;
          background: #541409;
          color: #EAD6D6 !important;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 20px;
          font-weight: bold;
        }
        table { width: 100%; border-collapse: collapse; margin: 0 0 16px 0; }
        th { background: #EAD6D6; color: #541409; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #EAD6D6; }
        strong { color: #541409; }
        a { color: #541409; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bakes by Coral</h1>
          ${headerText ? `<p>${headerText}</p>` : ''}
        </div>
        <div class="content">
          <p>${content}</p>
        </div>
        <div class="footer">
          <p>Bakes by Coral • Cincinnati, OH</p>
          <p>100% Gluten-Free Home Bakery</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Build pickup/delivery reminder from template
export function buildPickupReminderFromTemplate(
  template: string | undefined,
  subject: string | undefined,
  data: {
    customerName: string;
    orderNumber: string;
    orderType: string;
    pickupDate: string;
    pickupTime: string;
    formData?: Record<string, unknown>;
    isDelivery?: boolean;
    deliveryAddress?: string;
  }
): { subject: string; html: string } {
  const isDelivery = data.isDelivery || false;
  const templateText = template || (isDelivery ? DEFAULT_TEMPLATES.reminder_delivery : DEFAULT_TEMPLATES.reminder);
  const subjectText = subject || (isDelivery ? DEFAULT_SUBJECTS.reminder_delivery : DEFAULT_SUBJECTS.reminder);

  const orderDetails = data.formData ? formatOrderDetails(data.orderType, data.formData) : '';

  const variables: Record<string, string> = {
    customer_name: data.customerName,
    order_number: data.orderNumber,
    order_type: ORDER_TYPE_LABELS[data.orderType] || data.orderType,
    pickup_date: formatDate(data.pickupDate),
    pickup_time: formatTime(data.pickupTime),
    delivery_date: formatDate(data.pickupDate),
    delivery_time: formatTime(data.pickupTime),
    delivery_address: data.deliveryAddress || '',
    order_details: orderDetails,
  };

  const processedSubject = replaceTemplateVariables(subjectText, variables);
  const processedBody = replaceTemplateVariables(templateText, variables)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  const headerText = isDelivery ? 'Delivery Reminder' : 'Pickup Reminder';
  const html = wrapInEmailTemplate(processedBody, processedSubject, headerText);

  return { subject: processedSubject, html };
}

// Build order confirmation from template
export function buildConfirmationFromTemplate(
  template: string | undefined,
  subject: string | undefined,
  data: {
    customerName: string;
    orderNumber: string;
    orderType: string;
    pickupDate?: string;
    pickupTime?: string;
    totalAmount?: number;
    formData?: Record<string, unknown>;
    isDelivery?: boolean;
    deliveryAddress?: string;
  }
): { subject: string; html: string } {
  const isDelivery = data.isDelivery || false;
  const templateText = template || (isDelivery ? DEFAULT_TEMPLATES.confirmation_delivery : DEFAULT_TEMPLATES.confirmation);
  const subjectText = subject || (isDelivery ? DEFAULT_SUBJECTS.confirmation_delivery : DEFAULT_SUBJECTS.confirmation);

  const orderDetails = data.formData ? formatOrderDetails(data.orderType, data.formData) : '';

  const variables: Record<string, string> = {
    customer_name: data.customerName,
    order_number: data.orderNumber,
    order_type: ORDER_TYPE_LABELS[data.orderType] || data.orderType,
    pickup_date: data.pickupDate ? formatDate(data.pickupDate) : 'TBD',
    pickup_time: data.pickupTime ? formatTime(data.pickupTime) : '',
    delivery_date: data.pickupDate ? formatDate(data.pickupDate) : 'TBD',
    delivery_time: data.pickupTime ? formatTime(data.pickupTime) : '',
    delivery_address: data.deliveryAddress || '',
    order_details: orderDetails,
    total_amount: data.totalAmount ? formatPrice(data.totalAmount) : '',
  };

  const processedSubject = replaceTemplateVariables(subjectText, variables);
  const processedBody = replaceTemplateVariables(templateText, variables)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  const html = wrapInEmailTemplate(processedBody, processedSubject);

  return { subject: processedSubject, html };
}

// Build quote email from template
export function buildQuoteFromTemplate(
  template: string | undefined,
  subject: string | undefined,
  data: {
    customerName: string;
    quoteNumber: string;
    orderNumber: string;
    orderType: string;
    lineItems: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
    subtotal: number;
    depositAmount: number;
    depositPercentage: number;
    validUntil: string;
    customerMessage: string;
    quoteUrl: string;
  }
): { subject: string; html: string } {
  const templateText = template || DEFAULT_TEMPLATES.quote;
  const subjectText = subject || DEFAULT_SUBJECTS.quote;

  // Build line items table
  const lineItemsHtml = data.lineItems.map(item => `
    <tr>
      <td>${item.description}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">${formatPrice(item.unit_price)}</td>
      <td style="text-align: right;">${formatPrice(item.total_price)}</td>
    </tr>
  `).join('');

  const lineItemsTable = `<table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHtml}
      </tbody>
    </table>`;

  // Replace all variables EXCEPT line_items_table first
  const variables: Record<string, string> = {
    customer_name: data.customerName,
    quote_number: data.quoteNumber,
    order_number: data.orderNumber,
    order_type: ORDER_TYPE_LABELS[data.orderType] || data.orderType,
    subtotal: formatPrice(data.subtotal),
    deposit_amount: formatPrice(data.depositAmount),
    deposit_percentage: String(data.depositPercentage),
    valid_until: formatDate(data.validUntil),
    customer_message: data.customerMessage || '',
  };

  const processedSubject = replaceTemplateVariables(subjectText, variables);

  // Process text variables and newlines first, keeping table placeholder intact
  let processedBody = replaceTemplateVariables(templateText, variables)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Remove <br> right before or after the table placeholder
    .replace(/<br>\{\{line_items_table\}\}/g, '{{line_items_table}}')
    .replace(/\{\{line_items_table\}\}<br>/g, '{{line_items_table}}');

  // Now replace the table (after newline conversion so table HTML stays intact)
  processedBody = processedBody.replace(/\{\{line_items_table\}\}/g, lineItemsTable);

  // Add the approve button
  processedBody += `
    <div style="text-align: center; margin-top: 20px;">
      <a href="${data.quoteUrl}" class="btn">View & Approve Quote</a>
    </div>
  `;

  const html = wrapInEmailTemplate(processedBody, processedSubject, 'Quote for Your Order');

  return { subject: processedSubject, html };
}

// Build quote approved email from template
export function buildQuoteApprovedFromTemplate(
  template: string | undefined,
  subject: string | undefined,
  data: {
    customerName: string;
    quoteNumber: string;
    orderNumber: string;
    depositAmount: number;
    totalAmount: number;
    invoiceUrl: string;
  }
): { subject: string; html: string } {
  const templateText = template || DEFAULT_TEMPLATES.quote_approved;
  const subjectText = subject || DEFAULT_SUBJECTS.quote_approved;

  const variables: Record<string, string> = {
    customer_name: data.customerName,
    quote_number: data.quoteNumber,
    order_number: data.orderNumber,
    deposit_amount: formatPrice(data.depositAmount),
    total_amount: formatPrice(data.totalAmount),
  };

  const processedSubject = replaceTemplateVariables(subjectText, variables);
  let processedBody = replaceTemplateVariables(templateText, variables)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Add the pay button
  processedBody += `
    <div style="text-align: center; margin-top: 20px;">
      <a href="${data.invoiceUrl}" class="btn">Pay Deposit</a>
    </div>
  `;

  const html = wrapInEmailTemplate(processedBody, processedSubject, 'Quote Approved!');

  return { subject: processedSubject, html };
}

// Build balance invoice email from template
export function buildBalanceInvoiceFromTemplate(
  template: string | undefined,
  subject: string | undefined,
  data: {
    customerName: string;
    orderNumber: string;
    pickupDate: string;
    totalAmount: number;
    depositAmount: number;
    balanceDue: number;
    invoiceUrl: string;
    isDelivery?: boolean;
    deliveryAddress?: string;
  }
): { subject: string; html: string } {
  const isDelivery = data.isDelivery || false;
  const templateText = template || (isDelivery ? DEFAULT_TEMPLATES.balance_invoice_delivery : DEFAULT_TEMPLATES.balance_invoice);
  const subjectText = subject || (isDelivery ? DEFAULT_SUBJECTS.balance_invoice_delivery : DEFAULT_SUBJECTS.balance_invoice);

  const variables: Record<string, string> = {
    customer_name: data.customerName,
    order_number: data.orderNumber,
    pickup_date: data.pickupDate ? formatDate(data.pickupDate) : 'TBD',
    delivery_date: data.pickupDate ? formatDate(data.pickupDate) : 'TBD',
    delivery_address: data.deliveryAddress || '',
    total_amount: formatPrice(data.totalAmount),
    deposit_amount: formatPrice(data.depositAmount),
    balance_due: formatPrice(data.balanceDue),
  };

  const processedSubject = replaceTemplateVariables(subjectText, variables);
  let processedBody = replaceTemplateVariables(templateText, variables)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Add the pay button
  processedBody += `
    <div style="text-align: center; margin-top: 20px;">
      <a href="${data.invoiceUrl}" class="btn">Pay Balance</a>
    </div>
  `;

  const html = wrapInEmailTemplate(processedBody, processedSubject, 'Balance Due');

  return { subject: processedSubject, html };
}

// Build contract sent email from template
export function buildContractSentFromTemplate(
  template: string | undefined,
  subject: string | undefined,
  data: {
    customerName: string;
    contractNumber: string;
    validUntil: string;
    contractUrl: string;
  }
): { subject: string; html: string } {
  const templateText = template || DEFAULT_TEMPLATES.contract_sent;
  const subjectText = subject || DEFAULT_SUBJECTS.contract_sent;

  const variables: Record<string, string> = {
    customer_name: data.customerName,
    contract_number: data.contractNumber,
    valid_until: data.validUntil ? formatDate(data.validUntil) : 'TBD',
  };

  const processedSubject = replaceTemplateVariables(subjectText, variables);
  let processedBody = replaceTemplateVariables(templateText, variables)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  processedBody += `
    <div style="text-align: center; margin-top: 20px;">
      <a href="${data.contractUrl}" class="btn">View & Sign Contract</a>
    </div>
  `;

  const html = wrapInEmailTemplate(processedBody, processedSubject, 'Wedding Contract');

  return { subject: processedSubject, html };
}

// Build contract signed confirmation email from template
export function buildContractSignedFromTemplate(
  template: string | undefined,
  subject: string | undefined,
  data: {
    customerName: string;
    contractNumber: string;
  }
): { subject: string; html: string } {
  const templateText = template || DEFAULT_TEMPLATES.contract_signed;
  const subjectText = subject || DEFAULT_SUBJECTS.contract_signed;

  const variables: Record<string, string> = {
    customer_name: data.customerName,
    contract_number: data.contractNumber,
  };

  const processedSubject = replaceTemplateVariables(subjectText, variables);
  const processedBody = replaceTemplateVariables(templateText, variables)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  const html = wrapInEmailTemplate(processedBody, processedSubject, 'Contract Signed!');

  return { subject: processedSubject, html };
}

// ============================================
// ADMIN NOTIFICATION TEMPLATES
// These are emails sent TO Coral when customers submit forms
// ============================================

export const DEFAULT_ADMIN_TEMPLATES = {
  contact_form: `**New Contact Form Message**

**From:** {{customer_name}}
**Email:** {{customer_email}}

**Message:**
{{message}}`,

  cake_inquiry: `**New Cake Inquiry**

**Order Number:** {{order_number}}

**Customer Information:**
**Name:** {{customer_name}}
**Email:** {{customer_email}}
**Phone:** {{customer_phone}}

**Cake Details:**
**Event Type:** {{event_type}}
**Pickup Date:** {{pickup_date}}
**Pickup Time:** {{pickup_time}}
**Size:** {{cake_size}}
**Shape:** {{cake_shape}}
**Flavor:** {{cake_flavor}}
**Filling:** {{filling}}
**Base Color:** {{base_color}}
**Piping Colors:** {{piping_colors}}
**Custom Message:** {{custom_messaging}}
**Toppings:** {{toppings}}
**Allergies:** {{allergies}}
{{notes}}

{{admin_link}}`,

  large_cookie_order: `**New Large Cookie Order**

**Order Number:** {{order_number}}

**Customer Information:**
**Name:** {{customer_name}}
**Email:** {{customer_email}}
**Phone:** {{customer_phone}}

**Order Details:**
**Quantity:** {{quantity}} dozen ({{cookie_count}} cookies)
**Flavors:** {{flavors}}
**Packaging:** {{packaging}}
**Event Type:** {{event_type}}
**Event Date:** {{event_date}}
**Pickup/Delivery:** {{pickup_delivery}}
**Pickup Date:** {{pickup_date}}
**Pickup Time:** {{pickup_time}}
**Allergies:** {{allergies}}
{{notes}}

{{admin_link}}`,

  wedding_inquiry: `**New Wedding Inquiry**

**Order Number:** {{order_number}}

**Customer Information:**
**Name:** {{customer_name}}
**Partner:** {{partner_name}}
**Email:** {{customer_email}}
**Phone:** {{customer_phone}}

**Wedding Details:**
**Wedding Date:** {{wedding_date}}
**Venue:** {{venue}}
**Start Time:** {{start_time}}
**Guest Count:** {{guest_count}}
**Services Needed:** {{services}}
**Pickup/Delivery:** {{pickup_delivery}}
{{cake_details}}
{{cookie_details}}
**Dietary Restrictions:** {{dietary_restrictions}}
**Inspiration Images:** {{image_count}} uploaded
{{design_notes}}

{{admin_link}}`,

  tasting_order: `**New Tasting Order**

**Order Number:** {{order_number}}
**Amount:** {{amount}}

**Customer Information:**
**Name:** {{customer_name}}
**Email:** {{customer_email}}
**Phone:** {{customer_phone}}

**Tasting Details:**
**Type:** {{tasting_type}}
**Wedding Date:** {{wedding_date}}
**Pickup Date:** {{pickup_date}}
**Pickup Time:** {{pickup_time}}

{{admin_link}}`,
};

export const DEFAULT_ADMIN_SUBJECTS = {
  contact_form: 'New Contact Form Message from {{customer_name}}',
  cake_inquiry: 'New Cake Inquiry - {{order_number}}',
  large_cookie_order: 'New Large Cookie Order - {{order_number}}',
  wedding_inquiry: 'New Wedding Inquiry - {{order_number}}',
  tasting_order: 'New Tasting Order - {{order_number}}',
};

// Build contact form notification email
export function buildContactFormNotification(
  template: string | undefined,
  subject: string | undefined,
  data: {
    customerName: string;
    customerEmail: string;
    message: string;
  }
): { subject: string; html: string } {
  const templateText = template || DEFAULT_ADMIN_TEMPLATES.contact_form;
  const subjectText = subject || DEFAULT_ADMIN_SUBJECTS.contact_form;

  const variables: Record<string, string> = {
    customer_name: data.customerName,
    customer_email: data.customerEmail,
    message: data.message,
  };

  const processedSubject = replaceTemplateVariables(subjectText, variables);
  const processedBody = replaceTemplateVariables(templateText, variables)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  const html = wrapInEmailTemplate(processedBody, processedSubject, 'New Message');

  return { subject: processedSubject, html };
}

// Build cake inquiry notification email
export function buildCakeInquiryNotification(
  template: string | undefined,
  subject: string | undefined,
  data: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    eventType: string;
    pickupDate: string;
    pickupTime: string;
    cakeSize: string;
    cakeShape: string;
    cakeFlavor: string;
    filling: string;
    baseColor: string;
    pipingColors: string;
    customMessaging: string;
    toppings: string;
    allergies: string;
    notes: string;
    adminUrl: string;
  }
): { subject: string; html: string } {
  const templateText = template || DEFAULT_ADMIN_TEMPLATES.cake_inquiry;
  const subjectText = subject || DEFAULT_ADMIN_SUBJECTS.cake_inquiry;

  // Validate URL protocol
  const safeAdminUrl = data.adminUrl.startsWith('https://') || data.adminUrl.startsWith('http://') ? data.adminUrl : '#';

  const variables: Record<string, string> = {
    order_number: data.orderNumber,
    customer_name: data.customerName,
    customer_email: data.customerEmail,
    customer_phone: data.customerPhone,
    event_type: data.eventType || 'Not specified',
    pickup_date: data.pickupDate || 'TBD',
    pickup_time: data.pickupTime || 'TBD',
    cake_size: data.cakeSize || 'Not specified',
    cake_shape: data.cakeShape || 'Not specified',
    cake_flavor: data.cakeFlavor || 'Not specified',
    filling: data.filling || 'None',
    base_color: data.baseColor || 'Not specified',
    piping_colors: data.pipingColors || 'Not specified',
    custom_messaging: data.customMessaging || 'None',
    toppings: data.toppings || 'None',
    allergies: data.allergies || 'None',
    notes: data.notes ? `**Additional Notes:** ${data.notes}` : '',
    admin_link: `[View in Admin Dashboard](${safeAdminUrl})`,
  };

  const processedSubject = replaceTemplateVariables(subjectText, variables);
  const processedBody = replaceTemplateVariables(templateText, variables)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  const html = wrapInEmailTemplate(processedBody, processedSubject, 'New Cake Inquiry');

  return { subject: processedSubject, html };
}

// Build large cookie order notification email
export function buildLargeCookieOrderNotification(
  template: string | undefined,
  subject: string | undefined,
  data: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    quantity: number;
    flavors: string;
    packaging: string;
    eventType: string;
    eventDate: string;
    pickupDelivery: string;
    pickupDate: string;
    pickupTime: string;
    allergies: string;
    notes: string;
    adminUrl: string;
  }
): { subject: string; html: string } {
  const templateText = template || DEFAULT_ADMIN_TEMPLATES.large_cookie_order;
  const subjectText = subject || DEFAULT_ADMIN_SUBJECTS.large_cookie_order;

  // Validate URL protocol
  const safeAdminUrl = data.adminUrl.startsWith('https://') || data.adminUrl.startsWith('http://') ? data.adminUrl : '#';

  const variables: Record<string, string> = {
    order_number: data.orderNumber,
    customer_name: data.customerName,
    customer_email: data.customerEmail,
    customer_phone: data.customerPhone,
    quantity: String(data.quantity),
    cookie_count: String(data.quantity * 12),
    flavors: data.flavors || 'Not specified',
    packaging: data.packaging === 'heat-sealed' ? 'Individually Heat Sealed' : 'Standard',
    event_type: data.eventType || 'Not specified',
    event_date: data.eventDate || 'TBD',
    pickup_delivery: data.pickupDelivery,
    pickup_date: data.pickupDate || 'TBD',
    pickup_time: data.pickupTime || 'TBD',
    allergies: data.allergies || 'None noted',
    notes: data.notes ? `**Additional Notes:** ${data.notes}` : '',
    admin_link: `[View in Admin Dashboard](${safeAdminUrl})`,
  };

  const processedSubject = replaceTemplateVariables(subjectText, variables);
  const processedBody = replaceTemplateVariables(templateText, variables)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  const html = wrapInEmailTemplate(processedBody, processedSubject, 'New Large Cookie Order');

  return { subject: processedSubject, html };
}

// Build wedding inquiry notification email
export function buildWeddingInquiryNotification(
  template: string | undefined,
  subject: string | undefined,
  data: {
    orderNumber: string;
    customerName: string;
    partnerName: string;
    customerEmail: string;
    customerPhone: string;
    weddingDate: string;
    venue: string;
    startTime: string;
    guestCount: string;
    services: string;
    pickupDelivery: string;
    cakeDetails: string;
    cookieDetails: string;
    dietaryRestrictions: string;
    imageCount: number;
    designNotes: string;
    adminUrl: string;
  }
): { subject: string; html: string } {
  const templateText = template || DEFAULT_ADMIN_TEMPLATES.wedding_inquiry;
  const subjectText = subject || DEFAULT_ADMIN_SUBJECTS.wedding_inquiry;

  // Validate URL protocol
  const safeAdminUrl = data.adminUrl.startsWith('https://') || data.adminUrl.startsWith('http://') ? data.adminUrl : '#';

  const variables: Record<string, string> = {
    order_number: data.orderNumber,
    customer_name: data.customerName,
    partner_name: data.partnerName || 'Not specified',
    customer_email: data.customerEmail,
    customer_phone: data.customerPhone,
    wedding_date: data.weddingDate,
    venue: data.venue || 'TBD',
    start_time: data.startTime || 'TBD',
    guest_count: data.guestCount || 'Not specified',
    services: data.services,
    pickup_delivery: data.pickupDelivery === 'delivery' ? 'Delivery' : 'Pickup',
    cake_details: data.cakeDetails ? `**Cake Details:** ${data.cakeDetails}` : '',
    cookie_details: data.cookieDetails ? `**Cookie Details:** ${data.cookieDetails}` : '',
    dietary_restrictions: data.dietaryRestrictions || 'None',
    image_count: String(data.imageCount),
    design_notes: data.designNotes ? `**Design Notes:** ${data.designNotes}` : '',
    admin_link: `[View in Admin Dashboard](${safeAdminUrl})`,
  };

  const processedSubject = replaceTemplateVariables(subjectText, variables);
  const processedBody = replaceTemplateVariables(templateText, variables)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  const html = wrapInEmailTemplate(processedBody, processedSubject, 'New Wedding Inquiry');

  return { subject: processedSubject, html };
}

// Build tasting order notification email
export function buildTastingOrderNotification(
  template: string | undefined,
  subject: string | undefined,
  data: {
    orderNumber: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    tastingType: string;
    weddingDate: string;
    pickupDate: string;
    pickupTime: string;
    adminUrl: string;
  }
): { subject: string; html: string } {
  const templateText = template || DEFAULT_ADMIN_TEMPLATES.tasting_order;
  const subjectText = subject || DEFAULT_ADMIN_SUBJECTS.tasting_order;

  // Validate URL protocol
  const safeAdminUrl = data.adminUrl.startsWith('https://') || data.adminUrl.startsWith('http://') ? data.adminUrl : '#';

  const tastingTypeLabels: Record<string, string> = {
    cake: 'Cake Tasting',
    cookie: 'Cookie Tasting',
    both: 'Cake & Cookie Tasting',
  };

  const variables: Record<string, string> = {
    order_number: data.orderNumber,
    amount: formatPrice(data.amount),
    customer_name: data.customerName,
    customer_email: data.customerEmail,
    customer_phone: data.customerPhone,
    tasting_type: tastingTypeLabels[data.tastingType] || data.tastingType,
    wedding_date: data.weddingDate,
    pickup_date: data.pickupDate,
    pickup_time: data.pickupTime || 'TBD',
    admin_link: `[View in Admin Dashboard](${safeAdminUrl})`,
  };

  const processedSubject = replaceTemplateVariables(subjectText, variables);
  const processedBody = replaceTemplateVariables(templateText, variables)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  const html = wrapInEmailTemplate(processedBody, processedSubject, 'New Tasting Order');

  return { subject: processedSubject, html };
}
