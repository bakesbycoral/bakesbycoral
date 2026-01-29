// Email sending utility using Resend

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
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
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bakes by Coral <onboarding@resend.dev>',
        to: Array.isArray(options.to) ? options.to : [options.to],
        reply_to: options.replyTo,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send email:', await response.text());
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
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
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
          <p>Homemade Gluten-Free Baked Goods</p>
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
          <h1 style="margin: 0;">Bakes by Coral</h1>
        </div>
        <div class="content">
          <h2>Thank you for your order, ${data.customerName}!</h2>
          <p>We've received your ${orderTypeLabels[data.orderType] || 'order'} and will be in touch soon.</p>

          <p><strong>Order Number:</strong></p>
          <p class="order-number">${data.orderNumber}</p>

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
          <p>Homemade Gluten-Free Baked Goods</p>
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
          <p><span class="label">Order Number:</span> ${data.orderNumber}</p>
          <p><span class="label">Type:</span> ${orderTypeLabels[data.orderType]}</p>
          <hr>
          <p><span class="label">Customer:</span> ${data.customerName}</p>
          <p><span class="label">Email:</span> <a href="mailto:${data.customerEmail}">${data.customerEmail}</a></p>
          <p><span class="label">Phone:</span> <a href="tel:${data.customerPhone}">${data.customerPhone}</a></p>
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
          <h1 style="margin: 0;">Pickup Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>

          <p>Just a friendly reminder that your order is ready for pickup <strong>tomorrow</strong>!</p>

          <div class="highlight">
            <p><strong>Order:</strong> <span class="order-number">${data.orderNumber}</span></p>
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
          <p>Homemade Gluten-Free Baked Goods</p>
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
          <p><span class="label">Order:</span> ${data.orderNumber}</p>
          <p><span class="label">Type:</span> ${orderTypeLabels[data.orderType] || data.orderType}</p>
          <p><span class="label">Pickup:</span> ${formatDate(data.pickupDate)} at ${formatTime(data.pickupTime)}</p>
          <hr>
          <p><span class="label">Customer:</span> ${data.customerName}</p>
          <p><span class="label">Email:</span> <a href="mailto:${data.customerEmail}">${data.customerEmail}</a></p>
          <p><span class="label">Phone:</span> <a href="tel:${data.customerPhone}">${data.customerPhone}</a></p>

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
        .header h1 { margin: 0; font-size: 28px; font-weight: normal; }
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
          <p>Hi ${data.customerName},</p>

          <p>Thank you for your inquiry! Here's your personalized quote for your ${ORDER_TYPE_LABELS[data.orderType] || data.orderType}:</p>

          <p class="quote-number">${data.quoteNumber}</p>
          <p style="color: #666; font-size: 14px;">Order: ${data.orderNumber}</p>

          ${data.customerMessage ? `
          <div style="background: #EAD6D6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #541409;">${data.customerMessage}</p>
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
          <p>Homemade Gluten-Free Baked Goods</p>
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
        .header h1 { margin: 0; font-size: 28px; font-weight: normal; }
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
          <p>Hi ${data.customerName},</p>

          <p>Thank you for approving your quote! Your order is now confirmed and we've sent you an invoice for the deposit.</p>

          <div class="summary">
            <p style="margin: 0 0 10px 0;"><strong>Quote:</strong> ${data.quoteNumber}</p>
            <p style="margin: 0 0 10px 0;"><strong>Order:</strong> ${data.orderNumber}</p>
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
          <p>Homemade Gluten-Free Baked Goods</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
