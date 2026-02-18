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

interface Activity {
  recentOrders: RecentOrder[];
  upcomingPickups: RecentOrder[];
}

const statusColors: Record<string, string> = {
  inquiry: 'bg-blue-100 text-blue-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
  deposit_paid: 'bg-purple-100 text-purple-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  sending: 'bg-yellow-100 text-yellow-700',
  sent: 'bg-green-100 text-green-700',
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
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm md:text-base text-gray-500">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="New Inquiries"
          value={stats?.orders.inquiries || 0}
          sublabel="Last 30 days"
          icon={<InboxIcon />}
          color="blue"
        />
        <StatCard
          label="Pending Orders"
          value={stats?.orders.pending || 0}
          sublabel="Awaiting payment"
          icon={<ClockIcon />}
          color="yellow"
        />
        <StatCard
          label="Confirmed"
          value={stats?.orders.confirmed || 0}
          sublabel="Ready to fulfill"
          icon={<CheckIcon />}
          color="green"
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(stats?.orders.revenue || 0)}
          sublabel="Last 30 days"
          icon={<CurrencyIcon />}
          color="purple"
          isText
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border p-4 md:p-6 bg-white border-gray-200">
        <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <QuickAction href="/admin/orders" icon={<ClipboardIcon />} label="View Orders" />
          <QuickAction href="/admin/calendar" icon={<CalendarIcon />} label="Calendar" />
          <QuickAction href="/admin/customers" icon={<UsersIcon />} label="Customers" />
          <QuickAction href="/admin/settings" icon={<CogIcon />} label="Settings" />
        </div>
      </div>

      {/* Activity Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <ActivityCard
          title="Recent Orders"
          href="/admin/orders"
          linkText="View all orders"
          empty={!activity?.recentOrders?.length}
          emptyText="No orders yet"
        >
          {activity?.recentOrders?.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50"
            >
              <div>
                <div className="font-medium text-gray-900">{order.order_number}</div>
                <div className="text-sm text-gray-500">{order.customer_name}</div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${statusColors[order.status] || 'bg-gray-100'}`}>
                  {order.status.replace('_', ' ')}
                </span>
                <div className="text-xs mt-1 text-gray-400">{formatRelativeTime(order.created_at)}</div>
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
        >
          {activity?.upcomingPickups?.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50"
            >
              <div>
                <div className="font-medium text-gray-900">{order.customer_name}</div>
                <div className="text-sm text-gray-500">{order.order_number}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {order.pickup_date ? formatDate(order.pickup_date) : '-'}
                </div>
                <div className="text-sm text-gray-500">{formatCurrency(order.total_amount)}</div>
              </div>
            </Link>
          ))}
        </ActivityCard>
      </div>
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
}: {
  label: string;
  value: number | string;
  sublabel: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  isText?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="rounded-xl border p-4 md:p-6 bg-white border-gray-200">
      <div className="flex items-center gap-3 mb-2 md:mb-3">
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className={`${isText ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} font-bold text-gray-900`}>{value}</div>
      <div className="text-xs md:text-sm mt-1 text-gray-500">{label}</div>
      <div className="text-xs mt-0.5 hidden md:block text-gray-400">{sublabel}</div>
    </div>
  );
}

// Quick Action Component
function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-lg border transition-colors border-gray-200 hover:border-gray-300 hover:bg-gray-50"
    >
      <div className="text-gray-400">{icon}</div>
      <span className="text-sm md:text-base font-medium text-gray-700">{label}</span>
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
}: {
  title: string;
  href: string;
  linkText: string;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <Link href={href} className="text-sm text-blue-600 hover:text-blue-700">
          {linkText} &rarr;
        </Link>
      </div>
      <div className="divide-y divide-gray-100">
        {empty ? (
          <div className="p-6 text-center text-gray-500">{emptyText}</div>
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
