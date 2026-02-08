'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TipTapEditor } from '@/components/admin/TipTapEditor';

interface SubscriberCount {
  total: number;
  active: number;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'sender' | 'schedule'>('content');
  const [subscriberCount, setSubscriberCount] = useState<SubscriberCount>({ total: 0, active: 0 });
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    preview_text: '',
    from_name: '',
    from_email: '',
    reply_to: '',
    content: '',
    status: 'draft',
    scheduled_at: '',
  });

  useEffect(() => {
    async function fetchSubscriberCount() {
      try {
        const response = await fetch('/api/admin/newsletter/subscribers/count');
        if (response.ok) {
          const data = await response.json();
          setSubscriberCount(data);
        }
      } catch (error) {
        console.error('Failed to fetch subscriber count:', error);
      }
    }
    fetchSubscriberCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent, submitStatus: string) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSubmit = {
        ...formData,
        status: submitStatus,
      };

      const response = await fetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        const data = await response.json();
        if (submitStatus === 'draft') {
          router.push(`/admin/newsletter/campaigns/${data.id}`);
        } else if (submitStatus === 'sending') {
          // Trigger the actual send
          await fetch(`/api/admin/newsletter/campaigns/${data.id}/send`, {
            method: 'POST',
          });
          router.push('/admin/newsletter');
        } else {
          router.push('/admin/newsletter');
        }
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    } finally {
      setSaving(false);
    }
  };

  const canSend = formData.name && formData.subject && formData.content && subscriberCount.active > 0;
  const canSchedule = canSend && formData.scheduled_at;

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/newsletter"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Campaign</h1>
            <p className="text-sm text-gray-500 mt-1">
              {subscriberCount.active} active subscriber{subscriberCount.active !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={!formData.content}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={saving || !formData.name || !formData.subject}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, formData.status === 'scheduled' ? 'scheduled' : 'sending')}
            disabled={saving || !canSend}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : formData.status === 'scheduled' ? 'Schedule' : 'Send Now'}
          </button>
        </div>
      </div>

      {/* Warning if no subscribers */}
      {subscriberCount.active === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-yellow-800">No active subscribers</p>
            <p className="text-sm text-yellow-700">You need at least one active subscriber to send a campaign.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'content'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('sender')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sender'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sender Info
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedule'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Schedule
          </button>
        </nav>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6 max-w-4xl">
            {/* Campaign Name */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name *
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Internal name to identify this campaign (not shown to recipients)
              </p>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., February Newsletter, Product Launch"
              />
            </div>

            {/* Subject Line */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Email Subject *
              </label>
              <p className="text-xs text-gray-500 mb-2">
                The subject line recipients will see in their inbox
              </p>
              <input
                type="text"
                id="subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Your monthly update is here!"
              />
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${formData.subject.length > 50 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {formData.subject.length > 50 ? 'Subject may be truncated on mobile' : 'Keep it short and engaging'}
                </span>
                <span className="text-xs text-gray-400">{formData.subject.length}/60 recommended</span>
              </div>
            </div>

            {/* Preview Text */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label htmlFor="preview_text" className="block text-sm font-medium text-gray-700 mb-1">
                Preview Text
              </label>
              <p className="text-xs text-gray-500 mb-2">
                The text shown after the subject line in most email clients
              </p>
              <input
                type="text"
                id="preview_text"
                value={formData.preview_text}
                onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Check out what's new this month..."
                maxLength={150}
              />
              <div className="text-xs text-gray-400 mt-1 text-right">{formData.preview_text.length}/150</div>
            </div>

            {/* Email Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Inbox Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-medium">
                      {(formData.from_name || 'Your Company').charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 truncate">
                        {formData.from_name || 'Your Company'}
                      </span>
                      <span className="text-xs text-gray-500">now</span>
                    </div>
                    <div className="font-medium text-gray-900 truncate">
                      {formData.subject || 'Email subject line'}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {formData.preview_text || 'Preview text will appear here...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Content *
              </label>
              <TipTapEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
              />
            </div>
          </div>
        )}

        {/* Sender Tab */}
        {activeTab === 'sender' && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sender Information</h3>
              <p className="text-sm text-gray-500 mb-6">
                Configure who the email appears to be from. Leave blank to use your default settings.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="from_name" className="block text-sm font-medium text-gray-700 mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    id="from_name"
                    value={formData.from_name}
                    onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., John from LeanGo"
                  />
                </div>

                <div>
                  <label htmlFor="from_email" className="block text-sm font-medium text-gray-700 mb-1">
                    From Email
                  </label>
                  <input
                    type="email"
                    id="from_email"
                    value={formData.from_email}
                    onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., newsletter@leango.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be a verified email address in your sending domain
                  </p>
                </div>

                <div>
                  <label htmlFor="reply_to" className="block text-sm font-medium text-gray-700 mb-1">
                    Reply-To Email
                  </label>
                  <input
                    type="email"
                    id="reply_to"
                    value={formData.reply_to}
                    onChange={(e) => setFormData({ ...formData, reply_to: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., support@leango.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Where replies will be sent (leave blank to use From Email)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">When to Send</h3>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="send_option"
                    checked={formData.status === 'draft'}
                    onChange={() => setFormData({ ...formData, status: 'draft', scheduled_at: '' })}
                    className="w-4 h-4 text-blue-600 mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Save as Draft</div>
                    <div className="text-sm text-gray-500">Save and send later</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="send_option"
                    checked={formData.status === 'sending'}
                    onChange={() => setFormData({ ...formData, status: 'sending', scheduled_at: '' })}
                    className="w-4 h-4 text-blue-600 mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Send Immediately</div>
                    <div className="text-sm text-gray-500">
                      Send to {subscriberCount.active} active subscriber{subscriberCount.active !== 1 ? 's' : ''} right away
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="send_option"
                    checked={formData.status === 'scheduled'}
                    onChange={() => setFormData({ ...formData, status: 'scheduled' })}
                    className="w-4 h-4 text-blue-600 mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Schedule for Later</div>
                    <div className="text-sm text-gray-500 mb-3">Choose a specific date and time to send</div>
                    {formData.status === 'scheduled' && (
                      <input
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Send Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Campaign Summary</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  {formData.name ? (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  )}
                  Campaign name: {formData.name || 'Not set'}
                </li>
                <li className="flex items-center gap-2">
                  {formData.subject ? (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  )}
                  Subject line: {formData.subject || 'Not set'}
                </li>
                <li className="flex items-center gap-2">
                  {formData.content ? (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  )}
                  Content: {formData.content ? 'Ready' : 'Not set'}
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Recipients: {subscriberCount.active} active subscriber{subscriberCount.active !== 1 ? 's' : ''}
                </li>
              </ul>
            </div>
          </div>
        )}
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Email Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="text-sm text-gray-500">From: {formData.from_name || 'Your Company'} &lt;{formData.from_email || 'newsletter@example.com'}&gt;</div>
                <div className="text-sm text-gray-500">Subject: {formData.subject || '(No subject)'}</div>
              </div>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-gray-400">No content yet</p>' }}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowPreview(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
