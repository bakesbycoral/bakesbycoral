'use client';

import { useState } from 'react';

interface EmailTemplateEditorProps {
  templates: {
    form_submission: string;
    confirmation: string;
    reminder: string;
  };
  subjects: {
    form_submission: string;
    confirmation: string;
    reminder: string;
  };
  onSave: (templates: Record<string, string>) => Promise<void>;
}

const TEMPLATE_INFO = {
  form_submission: {
    label: 'Form Submission Email',
    description: 'Sent when a customer submits an order (before payment)',
  },
  confirmation: {
    label: 'Order Confirmation Email',
    description: 'Sent when payment is completed',
  },
  reminder: {
    label: 'Pickup Reminder Email',
    description: 'Sent the day before scheduled pickup',
  },
};

const AVAILABLE_VARIABLES = [
  { key: '{{customer_name}}', description: 'Customer\'s name' },
  { key: '{{order_number}}', description: 'Order number (e.g., CK-ABC123)' },
  { key: '{{order_type}}', description: 'Type of order (Cookie Order, Custom Cake, etc.)' },
  { key: '{{pickup_date}}', description: 'Formatted pickup date' },
  { key: '{{pickup_time}}', description: 'Formatted pickup time' },
  { key: '{{order_details}}', description: 'Order details (flavors, quantity, etc.)' },
  { key: '{{total_amount}}', description: 'Total order amount' },
];

export function EmailTemplateEditor({ templates, subjects, onSave }: EmailTemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<'form_submission' | 'confirmation' | 'reminder'>('form_submission');
  const [editedTemplates, setEditedTemplates] = useState(templates);
  const [editedSubjects, setEditedSubjects] = useState(subjects);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      await onSave({
        email_template_form_submission: editedTemplates.form_submission,
        email_template_confirmation: editedTemplates.confirmation,
        email_template_reminder: editedTemplates.reminder,
        email_subject_form_submission: editedSubjects.form_submission,
        email_subject_confirmation: editedSubjects.confirmation,
        email_subject_reminder: editedSubjects.reminder,
      });
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
      const currentTemplate = editedTemplates[activeTab];
      const newTemplate = currentTemplate.slice(0, start) + variable + currentTemplate.slice(end);
      setEditedTemplates({ ...editedTemplates, [activeTab]: newTemplate });

      // Restore cursor position after variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const getPreviewHtml = () => {
    const template = editedTemplates[activeTab];
    const maroon = (text: string) => `<span style="color: #541409; font-weight: 500;">${text}</span>`;
    const preview = template
      .replace(/\{\{customer_name\}\}/g, maroon('Jane Smith'))
      .replace(/\{\{order_number\}\}/g, maroon('CK-ABC123'))
      .replace(/\{\{order_type\}\}/g, maroon('Cookie Order'))
      .replace(/\{\{pickup_date\}\}/g, maroon('Saturday, February 15, 2026'))
      .replace(/\{\{pickup_time\}\}/g, maroon('10:00 AM'))
      .replace(/\{\{total_amount\}\}/g, maroon('$90.00'))
      .replace(/\{\{order_details\}\}/g, maroon('**Cookies:**\n• Chocolate Chip: 12 cookies\n• Vanilla Bean Sugar: 12 cookies\n**Quantity:** 2 dozen'))
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    return preview;
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#EAD6D6]">
        {(Object.keys(TEMPLATE_INFO) as Array<keyof typeof TEMPLATE_INFO>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'text-[#541409] border-b-2 border-[#541409]'
                : 'text-[#541409]/60 hover:text-[#541409]'
            }`}
          >
            {TEMPLATE_INFO[key].label}
          </button>
        ))}
      </div>

      {/* Active Template Editor */}
      <div className="space-y-4">
        <div>
          <p className="text-sm text-[#541409]/70 mb-4">
            {TEMPLATE_INFO[activeTab].description}
          </p>
        </div>

        {/* Subject Line */}
        <div>
          <label className="block text-sm font-medium text-[#541409] mb-2">
            Subject Line
          </label>
          <input
            type="text"
            value={editedSubjects[activeTab]}
            onChange={(e) => setEditedSubjects({ ...editedSubjects, [activeTab]: e.target.value })}
            className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
            placeholder="Email subject line..."
          />
        </div>

        {/* Available Variables */}
        <div className="bg-[#EAD6D6]/20 rounded-lg p-4">
          <p className="text-sm font-medium text-[#541409] mb-2">Available Variables (click to insert)</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_VARIABLES.map((v) => (
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
                <p dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
              </div>
            </div>
          ) : (
            <textarea
              id="template-editor"
              value={editedTemplates[activeTab]}
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
