'use client';

import { useState } from 'react';
import { DEFAULT_SMS_TEMPLATES } from '@/lib/sms';

type SmsTemplateKey = 'quote_sent' | 'order_confirmed' | 'balance_invoice' | 'pickup_reminder' | 'order_confirmed_delivery' | 'balance_invoice_delivery' | 'delivery_reminder';

interface SmsTemplateEditorProps {
  templates: Record<string, string>;
  onSave: (templates: Record<string, string>) => Promise<void>;
}

const SMS_TEMPLATE_INFO: Record<SmsTemplateKey, { label: string; description: string }> = {
  quote_sent: {
    label: 'Quote Sent',
    description: 'Sent when you send a quote to a customer',
  },
  order_confirmed: {
    label: 'Order Confirmed (Pickup)',
    description: 'Sent when payment is completed for pickup orders',
  },
  balance_invoice: {
    label: 'Balance Due (Pickup)',
    description: 'Sent when you request the remaining balance for pickup orders',
  },
  pickup_reminder: {
    label: 'Pickup Reminder',
    description: 'Sent the day before scheduled pickup',
  },
  order_confirmed_delivery: {
    label: 'Order Confirmed (Delivery)',
    description: 'Sent when payment is completed for delivery orders',
  },
  balance_invoice_delivery: {
    label: 'Balance Due (Delivery)',
    description: 'Sent when you request the remaining balance for delivery orders',
  },
  delivery_reminder: {
    label: 'Delivery Reminder',
    description: 'Sent the day before scheduled delivery',
  },
};

const SMS_VARIABLES: Record<SmsTemplateKey, { key: string; description: string }[]> = {
  quote_sent: [
    { key: '{{customer_name}}', description: "Customer's name" },
    { key: '{{order_type}}', description: 'Type of order' },
    { key: '{{quote_url}}', description: 'Link to view/approve quote' },
  ],
  order_confirmed: [
    { key: '{{customer_name}}', description: "Customer's name" },
    { key: '{{order_number}}', description: 'Order number' },
    { key: '{{pickup_date}}', description: 'Pickup date' },
    { key: '{{pickup_time}}', description: 'Pickup time' },
  ],
  balance_invoice: [
    { key: '{{customer_name}}', description: "Customer's name" },
    { key: '{{order_number}}', description: 'Order number' },
    { key: '{{balance_due}}', description: 'Amount due' },
    { key: '{{payment_url}}', description: 'Link to pay' },
  ],
  pickup_reminder: [
    { key: '{{customer_name}}', description: "Customer's name" },
    { key: '{{order_number}}', description: 'Order number' },
    { key: '{{pickup_date}}', description: 'Pickup date' },
    { key: '{{pickup_time}}', description: 'Pickup time' },
  ],
  order_confirmed_delivery: [
    { key: '{{customer_name}}', description: "Customer's name" },
    { key: '{{order_number}}', description: 'Order number' },
    { key: '{{delivery_date}}', description: 'Delivery date' },
    { key: '{{delivery_time}}', description: 'Delivery time' },
  ],
  balance_invoice_delivery: [
    { key: '{{customer_name}}', description: "Customer's name" },
    { key: '{{order_number}}', description: 'Order number' },
    { key: '{{balance_due}}', description: 'Amount due' },
    { key: '{{payment_url}}', description: 'Link to pay' },
  ],
  delivery_reminder: [
    { key: '{{customer_name}}', description: "Customer's name" },
    { key: '{{order_number}}', description: 'Order number' },
    { key: '{{delivery_date}}', description: 'Delivery date' },
    { key: '{{delivery_time}}', description: 'Delivery time' },
  ],
};

const ALL_SMS_KEYS: SmsTemplateKey[] = ['quote_sent', 'order_confirmed', 'balance_invoice', 'pickup_reminder', 'order_confirmed_delivery', 'balance_invoice_delivery', 'delivery_reminder'];

export function SmsTemplateEditor({ templates, onSave }: SmsTemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<SmsTemplateKey>('quote_sent');
  const [editedTemplates, setEditedTemplates] = useState<Record<string, string>>(() => {
    // Initialize with defaults if not provided
    const initial: Record<string, string> = {};
    for (const key of ALL_SMS_KEYS) {
      initial[key] = templates[key] || DEFAULT_SMS_TEMPLATES[key] || '';
    }
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const saveData: Record<string, string> = {};
      for (const key of ALL_SMS_KEYS) {
        saveData[`sms_template_${key}`] = editedTemplates[key] || '';
      }
      await onSave(saveData);
      setMessage({ type: 'success', text: 'SMS templates saved!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save templates' });
    } finally {
      setIsSaving(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('sms-template-editor') as HTMLTextAreaElement;
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

  const resetToDefault = () => {
    setEditedTemplates({
      ...editedTemplates,
      [activeTab]: DEFAULT_SMS_TEMPLATES[activeTab] || '',
    });
  };

  const charCount = (editedTemplates[activeTab] || '').length;
  const isOverLimit = charCount > 160;

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>SMS notifications</strong> are sent to customers via Twilio. Keep messages under 160 characters to avoid splitting into multiple texts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-[#EAD6D6] pb-2">
        {Object.entries(SMS_TEMPLATE_INFO).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as SmsTemplateKey)}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              activeTab === key
                ? 'bg-[#541409] text-[#EAD6D6]'
                : 'text-[#541409]/60 hover:text-[#541409] hover:bg-[#EAD6D6]/30'
            }`}
          >
            {info.label}
          </button>
        ))}
      </div>

      {/* Active Template Editor */}
      <div className="space-y-4">
        <div>
          <p className="text-sm text-[#541409]/70 mb-4">
            {SMS_TEMPLATE_INFO[activeTab]?.description}
          </p>
        </div>

        {/* Available Variables */}
        <div className="bg-[#EAD6D6]/20 rounded-lg p-4">
          <p className="text-sm font-medium text-[#541409] mb-2">Available Variables (click to insert)</p>
          <div className="flex flex-wrap gap-2">
            {SMS_VARIABLES[activeTab].map((v) => (
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
              Message
            </label>
            <button
              onClick={resetToDefault}
              className="text-xs text-[#541409]/60 hover:text-[#541409]"
            >
              Reset to default
            </button>
          </div>

          <textarea
            id="sms-template-editor"
            value={editedTemplates[activeTab] || ''}
            onChange={(e) => setEditedTemplates({ ...editedTemplates, [activeTab]: e.target.value })}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409] font-mono text-sm ${
              isOverLimit ? 'border-red-400' : 'border-[#EAD6D6]'
            }`}
            placeholder="Enter SMS template..."
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-[#541409]/60">
              Variables like {'{{customer_name}}'} will be replaced with actual values.
            </p>
            <p className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-[#541409]/60'}`}>
              {charCount}/160 characters
              {isOverLimit && ' (may split into multiple texts)'}
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-2">Preview (with sample data):</p>
          <div className="bg-white rounded-lg p-3 shadow-sm max-w-sm">
            <p className="text-sm text-gray-800">
              {(editedTemplates[activeTab] || '')
                .replace(/\{\{customer_name\}\}/g, 'Jane')
                .replace(/\{\{order_number\}\}/g, 'CK-ABC123')
                .replace(/\{\{order_type\}\}/g, 'Custom Cake')
                .replace(/\{\{pickup_date\}\}/g, 'Sat, Feb 15')
                .replace(/\{\{pickup_time\}\}/g, '10:00 AM')
                .replace(/\{\{delivery_date\}\}/g, 'Sat, Feb 15')
                .replace(/\{\{delivery_time\}\}/g, '2:00 PM')
                .replace(/\{\{balance_due\}\}/g, '$75.00')
                .replace(/\{\{quote_url\}\}/g, 'bakesbycoral.com/q/abc')
                .replace(/\{\{payment_url\}\}/g, 'pay.stripe.com/...')
              }
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-[#EAD6D6]">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-[#541409] text-[#EAD6D6] font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSaving ? 'Saving...' : 'Save SMS Templates'}
        </button>
      </div>
    </div>
  );
}
