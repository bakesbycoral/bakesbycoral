'use client';

import { useState, useEffect } from 'react';

type CustomerTemplateKey = 'quote' | 'quote_approved' | 'confirmation' | 'reminder' | 'balance_invoice';
type AdminTemplateKey = 'contact_form' | 'cake_inquiry' | 'large_cookie_order' | 'wedding_inquiry' | 'tasting_order';
type TemplateSection = 'customer' | 'admin';

const CUSTOMER_TEMPLATE_LABELS: Record<CustomerTemplateKey, string> = {
  quote: 'Quote Email',
  quote_approved: 'Quote Approved',
  confirmation: 'Order Confirmation',
  reminder: 'Pickup Reminder',
  balance_invoice: 'Balance Invoice',
};

const ADMIN_TEMPLATE_LABELS: Record<AdminTemplateKey, string> = {
  contact_form: 'Contact Form',
  cake_inquiry: 'Cake Inquiry',
  large_cookie_order: 'Large Cookie Order',
  wedding_inquiry: 'Wedding Inquiry',
  tasting_order: 'Tasting Order',
};

const CUSTOMER_HEADER_TEXT: Record<CustomerTemplateKey, string> = {
  quote: 'Quote for Your Order',
  quote_approved: 'Quote Approved!',
  confirmation: '',
  reminder: 'Pickup Reminder',
  balance_invoice: 'Balance Due',
};

const ADMIN_HEADER_TEXT: Record<AdminTemplateKey, string> = {
  contact_form: 'New Message',
  cake_inquiry: 'New Cake Inquiry',
  large_cookie_order: 'New Large Cookie Order',
  wedding_inquiry: 'New Wedding Inquiry',
  tasting_order: 'New Tasting Order',
};

const DEFAULT_CUSTOMER_TEMPLATES: Record<CustomerTemplateKey, string> = {
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
};

const DEFAULT_ADMIN_TEMPLATES: Record<AdminTemplateKey, string> = {
  contact_form: `**New Contact Form Message**

**From:** {{customer_name}}
**Email:** {{customer_email}}

**Message:**
{{message}}`,

  cake_inquiry: `**New Cake Inquiry**

**Order Number:** {{order_number}}

**Customer Information:**
- Name: {{customer_name}}
- Email: {{customer_email}}
- Phone: {{customer_phone}}

**Event Details:**
- Event Type: {{event_type}}
- Pickup Date: {{pickup_date}}
- Pickup Time: {{pickup_time}}

**Cake Details:**
- Size: {{cake_size}}
- Shape: {{cake_shape}}
- Flavor: {{cake_flavor}}
- Filling: {{filling}}
- Base Color: {{base_color}}
- Piping Colors: {{piping_colors}}
- Custom Message: {{custom_messaging}}
- Toppings: {{toppings}}

**Allergies:** {{allergies}}
**Notes:** {{notes}}`,

  large_cookie_order: `**New Large Cookie Order**

**Order Number:** {{order_number}}

**Customer Information:**
- Name: {{customer_name}}
- Email: {{customer_email}}
- Phone: {{customer_phone}}

**Order Details:**
- Quantity: {{quantity}} dozen
- Flavors: {{flavors}}
- Packaging: {{packaging}}

**Event:**
- Type: {{event_type}}
- Date: {{event_date}}

**Pickup/Delivery:** {{pickup_delivery}}
- Date: {{pickup_date}}
- Time: {{pickup_time}}

**Allergies:** {{allergies}}
**Notes:** {{notes}}`,

  wedding_inquiry: `**New Wedding Inquiry**

**Order Number:** {{order_number}}

**Couple Information:**
- Name: {{customer_name}}
- Partner: {{partner_name}}
- Email: {{customer_email}}
- Phone: {{customer_phone}}

**Wedding Details:**
- Date: {{wedding_date}}
- Venue: {{venue}}
- Start Time: {{start_time}}
- Guest Count: {{guest_count}}

**Services Requested:** {{services}}
**Pickup/Delivery:** {{pickup_delivery}}

**Cake Details:** {{cake_details}}
**Cookie Details:** {{cookie_details}}

**Dietary Restrictions:** {{dietary_restrictions}}
**Inspiration Images:** {{image_count}} uploaded
**Design Notes:** {{design_notes}}`,

  tasting_order: `**New Tasting Order**

**Order Number:** {{order_number}}
**Amount:** {{amount}}

**Customer Information:**
- Name: {{customer_name}}
- Email: {{customer_email}}
- Phone: {{customer_phone}}

**Tasting Details:**
- Type: {{tasting_type}}
- Wedding Date: {{wedding_date}}

**Pickup:**
- Date: {{pickup_date}}
- Time: {{pickup_time}}`,
};

const DEFAULT_CUSTOMER_SUBJECTS: Record<CustomerTemplateKey, string> = {
  reminder: 'Pickup Reminder - {{order_number}}',
  confirmation: 'Order Confirmed - {{order_number}}',
  quote: 'Your Quote from Bakes by Coral - {{quote_number}}',
  quote_approved: 'Quote Approved! - {{quote_number}}',
  balance_invoice: 'Balance Due - {{order_number}}',
};

const DEFAULT_ADMIN_SUBJECTS: Record<AdminTemplateKey, string> = {
  contact_form: 'New Contact Form Message from {{customer_name}}',
  cake_inquiry: 'New Cake Inquiry - {{order_number}}',
  large_cookie_order: 'New Large Cookie Order - {{order_number}}',
  wedding_inquiry: 'New Wedding Inquiry - {{order_number}}',
  tasting_order: 'New Tasting Order - {{order_number}}',
};

// Sample data for customer email previews
const customerSampleData: Record<string, string> = {
  customer_name: 'Jane Smith',
  quote_number: 'Q-2025-001',
  order_number: 'ORD-2025-001',
  order_type: 'Custom Cake',
  deposit_amount: '$75.00',
  deposit_percentage: '50',
  total_amount: '$150.00',
  subtotal: '$150.00',
  balance_due: '$75.00',
  valid_until: 'Friday, February 14, 2025',
  pickup_date: 'Saturday, February 15, 2025',
  pickup_time: '2:00 PM',
  customer_message: 'Looking forward to creating something special for your celebration!',
  order_details: '8" Round Chocolate Cake with custom decorations',
  line_items_table: `<table style="width: 100%; border-collapse: collapse; margin: 0 0 16px 0;">
      <thead>
        <tr>
          <th style="background: #EAD6D6; color: #541409; padding: 12px; text-align: left;">Item</th>
          <th style="background: #EAD6D6; color: #541409; padding: 12px; text-align: center;">Qty</th>
          <th style="background: #EAD6D6; color: #541409; padding: 12px; text-align: right;">Price</th>
          <th style="background: #EAD6D6; color: #541409; padding: 12px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #EAD6D6;">8" Round Chocolate Cake</td>
          <td style="padding: 12px; border-bottom: 1px solid #EAD6D6; text-align: center;">1</td>
          <td style="padding: 12px; border-bottom: 1px solid #EAD6D6; text-align: right;">$120.00</td>
          <td style="padding: 12px; border-bottom: 1px solid #EAD6D6; text-align: right;">$120.00</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #EAD6D6;">Custom Decorations</td>
          <td style="padding: 12px; border-bottom: 1px solid #EAD6D6; text-align: center;">1</td>
          <td style="padding: 12px; border-bottom: 1px solid #EAD6D6; text-align: right;">$30.00</td>
          <td style="padding: 12px; border-bottom: 1px solid #EAD6D6; text-align: right;">$30.00</td>
        </tr>
      </tbody>
    </table>`,
};

// Sample data for admin notification previews
const adminSampleData: Record<string, string> = {
  customer_name: 'Jane Smith',
  customer_email: 'jane@example.com',
  customer_phone: '(513) 555-1234',
  order_number: 'CAKE-M1ABC2D',
  quote_number: 'Q-2025-001',
  message: 'Hi! I was wondering if you could make a gluten-free birthday cake for my daughter. She loves chocolate and strawberries. Please let me know if this is possible!',

  // Cake inquiry
  event_type: 'Birthday',
  pickup_date: 'Saturday, February 15, 2025',
  pickup_time: '2:00 PM',
  cake_size: '8" Round (serves 12-16)',
  cake_shape: 'Round',
  cake_flavor: 'Chocolate',
  filling: 'Strawberry',
  base_color: 'White',
  piping_colors: 'Pink, Gold',
  custom_messaging: 'Happy 10th Birthday Emma!',
  toppings: 'Fresh Flowers, Sprinkles',
  allergies: 'None',
  notes: 'Please make it extra festive!',

  // Large cookie order
  quantity: '6',
  flavors: 'Chocolate Chip: 3, Vanilla Bean Sugar: 2, Cherry Almond: 1',
  packaging: 'Individual bags with ribbon',
  event_date: 'Saturday, March 1, 2025',
  pickup_delivery: 'Delivery to: 123 Main St, Cincinnati OH 45202',

  // Wedding inquiry
  partner_name: 'John Smith',
  wedding_date: 'Saturday, June 15, 2025',
  venue: 'The Grand Ballroom, 456 Oak Ave, Cincinnati OH',
  start_time: '4:00 PM',
  guest_count: '150',
  services: 'Cake + Cookies',
  cake_details: 'Size: 3-tier, Flavor: Vanilla',
  cookie_details: '10 dozen',
  dietary_restrictions: 'Gluten-free required',
  image_count: '3',
  design_notes: 'Elegant, romantic style with blush pink accents',

  // Tasting order
  tasting_type: 'Cake & Cookie Tasting Boxes',
  amount: '$100.00',
  admin_url: 'https://bakesbycoral.com/admin/orders',
};

function replaceVariables(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

function generateCustomerEmailHtml(template: string, subject: string, headerText: string, templateKey: CustomerTemplateKey): string {
  // Replace all variables EXCEPT line_items_table first
  let processedBody = template;
  for (const [key, value] of Object.entries(customerSampleData)) {
    if (key !== 'line_items_table') {
      processedBody = processedBody.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
  }

  // Process markdown and newlines (but not the table placeholder)
  processedBody = processedBody
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Remove <br> right before or after the table placeholder
    .replace(/<br>\{\{line_items_table\}\}/g, '{{line_items_table}}')
    .replace(/\{\{line_items_table\}\}<br>/g, '{{line_items_table}}');

  // Now replace the table (after newline conversion so table HTML stays intact)
  processedBody = processedBody.replace(/\{\{line_items_table\}\}/g, customerSampleData.line_items_table);

  // Add button for quote templates
  if (templateKey === 'quote') {
    processedBody += `
      <div style="text-align: center; margin-top: 20px;">
        <a href="#" style="display: inline-block; background: #541409; color: #EAD6D6 !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">View & Approve Quote</a>
      </div>
    `;
  } else if (templateKey === 'quote_approved') {
    processedBody += `
      <div style="text-align: center; margin-top: 20px;">
        <a href="#" style="display: inline-block; background: #541409; color: #EAD6D6 !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">Pay Deposit</a>
      </div>
    `;
  } else if (templateKey === 'balance_invoice') {
    processedBody += `
      <div style="text-align: center; margin-top: 20px;">
        <a href="#" style="display: inline-block; background: #541409; color: #EAD6D6 !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">Pay Balance</a>
      </div>
    `;
  }

  return generateEmailWrapper(processedBody, replaceVariables(subject, customerSampleData), headerText);
}

function generateAdminEmailHtml(template: string, subject: string, headerText: string): string {
  let processedBody = replaceVariables(template, adminSampleData);

  // Process markdown and newlines
  processedBody = processedBody
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Add admin link button
  processedBody += `
    <div style="text-align: center; margin-top: 20px;">
      <a href="#" style="display: inline-block; background: #541409; color: #EAD6D6 !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Admin</a>
    </div>
  `;

  return generateEmailWrapper(processedBody, replaceVariables(subject, adminSampleData), headerText);
}

function generateEmailWrapper(body: string, subject: string, headerText: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
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
          <p>${body}</p>
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

export default function EmailPreviewPage() {
  const [section, setSection] = useState<TemplateSection>('customer');
  const [selectedCustomerTemplate, setSelectedCustomerTemplate] = useState<CustomerTemplateKey>('quote');
  const [selectedAdminTemplate, setSelectedAdminTemplate] = useState<AdminTemplateKey>('contact_form');
  const [customerTemplates, setCustomerTemplates] = useState<Record<CustomerTemplateKey, string>>(DEFAULT_CUSTOMER_TEMPLATES);
  const [customerSubjects, setCustomerSubjects] = useState<Record<CustomerTemplateKey, string>>(DEFAULT_CUSTOMER_SUBJECTS);
  const [adminTemplates, setAdminTemplates] = useState<Record<AdminTemplateKey, string>>(DEFAULT_ADMIN_TEMPLATES);
  const [adminSubjects, setAdminSubjects] = useState<Record<AdminTemplateKey, string>>(DEFAULT_ADMIN_SUBJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json() as { settings?: Record<string, string> };
          const settings = data.settings || {};

          // Load customer templates
          setCustomerTemplates({
            confirmation: settings.email_template_confirmation || DEFAULT_CUSTOMER_TEMPLATES.confirmation,
            reminder: settings.email_template_reminder || DEFAULT_CUSTOMER_TEMPLATES.reminder,
            quote: settings.email_template_quote || DEFAULT_CUSTOMER_TEMPLATES.quote,
            quote_approved: settings.email_template_quote_approved || DEFAULT_CUSTOMER_TEMPLATES.quote_approved,
            balance_invoice: settings.email_template_balance_invoice || DEFAULT_CUSTOMER_TEMPLATES.balance_invoice,
          });

          setCustomerSubjects({
            confirmation: settings.email_subject_confirmation || DEFAULT_CUSTOMER_SUBJECTS.confirmation,
            reminder: settings.email_subject_reminder || DEFAULT_CUSTOMER_SUBJECTS.reminder,
            quote: settings.email_subject_quote || DEFAULT_CUSTOMER_SUBJECTS.quote,
            quote_approved: settings.email_subject_quote_approved || DEFAULT_CUSTOMER_SUBJECTS.quote_approved,
            balance_invoice: settings.email_subject_balance_invoice || DEFAULT_CUSTOMER_SUBJECTS.balance_invoice,
          });

          // Load admin templates
          setAdminTemplates({
            contact_form: settings.email_template_contact_form || DEFAULT_ADMIN_TEMPLATES.contact_form,
            cake_inquiry: settings.email_template_cake_inquiry || DEFAULT_ADMIN_TEMPLATES.cake_inquiry,
            large_cookie_order: settings.email_template_large_cookie_order || DEFAULT_ADMIN_TEMPLATES.large_cookie_order,
            wedding_inquiry: settings.email_template_wedding_inquiry || DEFAULT_ADMIN_TEMPLATES.wedding_inquiry,
            tasting_order: settings.email_template_tasting_order || DEFAULT_ADMIN_TEMPLATES.tasting_order,
          });

          setAdminSubjects({
            contact_form: settings.email_subject_contact_form || DEFAULT_ADMIN_SUBJECTS.contact_form,
            cake_inquiry: settings.email_subject_cake_inquiry || DEFAULT_ADMIN_SUBJECTS.cake_inquiry,
            large_cookie_order: settings.email_subject_large_cookie_order || DEFAULT_ADMIN_SUBJECTS.large_cookie_order,
            wedding_inquiry: settings.email_subject_wedding_inquiry || DEFAULT_ADMIN_SUBJECTS.wedding_inquiry,
            tasting_order: settings.email_subject_tasting_order || DEFAULT_ADMIN_SUBJECTS.tasting_order,
          });
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, []);

  // Generate the appropriate email HTML based on section
  const emailHtml = section === 'customer'
    ? generateCustomerEmailHtml(
        customerTemplates[selectedCustomerTemplate],
        customerSubjects[selectedCustomerTemplate],
        CUSTOMER_HEADER_TEXT[selectedCustomerTemplate],
        selectedCustomerTemplate
      )
    : generateAdminEmailHtml(
        adminTemplates[selectedAdminTemplate],
        adminSubjects[selectedAdminTemplate],
        ADMIN_HEADER_TEXT[selectedAdminTemplate]
      );

  const processedSubject = section === 'customer'
    ? replaceVariables(customerSubjects[selectedCustomerTemplate], customerSampleData)
    : replaceVariables(adminSubjects[selectedAdminTemplate], adminSampleData);

  const recipientDisplay = section === 'customer'
    ? `${customerSampleData.customer_name} <customer@example.com>`
    : 'coral@bakesbycoral.com';

  return (
    <div className="min-h-screen bg-[#F7F3ED]">
      {/* Header */}
      <header className="bg-[#541409] text-[#EAD6D6] py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Email Template Preview</h1>
            <p className="text-sm opacity-80">Preview how emails look with your saved templates</p>
          </div>
          <a
            href="/admin/emails"
            className="px-4 py-2 bg-[#EAD6D6] text-[#541409] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Back to Emails
          </a>
        </div>
      </header>

      {/* Section Toggle */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSection('customer')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              section === 'customer'
                ? 'bg-[#541409] text-[#EAD6D6]'
                : 'bg-white text-[#541409] border border-[#EAD6D6] hover:border-[#541409]'
            }`}
          >
            Customer Emails
          </button>
          <button
            onClick={() => setSection('admin')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              section === 'admin'
                ? 'bg-[#541409] text-[#EAD6D6]'
                : 'bg-white text-[#541409] border border-[#EAD6D6] hover:border-[#541409]'
            }`}
          >
            Admin Notifications
          </button>
        </div>
      </div>

      {/* Template Selector */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex gap-2 flex-wrap">
          {section === 'customer' ? (
            (Object.keys(CUSTOMER_TEMPLATE_LABELS) as CustomerTemplateKey[]).map((template) => (
              <button
                key={template}
                onClick={() => setSelectedCustomerTemplate(template)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCustomerTemplate === template
                    ? 'bg-[#541409] text-[#EAD6D6]'
                    : 'bg-white text-[#541409] border border-[#EAD6D6] hover:border-[#541409]'
                }`}
              >
                {CUSTOMER_TEMPLATE_LABELS[template]}
              </button>
            ))
          ) : (
            (Object.keys(ADMIN_TEMPLATE_LABELS) as AdminTemplateKey[]).map((template) => (
              <button
                key={template}
                onClick={() => setSelectedAdminTemplate(template)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedAdminTemplate === template
                    ? 'bg-[#541409] text-[#EAD6D6]'
                    : 'bg-white text-[#541409] border border-[#EAD6D6] hover:border-[#541409]'
                }`}
              >
                {ADMIN_TEMPLATE_LABELS[template]}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Email Preview */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-xl shadow-sm border border-[#EAD6D6] overflow-hidden">
          <div className="p-4 border-b border-[#EAD6D6] bg-gray-50">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  <strong>Subject:</strong> {processedSubject}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>To:</strong> {recipientDisplay}
                </p>
              </>
            )}
          </div>
          {loading ? (
            <div className="h-[800px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#541409] mx-auto"></div>
                <p className="mt-4 text-[#541409]/60">Loading templates...</p>
              </div>
            </div>
          ) : (
            <iframe
              srcDoc={emailHtml}
              className="w-full border-0"
              style={{ height: '800px' }}
              title="Email Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}
