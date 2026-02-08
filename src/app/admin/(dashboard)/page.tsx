'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  tenantId: string;
  orders: {
    pending: number;
    confirmed: number;
    completed: number;
    inquiries: number;
    revenue: number;
  };
  bookings: {
    upcoming: number;
    today: number;
    thisWeek: number;
    pending: number;
  };
  blog: {
    total: number;
    published: number;
    drafts: number;
    totalViews: number;
  };
  newsletter: {
    subscribers: number;
    activeSubscribers: number;
    campaigns: number;
    sentThisMonth: number;
  };
}

interface RecentOrder {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  customer_name: string;
  pickup_date: string | null;
  total_amount: number | null;
  created_at: string;
}

interface RecentBooking {
  id: string;
  customer_name: string;
  customer_email: string;
  booking_type_name: string;
  start_time: string;
  status: string;
}

interface RecentPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  view_count: number;
  updated_at: string;
}

interface RecentCampaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  total_sent: number;
  sent_at: string | null;
}

interface Activity {
  recentOrders: RecentOrder[];
  upcomingPickups: RecentOrder[];
  recentBookings: RecentBooking[];
  upcomingBookings: RecentBooking[];
  recentPosts: RecentPost[];
  recentCampaigns: RecentCampaign[];
}

// Light theme status colors
const statusColorsLight: Record<string, string> = {
  // Order statuses
  inquiry: 'bg-blue-100 text-blue-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
  deposit_paid: 'bg-purple-100 text-purple-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
  // Booking statuses
  pending: 'bg-yellow-100 text-yellow-700',
  // Post statuses
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  // Campaign statuses
  sending: 'bg-yellow-100 text-yellow-700',
  sent: 'bg-green-100 text-green-700',
};

// Dark theme status colors
const statusColorsDark: Record<string, string> = {
  // Order statuses
  inquiry: 'bg-blue-900/50 text-blue-300',
  pending_payment: 'bg-yellow-900/50 text-yellow-300',
  deposit_paid: 'bg-purple-900/50 text-purple-300',
  confirmed: 'bg-green-900/50 text-green-300',
  completed: 'bg-gray-800 text-gray-300',
  cancelled: 'bg-red-900/50 text-red-300',
  // Booking statuses
  pending: 'bg-yellow-900/50 text-yellow-300',
  // Post statuses
  draft: 'bg-gray-800 text-gray-300',
  published: 'bg-green-900/50 text-green-300',
  scheduled: 'bg-blue-900/50 text-blue-300',
  // Campaign statuses
  sending: 'bg-yellow-900/50 text-yellow-300',
  sent: 'bg-green-900/50 text-green-300',
};

function formatCurrency(cents: number | null): string {
  if (cents === null || cents === 0) return '$0';
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch('/api/admin/dashboard/stats'),
          fetch('/api/admin/dashboard/activity'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json() as DashboardStats;
          setStats(statsData);
          setTenantId(statsData.tenantId || '');
        }

        if (activityRes.ok) {
          setActivity(await activityRes.json());
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const isBakery = tenantId === 'bakes-by-coral';
  const isDarkTheme = tenantId === 'leango'; // LeanGo uses dark theme
  const statusColors = isDarkTheme ? statusColorsDark : statusColorsLight;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
        <p className={`mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isBakery ? (
          <>
            <StatCard
              label="New Inquiries"
              value={stats?.orders.inquiries || 0}
              sublabel="Last 30 days"
              icon={<InboxIcon />}
              color="blue"
              isDark={isDarkTheme}
            />
            <StatCard
              label="Pending Orders"
              value={stats?.orders.pending || 0}
              sublabel="Awaiting payment"
              icon={<ClockIcon />}
              color="yellow"
              isDark={isDarkTheme}
            />
            <StatCard
              label="Confirmed"
              value={stats?.orders.confirmed || 0}
              sublabel="Ready to fulfill"
              icon={<CheckIcon />}
              color="green"
              isDark={isDarkTheme}
            />
            <StatCard
              label="Revenue"
              value={formatCurrency(stats?.orders.revenue || 0)}
              sublabel="Last 30 days"
              icon={<CurrencyIcon />}
              color="purple"
              isText
              isDark={isDarkTheme}
            />
          </>
        ) : (
          <>
            <StatCard
              label="Today's Bookings"
              value={stats?.bookings.today || 0}
              sublabel="Scheduled for today"
              icon={<CalendarIcon />}
              color="blue"
              isDark={isDarkTheme}
            />
            <StatCard
              label="This Week"
              value={stats?.bookings.thisWeek || 0}
              sublabel="Next 7 days"
              icon={<ClockIcon />}
              color="green"
              isDark={isDarkTheme}
            />
            <StatCard
              label="Blog Posts"
              value={stats?.blog.published || 0}
              sublabel={`${stats?.blog.drafts || 0} drafts`}
              icon={<DocumentIcon />}
              color="purple"
              isDark={isDarkTheme}
            />
            <StatCard
              label="Subscribers"
              value={stats?.newsletter.activeSubscribers || 0}
              sublabel="Active subscribers"
              icon={<UsersIcon />}
              color="yellow"
              isDark={isDarkTheme}
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className={`rounded-xl border p-6 ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isBakery ? (
            <>
              <QuickAction href="/admin/orders" icon={<ClipboardIcon />} label="View Orders" isDark={isDarkTheme} />
              <QuickAction href="/admin/calendar" icon={<CalendarIcon />} label="Calendar" isDark={isDarkTheme} />
              <QuickAction href="/admin/customers" icon={<UsersIcon />} label="Customers" isDark={isDarkTheme} />
              <QuickAction href="/admin/settings" icon={<CogIcon />} label="Settings" isDark={isDarkTheme} />
            </>
          ) : (
            <>
              <QuickAction href="/admin/bookings" icon={<CalendarIcon />} label="Manage Bookings" isDark={isDarkTheme} />
              <QuickAction href="/admin/blog/new" icon={<PlusIcon />} label="New Blog Post" isDark={isDarkTheme} />
              <QuickAction href="/admin/newsletter/campaigns/new" icon={<MailIcon />} label="New Campaign" isDark={isDarkTheme} />
              <QuickAction href="/admin/settings" icon={<CogIcon />} label="Settings" isDark={isDarkTheme} />
            </>
          )}
        </div>
      </div>

      {/* Activity Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isBakery ? (
          <>
            {/* Recent Orders */}
            <ActivityCard
              title="Recent Orders"
              href="/admin/orders"
              linkText="View all orders"
              empty={!activity?.recentOrders?.length}
              emptyText="No orders yet"
              isDark={isDarkTheme}
            >
              {activity?.recentOrders?.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className={`flex items-center justify-between p-4 transition-colors ${isDarkTheme ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                >
                  <div>
                    <div className={`font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{order.order_number}</div>
                    <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{order.customer_name}</div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${statusColors[order.status] || (isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-100')}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <div className={`text-xs mt-1 ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>{formatRelativeTime(order.created_at)}</div>
                  </div>
                </Link>
              ))}
            </ActivityCard>

            {/* Upcoming Pickups */}
            <ActivityCard
              title="Upcoming Pickups"
              href="/admin/calendar"
              linkText="View calendar"
              empty={!activity?.upcomingPickups?.length}
              emptyText="No upcoming pickups"
              isDark={isDarkTheme}
            >
              {activity?.upcomingPickups?.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className={`flex items-center justify-between p-4 transition-colors ${isDarkTheme ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                >
                  <div>
                    <div className={`font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{order.customer_name}</div>
                    <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{order.order_number}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                      {order.pickup_date ? formatDate(order.pickup_date) : '-'}
                    </div>
                    <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{formatCurrency(order.total_amount)}</div>
                  </div>
                </Link>
              ))}
            </ActivityCard>
          </>
        ) : (
          <>
            {/* Upcoming Bookings */}
            <ActivityCard
              title="Upcoming Bookings"
              href="/admin/bookings"
              linkText="View all bookings"
              empty={!activity?.upcomingBookings?.length}
              emptyText="No upcoming bookings"
              isDark={isDarkTheme}
            >
              {activity?.upcomingBookings?.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className={`flex items-center justify-between p-4 transition-colors ${isDarkTheme ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                >
                  <div>
                    <div className={`font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{booking.customer_name}</div>
                    <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{booking.booking_type_name || 'Meeting'}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{formatDateTime(booking.start_time)}</div>
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${statusColors[booking.status] || (isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-100')}`}>
                      {booking.status}
                    </span>
                  </div>
                </Link>
              ))}
            </ActivityCard>

            {/* Recent Blog Posts */}
            <ActivityCard
              title="Recent Blog Posts"
              href="/admin/blog"
              linkText="View all posts"
              empty={!activity?.recentPosts?.length}
              emptyText="No blog posts yet"
              isDark={isDarkTheme}
            >
              {activity?.recentPosts?.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/blog/${post.id}`}
                  className={`flex items-center justify-between p-4 transition-colors ${isDarkTheme ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className={`font-medium truncate ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{post.title}</div>
                    <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{post.view_count} views</div>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${statusColors[post.status] || (isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-100')}`}>
                      {post.status}
                    </span>
                    <div className={`text-xs mt-1 ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>{formatRelativeTime(post.updated_at)}</div>
                  </div>
                </Link>
              ))}
            </ActivityCard>
          </>
        )}
      </div>

      {/* Newsletter Section (for consulting) */}
      {!isBakery && (
        <div className={`rounded-xl border ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`flex items-center justify-between p-6 border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Recent Campaigns</h2>
            <Link href="/admin/newsletter" className={`text-sm ${isDarkTheme ? 'text-[#00a1f1] hover:text-[#0091d8]' : 'text-blue-600 hover:text-blue-700'}`}>
              View all &rarr;
            </Link>
          </div>
          <div className={`divide-y ${isDarkTheme ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {!activity?.recentCampaigns?.length ? (
              <div className={`p-6 text-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>No campaigns yet</div>
            ) : (
              activity.recentCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/admin/newsletter/campaigns/${campaign.id}`}
                  className={`flex items-center justify-between p-4 transition-colors ${isDarkTheme ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className={`font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{campaign.name}</div>
                    <div className={`text-sm truncate ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{campaign.subject}</div>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${statusColors[campaign.status] || (isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-100')}`}>
                      {campaign.status}
                    </span>
                    {campaign.status === 'sent' && (
                      <div className={`text-sm mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{campaign.total_sent} sent</div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  sublabel,
  icon,
  color,
  isText = false,
  isDark = false,
}: {
  label: string;
  value: number | string;
  sublabel: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  isText?: boolean;
  isDark?: boolean;
}) {
  const colorClassesLight = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const colorClassesDark = {
    blue: 'bg-blue-900/30 text-[#00a1f1]',
    green: 'bg-green-900/30 text-[#66d200]',
    yellow: 'bg-yellow-900/30 text-yellow-400',
    purple: 'bg-purple-900/30 text-purple-400',
  };

  const colorClasses = isDark ? colorClassesDark : colorClassesLight;

  return (
    <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className={`${isText ? 'text-2xl' : 'text-3xl'} font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</div>
      <div className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{label}</div>
      <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{sublabel}</div>
    </div>
  );
}

// Quick Action Component
function QuickAction({ href, icon, label, isDark = false }: { href: string; icon: React.ReactNode; label: string; isDark?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
        isDark
          ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className={isDark ? 'text-gray-400' : 'text-gray-400'}>{icon}</div>
      <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{label}</span>
    </Link>
  );
}

// Activity Card Component
function ActivityCard({
  title,
  href,
  linkText,
  empty,
  emptyText,
  children,
  isDark = false,
}: {
  title: string;
  href: string;
  linkText: string;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
  isDark?: boolean;
}) {
  return (
    <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
        <Link href={href} className={`text-sm ${isDark ? 'text-[#00a1f1] hover:text-[#0091d8]' : 'text-blue-600 hover:text-blue-700'}`}>
          {linkText} &rarr;
        </Link>
      </div>
      <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
        {empty ? (
          <div className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{emptyText}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// Icons
function InboxIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CurrencyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
