'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { TipTapEditor } from '@/components/admin/TipTapEditor';
import { sanitizeHtml } from '@/lib/sanitize';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  preview_text: string | null;
  from_name: string | null;
  from_email: string | null;
  reply_to: string | null;
  content: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  completed_at: string | null;
  total_recipients: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_unsubscribed: number;
  created_at: string;
  updated_at: string;
}

interface SubscriberCount {
  total: number;
  active: number;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  sending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'sender' | 'schedule' | 'analytics'>('content');
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

  const [originalCampaign, setOriginalCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [campaignRes, countRes] = await Promise.all([
          fetch(`/api/admin/newsletter/campaigns/${campaignId}`),
          fetch('/api/admin/newsletter/subscribers/count'),
        ]);

        if (campaignRes.ok) {
          const campaign = await campaignRes.json() as Campaign;
          setOriginalCampaign(campaign);
          setFormData({
            name: campaign.name,
            subject: campaign.subject,
            preview_text: campaign.preview_text || '',
            from_name: campaign.from_name || '',
            from_email: campaign.from_email || '',
            reply_to: campaign.reply_to || '',
            content: campaign.content,
            status: campaign.status,
            scheduled_at: campaign.scheduled_at ? campaign.scheduled_at.slice(0, 16) : '',
          });

          // Show analytics tab for sent campaigns
          if (campaign.status === 'sent' || campaign.status === 'sending') {
            setActiveTab('analytics');
          }
        } else {
          router.push('/admin/newsletter');
          return;
        }

        if (countRes.ok) {
          const data = await countRes.json() as SubscriberCount;
          setSubscriberCount(data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [campaignId, router]);

  const handleSubmit = async (e: React.FormEvent, submitStatus: string) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSubmit = {
        ...formData,
        status: submitStatus,
      };

      const response = await fetch(`/api/admin/newsletter/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        if (submitStatus === 'sending') {
          // Trigger the actual send
          await fetch(`/api/admin/newsletter/campaigns/${campaignId}/send`, {
            method: 'POST',
          });
          router.push('/admin/newsletter');
        } else if (submitStatus === 'scheduled') {
          router.push('/admin/newsletter');
        } else {
          // Refresh the data
          const campaignRes = await fetch(`/api/admin/newsletter/campaigns/${campaignId}`);
          if (campaignRes.ok) {
            const campaign = await campaignRes.json() as Campaign;
            setOriginalCampaign(campaign);
          }
        }
      }
    } catch (error) {
      console.error('Failed to update campaign:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/newsletter/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/newsletter');
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const isEditable = originalCampaign?.status === 'draft' || originalCampaign?.status === 'scheduled';
  const isSent = originalCampaign?.status === 'sent' || originalCampaign?.status === 'sending';
  const canSend = formData.name && formData.subject && formData.content && subscriberCount.active > 0;

  // Calculate analytics
  const openRate = originalCampaign && originalCampaign.total_sent > 0
    ? ((originalCampaign.total_opened / originalCampaign.total_sent) * 100).toFixed(1)
    : '0';
  const clickRate = originalCampaign && originalCampaign.total_sent > 0
    ? ((originalCampaign.total_clicked / originalCampaign.total_sent) * 100).toFixed(1)
    : '0';

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
            <h1 className="text-2xl font-bold text-gray-900">{originalCampaign?.name || 'Campaign'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[originalCampaign?.status || 'draft']}`}>
                {originalCampaign?.status}
              </span>
              {originalCampaign?.sent_at && (
                <span className="text-sm text-gray-500">
                  Sent {new Date(originalCampaign.sent_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        {isEditable && (
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
              Save
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
        )}
      </div>

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
          {isEditable && (
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
          )}
          {isSent && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          )}
        </nav>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Analytics Tab (for sent campaigns) */}
        {activeTab === 'analytics' && isSent && originalCampaign && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500">Total Sent</p>
                <p className="text-3xl font-bold text-gray-900">{originalCampaign.total_sent}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500">Opened</p>
                <p className="text-3xl font-bold text-green-600">{originalCampaign.total_opened}</p>
                <p className="text-sm text-gray-400">{openRate}% open rate</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500">Clicked</p>
                <p className="text-3xl font-bold text-blue-600">{originalCampaign.total_clicked}</p>
                <p className="text-sm text-gray-400">{clickRate}% click rate</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500">Bounced</p>
                <p className="text-3xl font-bold text-red-600">{originalCampaign.total_bounced}</p>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Details</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Subject</dt>
                  <dd className="font-medium text-gray-900">{originalCampaign.subject}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Sent At</dt>
                  <dd className="font-medium text-gray-900">
                    {originalCampaign.sent_at
                      ? new Date(originalCampaign.sent_at).toLocaleString()
                      : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Recipients</dt>
                  <dd className="font-medium text-gray-900">{originalCampaign.total_recipients}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Unsubscribed</dt>
                  <dd className="font-medium text-gray-900">{originalCampaign.total_unsubscribed}</dd>
                </div>
              </dl>
            </div>

            {/* Email Content Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Email Content</h3>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(originalCampaign.content) }}
              />
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name *
              </label>
              <input
                type="text"
                id="name"
                required
                disabled={!isEditable}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Email Subject *
              </label>
              <input
                type="text"
                id="subject"
                required
                disabled={!isEditable}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label htmlFor="preview_text" className="block text-sm font-medium text-gray-700 mb-1">
                Preview Text
              </label>
              <input
                type="text"
                id="preview_text"
                disabled={!isEditable}
                value={formData.preview_text}
                onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                maxLength={150}
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Content *
              </label>
              {isEditable ? (
                <TipTapEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                />
              ) : (
                <div
                  className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(formData.content) }}
                />
              )}
            </div>
          </div>
        )}

        {/* Sender Tab */}
        {activeTab === 'sender' && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sender Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="from_name" className="block text-sm font-medium text-gray-700 mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    id="from_name"
                    disabled={!isEditable}
                    value={formData.from_name}
                    onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="from_email" className="block text-sm font-medium text-gray-700 mb-1">
                    From Email
                  </label>
                  <input
                    type="email"
                    id="from_email"
                    disabled={!isEditable}
                    value={formData.from_email}
                    onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="reply_to" className="block text-sm font-medium text-gray-700 mb-1">
                    Reply-To Email
                  </label>
                  <input
                    type="email"
                    id="reply_to"
                    disabled={!isEditable}
                    value={formData.reply_to}
                    onChange={(e) => setFormData({ ...formData, reply_to: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && isEditable && (
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
                    <div className="text-sm text-gray-500">Send to {subscriberCount.active} subscribers now</div>
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
                    <div className="text-sm text-gray-500 mb-3">Choose a specific date and time</div>
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

            {/* Danger Zone */}
            <div className="bg-white rounded-xl border border-red-200 p-6">
              <h3 className="text-sm font-medium text-red-700 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete this campaign. This action cannot be undone.
              </p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Campaign'}
              </button>
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
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(formData.content || '<p class="text-gray-400">No content yet</p>') }}
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
