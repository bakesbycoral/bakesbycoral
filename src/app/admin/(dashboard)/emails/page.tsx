'use client';

import { useEffect, useState } from 'react';
import { EmailTemplateEditor } from '@/components/admin/EmailTemplateEditor';

const DEFAULT_TEMPLATES = {
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
};

const DEFAULT_SUBJECTS = {
  form_submission: 'Order Request Received - {{order_number}}',
  confirmation: 'Order Confirmed - {{order_number}}',
  reminder: 'Pickup Reminder - {{order_number}}',
};

export default function EmailsPage() {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json() as { settings?: Record<string, string> };
          const settings = data.settings || {};

          setTemplates({
            form_submission: settings.email_template_form_submission || DEFAULT_TEMPLATES.form_submission,
            confirmation: settings.email_template_confirmation || DEFAULT_TEMPLATES.confirmation,
            reminder: settings.email_template_reminder || DEFAULT_TEMPLATES.reminder,
          });

          setSubjects({
            form_submission: settings.email_subject_form_submission || DEFAULT_SUBJECTS.form_submission,
            confirmation: settings.email_subject_confirmation || DEFAULT_SUBJECTS.confirmation,
            reminder: settings.email_subject_reminder || DEFAULT_SUBJECTS.reminder,
          });
        }
      } catch (error) {
        console.error('Failed to load email templates:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, []);

  const handleSave = async (newSettings: Record<string, string>) => {
    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: newSettings }),
    });

    if (!response.ok) {
      throw new Error('Failed to save templates');
    }

    // Update local state
    setTemplates({
      form_submission: newSettings.email_template_form_submission || templates.form_submission,
      confirmation: newSettings.email_template_confirmation || templates.confirmation,
      reminder: newSettings.email_template_reminder || templates.reminder,
    });

    setSubjects({
      form_submission: newSettings.email_subject_form_submission || subjects.form_submission,
      confirmation: newSettings.email_subject_confirmation || subjects.confirmation,
      reminder: newSettings.email_subject_reminder || subjects.reminder,
    });
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#541409] mb-8">Email Templates</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#EAD6D6]">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-[#EAD6D6]/50 rounded w-1/3"></div>
            <div className="h-40 bg-[#EAD6D6]/50 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#541409] mb-2">Email Templates</h1>
      <p className="text-[#541409]/70 mb-8">
        Customize the emails sent to customers for order submissions, confirmations, and pickup reminders.
      </p>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#EAD6D6]">
        <EmailTemplateEditor
          templates={templates}
          subjects={subjects}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
