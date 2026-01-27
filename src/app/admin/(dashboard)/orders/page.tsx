import Link from 'next/link';
import { getDB, getEnvVar } from '@/lib/db';

interface Order {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  customer_name: string;
  customer_email: string;
  pickup_date: string | null;
  pickup_time: string | null;
  total_amount: number | null;
  created_at: string;
}

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string;
    type?: string;
    page?: string;
  }>;
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

function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const statusFilter = params.status || '';
  const typeFilter = params.type || '';
  const page = parseInt(params.page || '1');
  const perPage = 20;

  const db = getDB();

  let query = 'SELECT * FROM orders WHERE 1=1';
  const bindings: string[] = [];

  if (statusFilter) {
    query += ' AND status = ?';
    bindings.push(statusFilter);
  }

  if (typeFilter) {
    query += ' AND order_type = ?';
    bindings.push(typeFilter);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  bindings.push(String(perPage), String((page - 1) * perPage));

  const results = await db.prepare(query).bind(...bindings).all<Order>();
  const orders = results.results || [];

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) as count FROM orders WHERE 1=1';
  const countBindings: string[] = [];

  if (statusFilter) {
    countQuery += ' AND status = ?';
    countBindings.push(statusFilter);
  }

  if (typeFilter) {
    countQuery += ' AND order_type = ?';
    countBindings.push(typeFilter);
  }

  const countResult = await db.prepare(countQuery).bind(...countBindings).first<{ count: number }>();
  const totalOrders = countResult?.count || 0;
  const totalPages = Math.ceil(totalOrders / perPage);

  const buildUrl = (newParams: Record<string, string>) => {
    const url = new URLSearchParams();
    if (statusFilter) url.set('status', statusFilter);
    if (typeFilter) url.set('type', typeFilter);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) url.set(key, value);
      else url.delete(key);
    });
    return `/admin/orders?${url.toString()}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
            <div className="flex gap-2">
              <Link
                href={buildUrl({ status: '' })}
                className={`px-3 py-1.5 text-sm rounded-lg ${!statusFilter ? 'bg-amber-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              >
                All
              </Link>
              {['inquiry', 'pending_payment', 'deposit_paid', 'confirmed', 'completed', 'cancelled'].map((status) => (
                <Link
                  key={status}
                  href={buildUrl({ status })}
                  className={`px-3 py-1.5 text-sm rounded-lg capitalize ${statusFilter === status ? 'bg-amber-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                >
                  {status.replace('_', ' ')}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
            <div className="flex gap-2">
              <Link
                href={buildUrl({ type: '' })}
                className={`px-3 py-1.5 text-sm rounded-lg ${!typeFilter ? 'bg-amber-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              >
                All
              </Link>
              {Object.entries(orderTypeLabels).map(([value, label]) => (
                <Link
                  key={value}
                  href={buildUrl({ type: value })}
                  className={`px-3 py-1.5 text-sm rounded-lg ${typeFilter === value ? 'bg-amber-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-neutral-500">Order</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-neutral-500">Customer</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-neutral-500">Type</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-neutral-500">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-neutral-500">Pickup</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-neutral-500">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-amber-600 hover:text-amber-700">
                      {order.order_number}
                    </Link>
                    <div className="text-xs text-neutral-500">{formatDate(order.created_at)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{order.customer_name}</div>
                    <div className="text-sm text-neutral-500">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-700">
                      {orderTypeLabels[order.order_type] || order.order_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded capitalize ${statusColors[order.status] || 'bg-neutral-100'}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.pickup_date ? (
                      <div>
                        <div className="text-sm text-neutral-900">{formatDate(order.pickup_date)}</div>
                        {order.pickup_time && (
                          <div className="text-xs text-neutral-500">{formatTime(order.pickup_time)}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-medium text-neutral-900">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-neutral-500">
              Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, totalOrders)} of {totalOrders}
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="px-3 py-1.5 text-sm bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className="px-3 py-1.5 text-sm bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
