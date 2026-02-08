import { cookies } from 'next/headers';
import { getDB, getEnvVar } from '@/lib/db';
import { verifySession } from '@/lib/auth/session';

async function getTenantId(): Promise<string> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  if (!sessionToken) return 'leango';
  const session = await verifySession(sessionToken, getEnvVar('bakesbycoral_session_secret'));
  return session?.tenantId || 'leango';
}

async function getAnalyticsData(tenantId: string) {
  const db = getDB();

  // Get total clients
  const clientsResult = await db.prepare(`
    SELECT COUNT(*) as total FROM clients WHERE tenant_id = ?
  `).bind(tenantId).first<{ total: number }>();

  // Get clients by status
  const clientsByStatus = await db.prepare(`
    SELECT status, COUNT(*) as count FROM clients WHERE tenant_id = ? GROUP BY status
  `).bind(tenantId).all<{ status: string; count: number }>();

  // Get total bookings
  const bookingsResult = await db.prepare(`
    SELECT COUNT(*) as total FROM bookings WHERE tenant_id = ?
  `).bind(tenantId).first<{ total: number }>();

  // Get bookings by status
  const bookingsByStatus = await db.prepare(`
    SELECT status, COUNT(*) as count FROM bookings WHERE tenant_id = ? GROUP BY status
  `).bind(tenantId).all<{ status: string; count: number }>();

  // Get newsletter subscribers
  const subscribersResult = await db.prepare(`
    SELECT COUNT(*) as total FROM newsletter_subscribers WHERE tenant_id = ? AND status = 'subscribed'
  `).bind(tenantId).first<{ total: number }>();

  // Get contact submissions this month
  const contactsResult = await db.prepare(`
    SELECT COUNT(*) as total FROM contact_submissions
    WHERE tenant_id = ? AND created_at >= date('now', 'start of month')
  `).bind(tenantId).first<{ total: number }>();

  // Get blog posts
  const postsResult = await db.prepare(`
    SELECT COUNT(*) as total FROM blog_posts WHERE tenant_id = ? AND status = 'published'
  `).bind(tenantId).first<{ total: number }>();

  // Get recent bookings
  const recentBookings = await db.prepare(`
    SELECT b.*, bt.name as booking_type_name
    FROM bookings b
    LEFT JOIN booking_types bt ON b.booking_type_id = bt.id
    WHERE b.tenant_id = ?
    ORDER BY b.created_at DESC
    LIMIT 5
  `).bind(tenantId).all();

  // Get recent contacts
  const recentContacts = await db.prepare(`
    SELECT * FROM contact_submissions
    WHERE tenant_id = ?
    ORDER BY created_at DESC
    LIMIT 5
  `).bind(tenantId).all();

  return {
    clients: {
      total: clientsResult?.total || 0,
      byStatus: clientsByStatus.results || [],
    },
    bookings: {
      total: bookingsResult?.total || 0,
      byStatus: bookingsByStatus.results || [],
      recent: recentBookings.results || [],
    },
    subscribers: subscribersResult?.total || 0,
    contactsThisMonth: contactsResult?.total || 0,
    publishedPosts: postsResult?.total || 0,
    recentContacts: recentContacts.results || [],
  };
}

export default async function AnalyticsPage() {
  const tenantId = await getTenantId();
  const data = await getAnalyticsData(tenantId);

  const stats = [
    { name: 'Total Clients', value: data.clients.total, icon: '🏢' },
    { name: 'Total Bookings', value: data.bookings.total, icon: '📅' },
    { name: 'Newsletter Subscribers', value: data.subscribers, icon: '📧' },
    { name: 'Contacts This Month', value: data.contactsThisMonth, icon: '💬' },
    { name: 'Published Blog Posts', value: data.publishedPosts, icon: '📝' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Overview of your business metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Client Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Clients by Status</h2>
          {data.clients.byStatus.length === 0 ? (
            <p className="text-gray-500 text-sm">No clients yet</p>
          ) : (
            <div className="space-y-3">
              {data.clients.byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="capitalize text-gray-700">{item.status}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Status</h2>
          {data.bookings.byStatus.length === 0 ? (
            <p className="text-gray-500 text-sm">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {data.bookings.byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="capitalize text-gray-700">{item.status}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
          {data.bookings.recent.length === 0 ? (
            <p className="text-gray-500 text-sm">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {data.bookings.recent.map((booking: { id: string; customer_name: string; booking_type_name: string; start_time: string }) => (
                <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="font-medium text-gray-900">{booking.customer_name}</div>
                    <div className="text-sm text-gray-500">{booking.booking_type_name}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(booking.start_time).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Contacts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Contact Submissions</h2>
          {data.recentContacts.length === 0 ? (
            <p className="text-gray-500 text-sm">No contact submissions yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentContacts.map((contact: { id: string; name: string; email: string; created_at: string }) => (
                <div key={contact.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="font-medium text-gray-900">{contact.name}</div>
                    <div className="text-sm text-gray-500">{contact.email}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
