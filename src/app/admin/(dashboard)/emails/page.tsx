'use client';

import { useEffect, useState, useCallback } from 'react';
import { EmailTemplateEditor } from '@/components/admin/EmailTemplateEditor';
import { SmsTemplateEditor } from '@/components/admin/SmsTemplateEditor';
import { DEFAULT_TEMPLATES, DEFAULT_SUBJECTS } from '@/lib/email';
import { DEFAULT_ADMIN_TEMPLATES, DEFAULT_ADMIN_SUBJECTS } from '@/lib/email';
import { DEFAULT_SMS_TEMPLATES } from '@/lib/sms';
import { formatDateTime } from '@/lib/dates';

interface EmailLogEntry {
  id: number;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed';
  error: string | null;
  created_at: string;
}

const ALL_TEMPLATE_KEYS = [
  'form_submission', 'confirmation', 'confirmation_delivery', 'reminder', 'reminder_delivery', 'quote', 'quote_approved', 'balance_invoice', 'balance_invoice_delivery',
  'contact_form', 'cake_inquiry', 'large_cookie_order', 'wedding_inquiry', 'tasting_order', 'cookie_cups_order', 'limited_collection_order',
];

const ALL_SMS_KEYS = ['quote_sent', 'order_confirmed', 'balance_invoice', 'pickup_reminder', 'order_confirmed_delivery', 'balance_invoice_delivery', 'delivery_reminder'];

export default function EmailsPage() {
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [smsTemplates, setSmsTemplates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'email' | 'sms' | 'log'>('email');
  const [emailLogs, setEmailLogs] = useState<EmailLogEntry[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const [logLoading, setLogLoading] = useState(false);
  const [logFilter, setLogFilter] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState('');

  const loadEmailLogs = useCallback(async (page: number, search: string, status: string) => {
    setLogLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/email-log?${params}`);
      if (res.ok) {
        const data = await res.json() as { logs: EmailLogEntry[]; total: number; page: number; totalPages: number };
        setEmailLogs(data.logs);
        setLogTotalPages(data.totalPages);
        setLogTotal(data.total);
      }
    } catch (e) {
      console.error('Failed to load email logs:', e);
    } finally {
      setLogLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json() as { settings?: Record<string, string> };
          const settings = data.settings || {};

          // Build templates object with defaults
          const loadedTemplates: Record<string, string> = {};
          const loadedSubjects: Record<string, string> = {};

          // Customer templates
          loadedTemplates.form_submission = settings.email_template_form_submission || DEFAULT_TEMPLATES.form_submission;
          loadedTemplates.confirmation = settings.email_template_confirmation || DEFAULT_TEMPLATES.confirmation;
          loadedTemplates.confirmation_delivery = settings.email_template_confirmation_delivery || DEFAULT_TEMPLATES.confirmation_delivery;
          loadedTemplates.reminder = settings.email_template_reminder || DEFAULT_TEMPLATES.reminder;
          loadedTemplates.reminder_delivery = settings.email_template_reminder_delivery || DEFAULT_TEMPLATES.reminder_delivery;
          loadedTemplates.quote = settings.email_template_quote || DEFAULT_TEMPLATES.quote;
          loadedTemplates.quote_approved = settings.email_template_quote_approved || DEFAULT_TEMPLATES.quote_approved;
          loadedTemplates.balance_invoice = settings.email_template_balance_invoice || DEFAULT_TEMPLATES.balance_invoice;
          loadedTemplates.balance_invoice_delivery = settings.email_template_balance_invoice_delivery || DEFAULT_TEMPLATES.balance_invoice_delivery;

          loadedSubjects.form_submission = settings.email_subject_form_submission || DEFAULT_SUBJECTS.form_submission;
          loadedSubjects.confirmation = settings.email_subject_confirmation || DEFAULT_SUBJECTS.confirmation;
          loadedSubjects.confirmation_delivery = settings.email_subject_confirmation_delivery || DEFAULT_SUBJECTS.confirmation_delivery;
          loadedSubjects.reminder = settings.email_subject_reminder || DEFAULT_SUBJECTS.reminder;
          loadedSubjects.reminder_delivery = settings.email_subject_reminder_delivery || DEFAULT_SUBJECTS.reminder_delivery;
          loadedSubjects.quote = settings.email_subject_quote || DEFAULT_SUBJECTS.quote;
          loadedSubjects.quote_approved = settings.email_subject_quote_approved || DEFAULT_SUBJECTS.quote_approved;
          loadedSubjects.balance_invoice = settings.email_subject_balance_invoice || DEFAULT_SUBJECTS.balance_invoice;
          loadedSubjects.balance_invoice_delivery = settings.email_subject_balance_invoice_delivery || DEFAULT_SUBJECTS.balance_invoice_delivery;

          // Admin notification templates
          loadedTemplates.contact_form = settings.email_template_contact_form || DEFAULT_ADMIN_TEMPLATES.contact_form;
          loadedTemplates.cake_inquiry = settings.email_template_cake_inquiry || DEFAULT_ADMIN_TEMPLATES.cake_inquiry;
          loadedTemplates.large_cookie_order = settings.email_template_large_cookie_order || DEFAULT_ADMIN_TEMPLATES.large_cookie_order;
          loadedTemplates.wedding_inquiry = settings.email_template_wedding_inquiry || DEFAULT_ADMIN_TEMPLATES.wedding_inquiry;
          loadedTemplates.tasting_order = settings.email_template_tasting_order || DEFAULT_ADMIN_TEMPLATES.tasting_order;

          loadedSubjects.contact_form = settings.email_subject_contact_form || DEFAULT_ADMIN_SUBJECTS.contact_form;
          loadedSubjects.cake_inquiry = settings.email_subject_cake_inquiry || DEFAULT_ADMIN_SUBJECTS.cake_inquiry;
          loadedSubjects.large_cookie_order = settings.email_subject_large_cookie_order || DEFAULT_ADMIN_SUBJECTS.large_cookie_order;
          loadedSubjects.wedding_inquiry = settings.email_subject_wedding_inquiry || DEFAULT_ADMIN_SUBJECTS.wedding_inquiry;
          loadedSubjects.tasting_order = settings.email_subject_tasting_order || DEFAULT_ADMIN_SUBJECTS.tasting_order;

          loadedTemplates.cookie_cups_order = settings.email_template_cookie_cups_order || DEFAULT_ADMIN_TEMPLATES.cookie_cups_order;
          loadedSubjects.cookie_cups_order = settings.email_subject_cookie_cups_order || DEFAULT_ADMIN_SUBJECTS.cookie_cups_order;
          loadedTemplates.limited_collection_order = settings.email_template_limited_collection_order || DEFAULT_ADMIN_TEMPLATES.limited_collection_order;
          loadedSubjects.limited_collection_order = settings.email_subject_limited_collection_order || DEFAULT_ADMIN_SUBJECTS.limited_collection_order;

          // SMS templates
          const loadedSmsTemplates: Record<string, string> = {};
          loadedSmsTemplates.quote_sent = settings.sms_template_quote_sent || DEFAULT_SMS_TEMPLATES.quote_sent;
          loadedSmsTemplates.order_confirmed = settings.sms_template_order_confirmed || DEFAULT_SMS_TEMPLATES.order_confirmed;
          loadedSmsTemplates.balance_invoice = settings.sms_template_balance_invoice || DEFAULT_SMS_TEMPLATES.balance_invoice;
          loadedSmsTemplates.pickup_reminder = settings.sms_template_pickup_reminder || DEFAULT_SMS_TEMPLATES.pickup_reminder;
          loadedSmsTemplates.order_confirmed_delivery = settings.sms_template_order_confirmed_delivery || DEFAULT_SMS_TEMPLATES.order_confirmed_delivery;
          loadedSmsTemplates.balance_invoice_delivery = settings.sms_template_balance_invoice_delivery || DEFAULT_SMS_TEMPLATES.balance_invoice_delivery;
          loadedSmsTemplates.delivery_reminder = settings.sms_template_delivery_reminder || DEFAULT_SMS_TEMPLATES.delivery_reminder;

          setTemplates(loadedTemplates);
          setSubjects(loadedSubjects);
          setSmsTemplates(loadedSmsTemplates);
        }
      } catch (error) {
        console.error('Failed to load email templates:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, []);

  useEffect(() => {
    if (activeSection === 'log') {
      loadEmailLogs(logPage, logFilter, logStatusFilter);
    }
  }, [activeSection, logPage, logFilter, logStatusFilter, loadEmailLogs]);

  const handleSave = async (newSettings: Record<string, string>) => {
    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: newSettings }),
    });

    if (!response.ok) {
      throw new Error('Failed to save templates');
    }

    // Update local state from the new settings
    const updatedTemplates: Record<string, string> = { ...templates };
    const updatedSubjects: Record<string, string> = { ...subjects };

    for (const key of ALL_TEMPLATE_KEYS) {
      if (newSettings[`email_template_${key}`] !== undefined) {
        updatedTemplates[key] = newSettings[`email_template_${key}`];
      }
      if (newSettings[`email_subject_${key}`] !== undefined) {
        updatedSubjects[key] = newSettings[`email_subject_${key}`];
      }
    }

    setTemplates(updatedTemplates);
    setSubjects(updatedSubjects);
  };

  const handleSaveSms = async (newSettings: Record<string, string>) => {
    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: newSettings }),
    });

    if (!response.ok) {
      throw new Error('Failed to save SMS templates');
    }

    // Update local state from the new settings
    const updatedSmsTemplates: Record<string, string> = { ...smsTemplates };

    for (const key of ALL_SMS_KEYS) {
      if (newSettings[`sms_template_${key}`] !== undefined) {
        updatedSmsTemplates[key] = newSettings[`sms_template_${key}`];
      }
    }

    setSmsTemplates(updatedSmsTemplates);
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#541409] mb-6 md:mb-8">Email Templates</h1>
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
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl md:text-2xl font-bold text-[#541409]">Messages</h1>
        <a
          href="/admin/emails/preview"
          className="text-sm text-[#541409]/70 hover:text-[#541409] transition-colors"
        >
          Preview Templates →
        </a>
      </div>
      <p className="text-[#541409]/70 mb-6">
        Customize email and SMS messages sent to customers.
      </p>

      {/* Section Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSection('email')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeSection === 'email'
              ? 'bg-[#541409] text-[#EAD6D6]'
              : 'bg-white text-[#541409] border border-[#EAD6D6] hover:border-[#541409]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email Templates
        </button>
        <button
          onClick={() => setActiveSection('sms')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeSection === 'sms'
              ? 'bg-[#541409] text-[#EAD6D6]'
              : 'bg-white text-[#541409] border border-[#EAD6D6] hover:border-[#541409]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          SMS Templates
        </button>
        <button
          onClick={() => setActiveSection('log')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeSection === 'log'
              ? 'bg-[#541409] text-[#EAD6D6]'
              : 'bg-white text-[#541409] border border-[#EAD6D6] hover:border-[#541409]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Sent Log
        </button>
      </div>

      {activeSection === 'log' ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#EAD6D6]">
          {/* Filters */}
          <div className="p-4 border-b border-[#EAD6D6] flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by recipient or subject..."
              value={logFilter}
              onChange={(e) => { setLogFilter(e.target.value); setLogPage(1); }}
              className="flex-1 px-3 py-2 border border-[#EAD6D6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#541409]/20"
            />
            <select
              value={logStatusFilter}
              onChange={(e) => { setLogStatusFilter(e.target.value); setLogPage(1); }}
              className="px-3 py-2 border border-[#EAD6D6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#541409]/20"
            >
              <option value="">All Status</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
            <span className="text-sm text-[#541409]/60 self-center whitespace-nowrap">
              {logTotal} email{logTotal !== 1 ? 's' : ''}
            </span>
          </div>

          {logLoading ? (
            <div className="p-8 text-center text-[#541409]/50">Loading...</div>
          ) : emailLogs.length === 0 ? (
            <div className="p-8 text-center text-[#541409]/50">
              No emails logged yet. Emails will appear here once they are sent.
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-[#EAD6D6]">
                {emailLogs.map((log) => (
                  <div key={log.id} className="p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#541409] truncate mr-2">{log.recipient}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#541409]/70 truncate">{log.subject}</p>
                    <p className="text-xs text-[#541409]/50">
                      {formatDateTime(log.created_at, 'utc')}
                    </p>
                    {log.error && <p className="text-xs text-red-600 truncate">{log.error}</p>}
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#EAD6D6] text-left text-[#541409]/60">
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Recipient</th>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAD6D6]/50">
                    {emailLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#EAD6D6]/10">
                        <td className="px-4 py-3 text-[#541409]/70 whitespace-nowrap">
                          {formatDateTime(log.created_at, 'utc')}
                        </td>
                        <td className="px-4 py-3 text-[#541409] font-medium">{log.recipient}</td>
                        <td className="px-4 py-3 text-[#541409]/70 max-w-xs truncate">{log.subject}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {log.status}
                          </span>
                          {log.error && (
                            <p className="text-xs text-red-500 mt-1 max-w-xs truncate" title={log.error}>{log.error}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {logTotalPages > 1 && (
                <div className="p-4 border-t border-[#EAD6D6] flex items-center justify-between">
                  <button
                    onClick={() => setLogPage(p => Math.max(1, p - 1))}
                    disabled={logPage <= 1}
                    className="px-3 py-1.5 text-sm border border-[#EAD6D6] rounded-lg disabled:opacity-40 hover:border-[#541409] transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-[#541409]/60">
                    Page {logPage} of {logTotalPages}
                  </span>
                  <button
                    onClick={() => setLogPage(p => Math.min(logTotalPages, p + 1))}
                    disabled={logPage >= logTotalPages}
                    className="px-3 py-1.5 text-sm border border-[#EAD6D6] rounded-lg disabled:opacity-40 hover:border-[#541409] transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#EAD6D6]">
          {activeSection === 'email' ? (
            <EmailTemplateEditor
              templates={templates}
              subjects={subjects}
              onSave={handleSave}
            />
          ) : (
            <SmsTemplateEditor
              templates={smsTemplates}
              onSave={handleSaveSms}
            />
          )}
        </div>
      )}
    </div>
  );
}
