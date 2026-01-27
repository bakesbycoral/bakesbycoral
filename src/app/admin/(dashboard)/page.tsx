import Link from 'next/link';
import { getDB, getEnvVar } from '@/lib/db';

interface OrderStats {
  pending: number;
  confirmed: number;
  completed: number;
  inquiries: number;
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

async function getStats(): Promise<OrderStats> {
  const db = getDB();

  const results = await db.prepare(`
    SELECT
      SUM(CASE WHEN status IN ('pending_payment', 'deposit_paid') THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'inquiry' THEN 1 ELSE 0 END) as inquiries
    FROM orders
    WHERE created_at >= datetime('now', '-30 days')
  `).first<OrderStats>();

  return results || { pending: 0, confirmed: 0, completed: 0, inquiries: 0 };
}

async function getRecentOrders(): Promise<RecentOrder[]> {
  const db = getDB();

  const results = await db.prepare(`
    SELECT id, order_number, order_type, status, customer_name, pickup_date, total_amount, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 10
  `).all<RecentOrder>();

  return results.results || [];
}

async function getUpcomingPickups(): Promise<RecentOrder[]> {
  const db = getDB();

  const results = await db.prepare(`
    SELECT id, order_number, order_type, status, customer_name, pickup_date, total_amount, created_at
    FROM orders
    WHERE pickup_date >= date('now')
      AND status IN ('confirmed', 'deposit_paid')
    ORDER BY pickup_date ASC
    LIMIT 5
  `).all<RecentOrder>();

  return results.results || [];
}

const statusColors: Record<string, string> = {
  inquiry: 'bg-blue-100 text-blue-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
  deposit_paid: 'bg-purple-100 text-purple-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-neutral-100 text-neutral-700',
  cancelled: 'bg-red-100 text-red-700',
};

const orderTypeLabels: Record<string, string> = {
  cookies: 'Cookies',
  cookies_large: 'Large Cookies',
  cake: 'Cake',
  wedding: 'Wedding',
};

function formatCurrency(cents: number | null): string {
  if (cents === null) return '-';
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders, upcomingPickups] = await Promise.all([
    getStats(),
    getRecentOrders(),
    getUpcomingPickups(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-sm text-neutral-500 mb-1">New Inquiries</div>
          <div className="text-3xl font-bold text-blue-600">{stats.inquiries}</div>
          <div className="text-xs text-neutral-400 mt-1">Last 30 days</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-sm text-neutral-500 mb-1">Pending</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-neutral-400 mt-1">Awaiting payment</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-sm text-neutral-500 mb-1">Confirmed</div>
          <div className="text-3xl font-bold text-green-600">{stats.confirmed}</div>
          <div className="text-xs text-neutral-400 mt-1">Ready to fulfill</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-sm text-neutral-500 mb-1">Completed</div>
          <div className="text-3xl font-bold text-neutral-600">{stats.completed}</div>
          <div className="text-xs text-neutral-400 mt-1">Last 30 days</div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="font-semibold text-neutral-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-amber-600 hover:text-amber-700">
              View all &rarr;
            </Link>
          </div>
          <div className="divide-y">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-neutral-500">No orders yet</div>
            ) : (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-neutral-900">{order.order_number}</div>
                    <div className="text-sm text-neutral-500">{order.customer_name}</div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${statusColors[order.status] || 'bg-neutral-100'}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <div className="text-sm text-neutral-500 mt-1">
                      {orderTypeLabels[order.order_type] || order.order_type}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Pickups */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="font-semibold text-neutral-900">Upcoming Pickups</h2>
            <Link href="/admin/calendar" className="text-sm text-amber-600 hover:text-amber-700">
              View calendar &rarr;
            </Link>
          </div>
          <div className="divide-y">
            {upcomingPickups.length === 0 ? (
              <div className="p-6 text-center text-neutral-500">No upcoming pickups</div>
            ) : (
              upcomingPickups.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-neutral-900">{order.customer_name}</div>
                    <div className="text-sm text-neutral-500">{order.order_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-neutral-900">
                      {order.pickup_date ? formatDate(order.pickup_date) : '-'}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {formatCurrency(order.total_amount)}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
