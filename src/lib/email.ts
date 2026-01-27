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
        from: 'Bakes by Coral <noreply@bakesbycoral.com>',
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

// Email templates

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
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
        .order-number { font-size: 24px; font-weight: bold; color: #f59e0b; }
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
          ${new Date(data.pickupDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
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
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
        .label { font-weight: bold; color: #666; }
        .btn { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
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

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}
