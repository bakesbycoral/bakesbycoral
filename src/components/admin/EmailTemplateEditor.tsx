'use client';

import { useState } from 'react';
import { sanitizeHtml } from '@/lib/sanitize';

type CustomerTemplateKey = 'form_submission' | 'confirmation' | 'confirmation_delivery' | 'reminder' | 'reminder_delivery' | 'quote' | 'quote_approved' | 'balance_invoice' | 'balance_invoice_delivery' | 'contract_sent' | 'contract_signed';
type AdminTemplateKey = 'contact_form' | 'cake_inquiry' | 'large_cookie_order' | 'wedding_inquiry' | 'tasting_order';
type TemplateKey = CustomerTemplateKey | AdminTemplateKey;

interface EmailTemplateEditorProps {
  templates: Record<string, string>;
  subjects: Record<string, string>;
  onSave: (templates: Record<string, string>) => Promise<void>;
}

const CUSTOMER_TEMPLATE_INFO: Record<CustomerTemplateKey, { label: string; description: string }> = {
  form_submission: {
    label: 'Form Submission',
    description: 'Sent to customers when they submit an order (before payment)',
  },
  confirmation: {
    label: 'Confirmation (Pickup)',
    description: 'Sent to customers when payment is completed for pickup orders',
  },
  confirmation_delivery: {
    label: 'Confirmation (Delivery)',
    description: 'Sent to customers when payment is completed for delivery orders',
  },
  reminder: {
    label: 'Reminder (Pickup)',
    description: 'Sent to customers the day before scheduled pickup',
  },
  reminder_delivery: {
    label: 'Reminder (Delivery)',
    description: 'Sent to customers the day before scheduled delivery',
  },
  quote: {
    label: 'Quote Email',
    description: 'Sent to customers when you send them a quote',
  },
  quote_approved: {
    label: 'Quote Approved',
    description: 'Sent to customers when they approve their quote',
  },
  balance_invoice: {
    label: 'Balance (Pickup)',
    description: 'Sent to customers when you request the remaining balance for pickup orders',
  },
  balance_invoice_delivery: {
    label: 'Balance (Delivery)',
    description: 'Sent to customers when you request the remaining balance for delivery orders',
  },
  contract_sent: {
    label: 'Contract Sent',
    description: 'Sent to customers when you send them a wedding contract to sign',
  },
  contract_signed: {
    label: 'Contract Signed',
    description: 'Sent to customers when they sign their wedding contract',
  },
};

const ADMIN_TEMPLATE_INFO: Record<AdminTemplateKey, { label: string; description: string }> = {
  contact_form: {
    label: 'Contact Form',
    description: 'Notification when someone submits the contact form',
  },
  cake_inquiry: {
    label: 'Cake Inquiry',
    description: 'Notification when someone submits a cake inquiry',
  },
  large_cookie_order: {
    label: 'Large Cookie Order',
    description: 'Notification when someone submits a large cookie order',
  },
  wedding_inquiry: {
    label: 'Wedding Inquiry',
    description: 'Notification when someone submits a wedding inquiry',
  },
  tasting_order: {
    label: 'Tasting Order',
    description: 'Notification when someone submits a tasting order',
  },
};

const COMMON_VARIABLES = [
  { key: '{{customer_name}}', description: 'Customer\'s name' },
  { key: '{{order_number}}', description: 'Order number' },
  { key: '{{order_type}}', description: 'Type of order' },
];

const ORDER_VARIABLES = [
  { key: '{{pickup_date}}', description: 'Formatted pickup date' },
  { key: '{{pickup_time}}', description: 'Formatted pickup time' },
  { key: '{{order_details}}', description: 'Order details' },
  { key: '{{total_amount}}', description: 'Total order amount' },
];

const DELIVERY_ORDER_VARIABLES = [
  { key: '{{delivery_date}}', description: 'Formatted delivery date' },
  { key: '{{delivery_time}}', description: 'Formatted delivery time' },
  { key: '{{delivery_address}}', description: 'Delivery address' },
  { key: '{{order_details}}', description: 'Order details' },
  { key: '{{total_amount}}', description: 'Total order amount' },
];

const DELIVERY_BALANCE_VARIABLES = [
  { key: '{{delivery_date}}', description: 'Delivery date' },
  { key: '{{delivery_address}}', description: 'Delivery address' },
  { key: '{{total_amount}}', description: 'Total amount' },
  { key: '{{deposit_amount}}', description: 'Deposit paid' },
  { key: '{{balance_due}}', description: 'Balance remaining' },
];

const QUOTE_VARIABLES = [
  { key: '{{quote_number}}', description: 'Quote number' },
  { key: '{{subtotal}}', description: 'Quote subtotal' },
  { key: '{{deposit_amount}}', description: 'Deposit amount' },
  { key: '{{deposit_percentage}}', description: 'Deposit percentage' },
  { key: '{{valid_until}}', description: 'Quote expiration date' },
  { key: '{{customer_message}}', description: 'Custom message' },
  { key: '{{line_items_table}}', description: 'Table of line items' },
];

const BALANCE_VARIABLES = [
  { key: '{{pickup_date}}', description: 'Pickup date' },
  { key: '{{total_amount}}', description: 'Total amount' },
  { key: '{{deposit_amount}}', description: 'Deposit paid' },
  { key: '{{balance_due}}', description: 'Balance remaining' },
];

const CONTRACT_VARIABLES = [
  { key: '{{contract_number}}', description: 'Contract number' },
  { key: '{{valid_until}}', description: 'Contract expiration date' },
];

const CONTACT_VARIABLES = [
  { key: '{{customer_name}}', description: 'Sender\'s name' },
  { key: '{{customer_email}}', description: 'Sender\'s email' },
  { key: '{{message}}', description: 'Message content' },
];

const CAKE_VARIABLES = [
  { key: '{{order_number}}', description: 'Order number' },
  { key: '{{customer_name}}', description: 'Customer name' },
  { key: '{{customer_email}}', description: 'Customer email' },
  { key: '{{customer_phone}}', description: 'Customer phone' },
  { key: '{{event_type}}', description: 'Event type' },
  { key: '{{pickup_date}}', description: 'Pickup date' },
  { key: '{{pickup_time}}', description: 'Pickup time' },
  { key: '{{cake_size}}', description: 'Cake size' },
  { key: '{{cake_shape}}', description: 'Cake shape' },
  { key: '{{cake_flavor}}', description: 'Cake flavor' },
  { key: '{{filling}}', description: 'Filling' },
  { key: '{{base_color}}', description: 'Base color' },
  { key: '{{piping_colors}}', description: 'Piping colors' },
  { key: '{{custom_messaging}}', description: 'Custom message on cake' },
  { key: '{{toppings}}', description: 'Toppings' },
  { key: '{{allergies}}', description: 'Allergies' },
  { key: '{{notes}}', description: 'Additional notes' },
  { key: '{{admin_link}}', description: 'Link to admin dashboard' },
];

const LARGE_COOKIE_VARIABLES = [
  { key: '{{order_number}}', description: 'Order number' },
  { key: '{{customer_name}}', description: 'Customer name' },
  { key: '{{customer_email}}', description: 'Customer email' },
  { key: '{{customer_phone}}', description: 'Customer phone' },
  { key: '{{quantity}}', description: 'Dozen quantity' },
  { key: '{{cookie_count}}', description: 'Total cookie count' },
  { key: '{{flavors}}', description: 'Flavor breakdown' },
  { key: '{{packaging}}', description: 'Packaging type' },
  { key: '{{event_type}}', description: 'Event type' },
  { key: '{{event_date}}', description: 'Event date' },
  { key: '{{pickup_delivery}}', description: 'Pickup or delivery' },
  { key: '{{pickup_date}}', description: 'Pickup date' },
  { key: '{{pickup_time}}', description: 'Pickup time' },
  { key: '{{allergies}}', description: 'Allergies' },
  { key: '{{notes}}', description: 'Additional notes' },
  { key: '{{admin_link}}', description: 'Link to admin dashboard' },
];

const WEDDING_VARIABLES = [
  { key: '{{order_number}}', description: 'Order number' },
  { key: '{{customer_name}}', description: 'Customer name' },
  { key: '{{partner_name}}', description: 'Partner name' },
  { key: '{{customer_email}}', description: 'Customer email' },
  { key: '{{customer_phone}}', description: 'Customer phone' },
  { key: '{{wedding_date}}', description: 'Wedding date' },
  { key: '{{venue}}', description: 'Venue' },
  { key: '{{start_time}}', description: 'Start time' },
  { key: '{{guest_count}}', description: 'Guest count' },
  { key: '{{services}}', description: 'Services needed' },
  { key: '{{pickup_delivery}}', description: 'Pickup or delivery' },
  { key: '{{cake_details}}', description: 'Cake details' },
  { key: '{{cookie_details}}', description: 'Cookie details' },
  { key: '{{dietary_restrictions}}', description: 'Dietary restrictions' },
  { key: '{{image_count}}', description: 'Inspiration images count' },
  { key: '{{design_notes}}', description: 'Design notes' },
  { key: '{{admin_link}}', description: 'Link to admin dashboard' },
];

const TASTING_VARIABLES = [
  { key: '{{order_number}}', description: 'Order number' },
  { key: '{{amount}}', description: 'Order amount' },
  { key: '{{customer_name}}', description: 'Customer name' },
  { key: '{{customer_email}}', description: 'Customer email' },
  { key: '{{customer_phone}}', description: 'Customer phone' },
  { key: '{{tasting_type}}', description: 'Tasting type' },
  { key: '{{wedding_date}}', description: 'Wedding date' },
  { key: '{{pickup_date}}', description: 'Pickup date' },
  { key: '{{pickup_time}}', description: 'Pickup time' },
  { key: '{{admin_link}}', description: 'Link to admin dashboard' },
];

const getVariablesForTemplate = (template: TemplateKey) => {
  switch (template) {
    case 'quote':
    case 'quote_approved':
      return [...COMMON_VARIABLES, ...QUOTE_VARIABLES];
    case 'contract_sent':
    case 'contract_signed':
      return [...COMMON_VARIABLES, ...CONTRACT_VARIABLES];
    case 'balance_invoice':
      return [...COMMON_VARIABLES, ...BALANCE_VARIABLES];
    case 'balance_invoice_delivery':
      return [...COMMON_VARIABLES, ...DELIVERY_BALANCE_VARIABLES];
    case 'confirmation_delivery':
    case 'reminder_delivery':
      return [...COMMON_VARIABLES, ...DELIVERY_ORDER_VARIABLES];
    case 'contact_form':
      return CONTACT_VARIABLES;
    case 'cake_inquiry':
      return CAKE_VARIABLES;
    case 'large_cookie_order':
      return LARGE_COOKIE_VARIABLES;
    case 'wedding_inquiry':
      return WEDDING_VARIABLES;
    case 'tasting_order':
      return TASTING_VARIABLES;
    default:
      return [...COMMON_VARIABLES, ...ORDER_VARIABLES];
  }
};

const ALL_TEMPLATE_KEYS: TemplateKey[] = [
  'form_submission', 'confirmation', 'confirmation_delivery', 'reminder', 'reminder_delivery', 'quote', 'quote_approved', 'balance_invoice', 'balance_invoice_delivery', 'contract_sent', 'contract_signed',
  'contact_form', 'cake_inquiry', 'large_cookie_order', 'wedding_inquiry', 'tasting_order',
];

export function EmailTemplateEditor({ templates, subjects, onSave }: EmailTemplateEditorProps) {
  const [activeSection, setActiveSection] = useState<'customer' | 'admin'>('customer');
  const [activeTab, setActiveTab] = useState<TemplateKey>('form_submission');
  const [editedTemplates, setEditedTemplates] = useState(templates);
  const [editedSubjects, setEditedSubjects] = useState(subjects);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const saveData: Record<string, string> = {};
      for (const key of ALL_TEMPLATE_KEYS) {
        saveData[`email_template_${key}`] = editedTemplates[key] || '';
        saveData[`email_subject_${key}`] = editedSubjects[key] || '';
      }
      await onSave(saveData);
      setMessage({ type: 'success', text: 'Email templates saved!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save templates' });
    } finally {
      setIsSaving(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentTemplate = editedTemplates[activeTab] || '';
      const newTemplate = currentTemplate.slice(0, start) + variable + currentTemplate.slice(end);
      setEditedTemplates({ ...editedTemplates, [activeTab]: newTemplate });

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const getPreviewHtml = () => {
    const template = editedTemplates[activeTab] || '';
    const maroon = (text: string) => `<span style="color: #541409; font-weight: 500;">${text}</span>`;

    const lineItemsTable = `<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
      <tr style="background: #EAD6D6;"><th style="padding: 8px; text-align: left;">Item</th><th style="padding: 8px;">Qty</th><th style="padding: 8px; text-align: right;">Price</th></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #EAD6D6;">8" Round Chocolate Cake</td><td style="padding: 8px; text-align: center;">1</td><td style="padding: 8px; text-align: right;">$120.00</td></tr>
    </table>`;

    const preview = template
      .replace(/\{\{customer_name\}\}/g, maroon('Jane Smith'))
      .replace(/\{\{customer_email\}\}/g, maroon('jane@example.com'))
      .replace(/\{\{customer_phone\}\}/g, maroon('(555) 123-4567'))
      .replace(/\{\{order_number\}\}/g, maroon('CK-ABC123'))
      .replace(/\{\{order_type\}\}/g, maroon('Custom Cake'))
      .replace(/\{\{pickup_date\}\}/g, maroon('Saturday, February 15, 2026'))
      .replace(/\{\{pickup_time\}\}/g, maroon('10:00 AM'))
      .replace(/\{\{total_amount\}\}/g, maroon('$150.00'))
      .replace(/\{\{order_details\}\}/g, maroon('8" Round Chocolate Cake'))
      .replace(/\{\{quote_number\}\}/g, maroon('Q-2025-001'))
      .replace(/\{\{subtotal\}\}/g, maroon('$150.00'))
      .replace(/\{\{deposit_amount\}\}/g, maroon('$75.00'))
      .replace(/\{\{deposit_percentage\}\}/g, maroon('50'))
      .replace(/\{\{valid_until\}\}/g, maroon('Friday, February 14, 2026'))
      .replace(/\{\{customer_message\}\}/g, maroon('Looking forward to creating something special!'))
      .replace(/\{\{line_items_table\}\}/g, lineItemsTable)
      .replace(/\{\{balance_due\}\}/g, maroon('$75.00'))
      .replace(/\{\{message\}\}/g, maroon('Hi, I have a question about ordering...'))
      .replace(/\{\{event_type\}\}/g, maroon('Birthday'))
      .replace(/\{\{cake_size\}\}/g, maroon('8-inch'))
      .replace(/\{\{cake_shape\}\}/g, maroon('Round'))
      .replace(/\{\{cake_flavor\}\}/g, maroon('Chocolate'))
      .replace(/\{\{filling\}\}/g, maroon('Raspberry'))
      .replace(/\{\{base_color\}\}/g, maroon('White'))
      .replace(/\{\{piping_colors\}\}/g, maroon('Gold'))
      .replace(/\{\{custom_messaging\}\}/g, maroon('Happy Birthday!'))
      .replace(/\{\{toppings\}\}/g, maroon('Fresh flowers'))
      .replace(/\{\{allergies\}\}/g, maroon('None'))
      .replace(/\{\{notes\}\}/g, maroon('Please make it extra special!'))
      .replace(/\{\{admin_link\}\}/g, '<a href="#">View in Admin Dashboard</a>')
      .replace(/\{\{quantity\}\}/g, maroon('6'))
      .replace(/\{\{cookie_count\}\}/g, maroon('72'))
      .replace(/\{\{flavors\}\}/g, maroon('Chocolate Chip: 3, Sugar: 3'))
      .replace(/\{\{packaging\}\}/g, maroon('Heat Sealed'))
      .replace(/\{\{event_date\}\}/g, maroon('February 20, 2026'))
      .replace(/\{\{pickup_delivery\}\}/g, maroon('Pickup'))
      .replace(/\{\{partner_name\}\}/g, maroon('John Smith'))
      .replace(/\{\{wedding_date\}\}/g, maroon('June 15, 2026'))
      .replace(/\{\{venue\}\}/g, maroon('The Grand Ballroom'))
      .replace(/\{\{start_time\}\}/g, maroon('4:00 PM'))
      .replace(/\{\{guest_count\}\}/g, maroon('150'))
      .replace(/\{\{services\}\}/g, maroon('Cake + Cookies'))
      .replace(/\{\{cake_details\}\}/g, maroon('3-tier white cake'))
      .replace(/\{\{cookie_details\}\}/g, maroon('10 dozen assorted'))
      .replace(/\{\{dietary_restrictions\}\}/g, maroon('None'))
      .replace(/\{\{image_count\}\}/g, maroon('3'))
      .replace(/\{\{design_notes\}\}/g, maroon('Elegant, classic style'))
      .replace(/\{\{amount\}\}/g, maroon('$70.00'))
      .replace(/\{\{tasting_type\}\}/g, maroon('Cake Tasting'))
      .replace(/\{\{delivery_date\}\}/g, maroon('Saturday, February 15, 2026'))
      .replace(/\{\{delivery_time\}\}/g, maroon('2:00 PM'))
      .replace(/\{\{delivery_address\}\}/g, maroon('123 Wedding Venue Lane, City, ST 12345'))
      .replace(/\{\{contract_number\}\}/g, maroon('WC-ABC123'))
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    return preview;
  };

  const currentTemplateInfo = activeSection === 'customer'
    ? CUSTOMER_TEMPLATE_INFO[activeTab as CustomerTemplateKey]
    : ADMIN_TEMPLATE_INFO[activeTab as AdminTemplateKey];

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Section Toggle */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => { setActiveSection('customer'); setActiveTab('form_submission'); }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeSection === 'customer'
              ? 'bg-[#541409] text-[#EAD6D6]'
              : 'bg-[#EAD6D6]/30 text-[#541409] hover:bg-[#EAD6D6]/50'
          }`}
        >
          Customer Emails
        </button>
        <button
          onClick={() => { setActiveSection('admin'); setActiveTab('contact_form'); }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeSection === 'admin'
              ? 'bg-[#541409] text-[#EAD6D6]'
              : 'bg-[#EAD6D6]/30 text-[#541409] hover:bg-[#EAD6D6]/50'
          }`}
        >
          Admin Notifications
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-[#EAD6D6] pb-2">
        {activeSection === 'customer' ? (
          Object.entries(CUSTOMER_TEMPLATE_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as TemplateKey)}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                activeTab === key
                  ? 'bg-[#541409] text-[#EAD6D6]'
                  : 'text-[#541409]/60 hover:text-[#541409] hover:bg-[#EAD6D6]/30'
              }`}
            >
              {info.label}
            </button>
          ))
        ) : (
          Object.entries(ADMIN_TEMPLATE_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as TemplateKey)}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                activeTab === key
                  ? 'bg-[#541409] text-[#EAD6D6]'
                  : 'text-[#541409]/60 hover:text-[#541409] hover:bg-[#EAD6D6]/30'
              }`}
            >
              {info.label}
            </button>
          ))
        )}
      </div>

      {/* Active Template Editor */}
      <div className="space-y-4">
        <div>
          <p className="text-sm text-[#541409]/70 mb-4">
            {currentTemplateInfo?.description}
            {activeSection === 'admin' && (
              <span className="ml-2 text-xs bg-[#EAD6D6]/50 px-2 py-0.5 rounded">Sent to you</span>
            )}
          </p>
        </div>

        {/* Subject Line */}
        <div>
          <label className="block text-sm font-medium text-[#541409] mb-2">
            Subject Line
          </label>
          <input
            type="text"
            value={editedSubjects[activeTab] || ''}
            onChange={(e) => setEditedSubjects({ ...editedSubjects, [activeTab]: e.target.value })}
            className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
            placeholder="Email subject line..."
          />
        </div>

        {/* Available Variables */}
        <div className="bg-[#EAD6D6]/20 rounded-lg p-4">
          <p className="text-sm font-medium text-[#541409] mb-2">Available Variables (click to insert)</p>
          <div className="flex flex-wrap gap-2">
            {getVariablesForTemplate(activeTab).map((v) => (
              <button
                key={v.key}
                onClick={() => insertVariable(v.key)}
                className="px-2 py-1 bg-white border border-[#EAD6D6] rounded text-xs text-[#541409] hover:bg-[#EAD6D6] transition-colors"
                title={v.description}
              >
                {v.key}
              </button>
            ))}
          </div>
        </div>

        {/* Template Body */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-[#541409]">
              Email Body
            </label>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-[#541409]/70 hover:text-[#541409]"
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>

          {showPreview ? (
            <div className="border border-[#EAD6D6] rounded-lg p-4 bg-white min-h-[300px]">
              <div className="prose prose-sm max-w-none" style={{ color: 'rgba(84, 20, 9, 0.5)' }}>
                <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(getPreviewHtml()) }} />
              </div>
            </div>
          ) : (
            <textarea
              id="template-editor"
              value={editedTemplates[activeTab] || ''}
              onChange={(e) => setEditedTemplates({ ...editedTemplates, [activeTab]: e.target.value })}
              rows={12}
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409] font-mono text-sm"
              placeholder="Enter email template..."
            />
          )}
          <p className="text-xs text-[#541409]/60 mt-2">
            Use **text** for bold. Variables like {'{{customer_name}}'} will be replaced with actual values.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-[#EAD6D6]">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-[#541409] text-[#EAD6D6] font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSaving ? 'Saving...' : 'Save Templates'}
        </button>
      </div>
    </div>
  );
}
