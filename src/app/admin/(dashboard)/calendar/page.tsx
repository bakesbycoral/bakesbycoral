import Link from 'next/link';
import { getDB } from '@/lib/db';

interface Order {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  customer_name: string;
  customer_email: string;
  pickup_date: string;
  pickup_time: string | null;
  total_amount: number | null;
}

interface CalendarPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
    day?: string;
  }>;
}

const orderTypeColors: Record<string, string> = {
  cookies: 'bg-amber-100 text-amber-800 border-amber-200',
  cookies_large: 'bg-orange-100 text-orange-800 border-orange-200',
  cake: 'bg-pink-100 text-pink-800 border-pink-200',
  wedding: 'bg-purple-100 text-purple-800 border-purple-200',
};

const orderTypeLabels: Record<string, string> = {
  cookies: 'Cookies',
  cookies_large: 'Large Order',
  cake: 'Cake',
  wedding: 'Wedding',
};

const statusColors: Record<string, string> = {
  inquiry: 'bg-blue-100 text-blue-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
  deposit_paid: 'bg-purple-100 text-purple-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-neutral-100 text-neutral-700',
  cancelled: 'bg-red-100 text-red-700',
};

function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function formatCurrency(cents: number | null): string {
  if (cents === null) return '-';
  return `$${(cents / 100).toFixed(2)}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// Get capacity indicator color based on fill percentage
function getCapacityColor(orderCount: number, maxCapacity: number): string {
  if (orderCount === 0) return '';
  const fillPercentage = orderCount / maxCapacity;
  if (fillPercentage >= 1) return 'bg-red-500';
  if (fillPercentage >= 0.7) return 'bg-amber-500';
  return 'bg-green-500';
}

function getCapacityBgColor(orderCount: number, maxCapacity: number): string {
  if (orderCount === 0) return '';
  const fillPercentage = orderCount / maxCapacity;
  if (fillPercentage >= 1) return 'bg-red-50';
  if (fillPercentage >= 0.7) return 'bg-amber-50';
  return '';
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth();
  const selectedDay = params.day ? parseInt(params.day) : null;

  const db = getDB();

  // Get orders for this month
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${getDaysInMonth(year, month)}`;

  const results = await db.prepare(`
    SELECT id, order_number, order_type, status, customer_name, customer_email, pickup_date, pickup_time, total_amount
    FROM orders
    WHERE pickup_date >= ? AND pickup_date <= ?
      AND status NOT IN ('cancelled', 'pending_payment')
    ORDER BY pickup_date, pickup_time
  `).bind(startDate, endDate).all<Order>();

  const orders = results.results || [];

  // Get slot capacity setting
  const capacitySetting = await db.prepare('SELECT value FROM settings WHERE key = ?')
    .bind('default_slot_capacity')
    .first<{ value: string }>();
  const defaultCapacity = capacitySetting ? parseInt(capacitySetting.value) : 2;

  // Get slot interval to calculate daily capacity
  const intervalSetting = await db.prepare('SELECT value FROM settings WHERE key = ?')
    .bind('slot_interval_minutes')
    .first<{ value: string }>();
  const slotInterval = intervalSetting ? parseInt(intervalSetting.value) : 30;

  // Estimate max daily orders (assuming 8-hour day with slots)
  const slotsPerDay = Math.floor((8 * 60) / slotInterval);
  const maxDailyOrders = slotsPerDay * defaultCapacity;

  // Group orders by date
  const ordersByDate: Record<string, Order[]> = {};
  for (const order of orders) {
    if (!ordersByDate[order.pickup_date]) {
      ordersByDate[order.pickup_date] = [];
    }
    ordersByDate[order.pickup_date].push(order);
  }

  // Generate calendar data
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  // Create calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Get orders for selected day
  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedDayOrders = selectedDateStr ? ordersByDate[selectedDateStr] || [] : [];

  // Group selected day orders by time slot
  const ordersByTimeSlot: Record<string, Order[]> = {};
  for (const order of selectedDayOrders) {
    const slot = order.pickup_time || 'Unscheduled';
    if (!ordersByTimeSlot[slot]) {
      ordersByTimeSlot[slot] = [];
    }
    ordersByTimeSlot[slot].push(order);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Calendar</h1>
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/calendar?month=${prevMonth}&year=${prevYear}`}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-lg font-semibold text-neutral-900">
            {monthNames[month]} {year}
          </span>
          <Link
            href={`/admin/calendar?month=${nextMonth}&year=${nextYear}`}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-neutral-50 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-neutral-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                const dayOrders = day ? ordersByDate[dateStr] || [] : [];
                const isToday = day && year === now.getFullYear() && month === now.getMonth() && day === now.getDate();
                const isSelected = day === selectedDay;
                const capacityColor = getCapacityColor(dayOrders.length, maxDailyOrders);
                const capacityBgColor = getCapacityBgColor(dayOrders.length, maxDailyOrders);

                return (
                  <Link
                    key={index}
                    href={day ? `/admin/calendar?month=${month}&year=${year}&day=${day}` : '#'}
                    className={`
                      min-h-[100px] p-2 border-b border-r transition-colors
                      ${!day ? 'bg-neutral-50 pointer-events-none' : 'hover:bg-neutral-50 cursor-pointer'}
                      ${isToday ? 'bg-amber-50' : capacityBgColor}
                      ${isSelected ? 'ring-2 ring-inset ring-amber-500' : ''}
                    `}
                  >
                    {day && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`
                            text-sm font-medium
                            ${isToday ? 'text-amber-600' : 'text-neutral-700'}
                          `}>
                            {day}
                          </span>
                          {dayOrders.length > 0 && (
                            <span className={`
                              w-2 h-2 rounded-full
                              ${capacityColor}
                            `} title={`${dayOrders.length} orders`} />
                          )}
                        </div>
                        <div className="space-y-1">
                          {dayOrders.slice(0, 2).map((order) => (
                            <div
                              key={order.id}
                              className={`
                                px-1.5 py-0.5 text-xs rounded truncate
                                ${orderTypeColors[order.order_type] || 'bg-neutral-100 text-neutral-700'}
                              `}
                              title={`${order.customer_name} - ${formatTime(order.pickup_time)}`}
                            >
                              {order.customer_name.split(' ')[0]}
                            </div>
                          ))}
                          {dayOrders.length > 2 && (
                            <div className="text-xs text-neutral-500 px-1.5">
                              +{dayOrders.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-4">
              {Object.entries(orderTypeLabels).map(([type, label]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded ${orderTypeColors[type]?.split(' ')[0] || 'bg-neutral-100'}`} />
                  <span className="text-xs text-neutral-600">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-neutral-600">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-neutral-600">Filling Up</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-neutral-600">Full</span>
              </div>
            </div>
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            {selectedDay ? (
              <>
                <h2 className="font-semibold text-neutral-900 mb-1">
                  {new Date(selectedDateStr!).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h2>
                <p className="text-sm text-neutral-500 mb-4">
                  {selectedDayOrders.length} pickup{selectedDayOrders.length !== 1 ? 's' : ''} scheduled
                </p>

                {selectedDayOrders.length === 0 ? (
                  <p className="text-neutral-500 text-sm py-8 text-center">
                    No pickups scheduled for this day.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(ordersByTimeSlot)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([time, timeOrders]) => (
                        <div key={time}>
                          <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                            {time === 'Unscheduled' ? time : formatTime(time)}
                            <span className="ml-1 text-neutral-400">
                              ({timeOrders.length}/{defaultCapacity})
                            </span>
                          </h3>
                          <div className="space-y-2">
                            {timeOrders.map((order) => (
                              <Link
                                key={order.id}
                                href={`/admin/orders/${order.id}`}
                                className="block p-3 rounded-lg border border-neutral-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`
                                    px-2 py-0.5 text-xs font-medium rounded
                                    ${orderTypeColors[order.order_type] || 'bg-neutral-100'}
                                  `}>
                                    {orderTypeLabels[order.order_type]}
                                  </span>
                                  <span className={`
                                    px-2 py-0.5 text-xs rounded capitalize
                                    ${statusColors[order.status] || 'bg-neutral-100'}
                                  `}>
                                    {order.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="font-medium text-neutral-900">
                                  {order.customer_name}
                                </div>
                                <div className="text-sm text-neutral-500">
                                  {order.order_number}
                                </div>
                                {order.total_amount && (
                                  <div className="text-sm font-medium text-neutral-700 mt-1">
                                    {formatCurrency(order.total_amount)}
                                  </div>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <svg className="w-12 h-12 text-neutral-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-neutral-500 text-sm">
                  Click on a day to see pickup details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* This Month's Pickups */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-neutral-900 mb-4">This Month&apos;s Pickups</h2>
        {orders.length === 0 ? (
          <p className="text-neutral-500">No pickups scheduled this month.</p>
        ) : (
          <div className="divide-y">
            {orders.slice(0, 15).map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between py-3 hover:bg-neutral-50 -mx-2 px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`px-2 py-1 text-xs font-medium rounded ${orderTypeColors[order.order_type] || 'bg-neutral-100'}`}>
                    {orderTypeLabels[order.order_type]}
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">{order.customer_name}</div>
                    <div className="text-sm text-neutral-500">{order.order_number}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-neutral-900">
                    {new Date(order.pickup_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-sm text-neutral-500">{formatTime(order.pickup_time)}</div>
                </div>
              </Link>
            ))}
            {orders.length > 15 && (
              <div className="pt-3 text-center">
                <span className="text-sm text-neutral-500">
                  +{orders.length - 15} more pickups this month
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
