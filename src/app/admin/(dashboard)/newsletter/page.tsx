import Link from 'next/link';
import { cookies } from 'next/headers';
import { getDB, getEnvVar } from '@/lib/db';
import { verifySession } from '@/lib/auth/session';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  total_sent: number;
  created_at: string;
}

interface Stats {
  total_subscribers: number;
  active_subscribers: number;
  total_campaigns: number;
  sent_campaigns: number;
}

async function getTenantId(): Promise<string> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) return 'bakesbycoral';

  const session = await verifySession(sessionToken, getEnvVar('bakesbycoral_session_secret'));
  return session?.tenantId || 'bakesbycoral';
}

async function getStats(tenantId: string): Promise<Stats> {
  const db = getDB();

  const subscribers = await db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'subscribed' THEN 1 ELSE 0 END) as active
    FROM newsletter_subscribers
    WHERE tenant_id = ?
  `).bind(tenantId).first<{ total: number; active: number }>();

  const campaigns = await db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent
    FROM newsletter_campaigns
    WHERE tenant_id = ?
  `).bind(tenantId).first<{ total: number; sent: number }>();

  return {
    total_subscribers: subscribers?.total || 0,
    active_subscribers: subscribers?.active || 0,
    total_campaigns: campaigns?.total || 0,
    sent_campaigns: campaigns?.sent || 0,
  };
}

async function getCampaigns(tenantId: string): Promise<Campaign[]> {
  const db = getDB();
  const result = await db.prepare(`
    SELECT id, name, subject, status, scheduled_at, sent_at, total_sent, created_at
    FROM newsletter_campaigns
    WHERE tenant_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `).bind(tenantId).all<Campaign>();

  return result.results;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  sending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function NewsletterPage() {
  const tenantId = await getTenantId();
  const [stats, campaigns] = await Promise.all([
    getStats(tenantId),
    getCampaigns(tenantId),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-gray-600 mt-1">Manage subscribers and campaigns</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/newsletter/subscribers"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            View Subscribers
          </Link>
          <Link
            href="/admin/newsletter/campaigns/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Campaign
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Subscribers</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total_subscribers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Active Subscribers</p>
          <p className="text-2xl font-bold text-green-600">{stats.active_subscribers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Campaigns</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total_campaigns}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Campaigns Sent</p>
          <p className="text-2xl font-bold text-blue-600">{stats.sent_campaigns}</p>
        </div>
      </div>

      {/* Campaigns */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-4">Create your first email campaign.</p>
            <Link
              href="/admin/newsletter/campaigns/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Campaign
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.subject}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[campaign.status] || statusColors.draft}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {campaign.total_sent}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(campaign.sent_at || campaign.scheduled_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/newsletter/campaigns/${campaign.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
