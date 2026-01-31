import Link from 'next/link';
import { getDB } from '@/lib/db';
import { getBlackoutDates } from '@/lib/db/blackout';

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
  form_data: string | null;
}

interface ParsedOrder extends Order {
  isDelivery: boolean;
  deliveryLocation?: string;
}

interface BlackoutDate {
  id: string;
  date: string;
  reason: string | null;
}

interface CalendarPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
    day?: string;
  }>;
}

const orderTypeColors: Record<string, string> = {
  cookies: 'bg-[#ffe3c6] text-[#704a20] border-[#f0d0a8]',
  cookies_large: 'bg-[#f6f4d0] text-[#5c5a20] border-[#e0deb0]',
  cake: 'bg-[#e4f7bf] text-[#3d5c1a] border-[#c8e09a]',
  wedding: 'bg-[#d0f0ff] text-[#1a4a5c] border-[#a8d8f0]',
  tasting: 'bg-[#d6e2ff] text-[#2a3a5c] border-[#b8c8f0]',
};

const orderTypeLabels: Record<string, string> = {
  cookies: 'Cookies',
  cookies_large: 'Large Order',
  cake: 'Cake',
  wedding: 'Wedding',
  tasting: 'Tasting',
};

const statusColors: Record<string, string> = {
  inquiry: 'bg-[#ffd6ae] text-[#6b4020]',
  pending_payment: 'bg-[#fff2b5] text-[#5c5010]',
  deposit_paid: 'bg-[#cff3a8] text-[#2d5c1a]',
  confirmed: 'bg-[#c1ecf8] text-[#1a4a5c]',
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
    SELECT id, order_number, order_type, status, customer_name, customer_email, pickup_date, pickup_time, total_amount, form_data
    FROM orders
    WHERE pickup_date >= ? AND pickup_date <= ?
      AND status NOT IN ('cancelled', 'pending_payment')
    ORDER BY pickup_date, pickup_time
  `).bind(startDate, endDate).all<Order>();

  // Parse orders to determine pickup vs delivery
  const orders: ParsedOrder[] = (results.results || []).map((order) => {
    let isDelivery = false;
    let deliveryLocation = '';
    if (order.form_data) {
      try {
        const formData = JSON.parse(order.form_data);
        isDelivery = formData.pickup_or_delivery === 'delivery' || formData.pickupOrDelivery === 'delivery';
        deliveryLocation = formData.event_location || formData.eventLocation || '';
      } catch {
        // ignore parse errors
      }
    }
    return { ...order, isDelivery, deliveryLocation };
  });

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
  const ordersByDate: Record<string, ParsedOrder[]> = {};
  for (const order of orders) {
    if (!ordersByDate[order.pickup_date]) {
      ordersByDate[order.pickup_date] = [];
    }
    ordersByDate[order.pickup_date].push(order);
  }

  // Separate pickups and deliveries
  const pickupOrders = orders.filter(o => !o.isDelivery);
  const deliveryOrders = orders.filter(o => o.isDelivery);

  // Fetch blackout dates for this month
  const allBlackoutDates = await getBlackoutDates();
  const blackoutDateMap: Record<string, BlackoutDate> = {};
  for (const blackout of allBlackoutDates) {
    if (blackout.date >= startDate && blackout.date <= endDate) {
      blackoutDateMap[blackout.date] = blackout as BlackoutDate;
    }
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
  const selectedDayBlocked = selectedDateStr ? blackoutDateMap[selectedDateStr] : null;

  // Separate selected day into pickups and deliveries
  const selectedDayPickups = selectedDayOrders.filter(o => !o.isDelivery);
  const selectedDayDeliveries = selectedDayOrders.filter(o => o.isDelivery);

  // Group selected day pickups by time slot
  const pickupsByTimeSlot: Record<string, ParsedOrder[]> = {};
  for (const order of selectedDayPickups) {
    const slot = order.pickup_time || 'Unscheduled';
    if (!pickupsByTimeSlot[slot]) {
      pickupsByTimeSlot[slot] = [];
    }
    pickupsByTimeSlot[slot].push(order);
  }

  // Group selected day deliveries by time slot
  const deliveriesByTimeSlot: Record<string, ParsedOrder[]> = {};
  for (const order of selectedDayDeliveries) {
    const slot = order.pickup_time || 'Unscheduled';
    if (!deliveriesByTimeSlot[slot]) {
      deliveriesByTimeSlot[slot] = [];
    }
    deliveriesByTimeSlot[slot].push(order);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#541409]">Calendar</h1>
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/calendar?month=${prevMonth}&year=${prevYear}`}
            className="p-2 hover:bg-[#EAD6D6]/30 rounded-lg transition-colors text-[#541409]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-lg font-semibold text-[#541409]">
            {monthNames[month]} {year}
          </span>
          <Link
            href={`/admin/calendar?month=${nextMonth}&year=${nextYear}`}
            className="p-2 hover:bg-[#EAD6D6]/30 rounded-lg transition-colors text-[#541409]"
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
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#EAD6D6]">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-[#EAD6D6]/30 border-b border-[#EAD6D6]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-[#541409]">
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
                const isBlocked = day ? !!blackoutDateMap[dateStr] : false;
                const blockedReason = isBlocked ? blackoutDateMap[dateStr]?.reason : null;
                const capacityColor = getCapacityColor(dayOrders.length, maxDailyOrders);
                const capacityBgColor = getCapacityBgColor(dayOrders.length, maxDailyOrders);

                return (
                  <Link
                    key={index}
                    href={day ? `/admin/calendar?month=${month}&year=${year}&day=${day}` : '#'}
                    className={`
                      min-h-[100px] p-2 border-b border-r border-[#EAD6D6] transition-colors relative
                      ${!day ? 'bg-[#EAD6D6]/20 pointer-events-none' : 'hover:bg-[#EAD6D6]/20 cursor-pointer'}
                      ${isBlocked ? 'bg-neutral-100' : isToday ? 'bg-[#EAD6D6]/40' : capacityBgColor}
                      ${isSelected ? 'ring-2 ring-inset ring-[#541409]' : ''}
                    `}
                  >
                    {day && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`
                            text-sm font-medium
                            ${isBlocked ? 'text-neutral-400 line-through' : isToday ? 'text-[#541409]' : 'text-[#541409]/80'}
                          `}>
                            {day}
                          </span>
                          {isBlocked ? (
                            <span className="w-2 h-2 rounded-full bg-neutral-400" title="Blocked" />
                          ) : dayOrders.length > 0 ? (
                            <span className={`
                              w-2 h-2 rounded-full
                              ${capacityColor}
                            `} title={`${dayOrders.length} orders`} />
                          ) : null}
                        </div>
                        {isBlocked ? (
                          <div className="mt-2">
                            <div className="px-1.5 py-1 text-xs rounded bg-neutral-200 text-neutral-600 font-medium">
                              Blocked
                            </div>
                            {blockedReason && (
                              <div className="text-xs text-neutral-500 mt-1 px-1.5 truncate">
                                {blockedReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {dayOrders.slice(0, 2).map((order) => (
                              <div
                                key={order.id}
                                className={`
                                  px-1.5 py-0.5 text-xs rounded truncate
                                  ${orderTypeColors[order.order_type] || 'bg-[#EAD6D6] text-[#541409]'}
                                `}
                                title={`${order.customer_name} - ${formatTime(order.pickup_time)}`}
                              >
                                {order.customer_name.split(' ')[0]}
                              </div>
                            ))}
                            {dayOrders.length > 2 && (
                              <div className="text-xs text-[#541409]/60 px-1.5">
                                +{dayOrders.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
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
                  <div className={`w-3 h-3 rounded ${orderTypeColors[type]?.split(' ')[0] || 'bg-[#EAD6D6]'}`} />
                  <span className="text-xs text-[#541409]/70">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-[#541409]/70">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-[#541409]/70">Filling Up</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-[#541409]/70">Full</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-neutral-400" />
                <span className="text-xs text-[#541409]/70">Blocked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6 border border-[#EAD6D6]">
            {selectedDay ? (
              <>
                <h2 className="font-semibold text-[#541409] mb-1">
                  {new Date(selectedDateStr!).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h2>

                {selectedDayBlocked ? (
                  <>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg mb-4">
                      <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <span className="text-sm font-medium text-neutral-600">Blocked Day</span>
                    </div>
                    {selectedDayBlocked.reason && (
                      <div className="mb-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <p className="text-sm text-neutral-600">
                          <span className="font-medium">Reason:</span> {selectedDayBlocked.reason}
                        </p>
                      </div>
                    )}
                    <p className="text-neutral-500 text-sm py-4 text-center">
                      This day is blocked and no orders can be scheduled.
                    </p>
                    <Link
                      href="/admin/settings"
                      className="block text-center text-sm text-[#541409] hover:underline"
                    >
                      Manage blocked days in Settings →
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-[#541409]/60 mb-4">
                      {selectedDayPickups.length} pickup{selectedDayPickups.length !== 1 ? 's' : ''}, {selectedDayDeliveries.length} deliver{selectedDayDeliveries.length !== 1 ? 'ies' : 'y'}
                    </p>

                    {selectedDayOrders.length === 0 ? (
                      <p className="text-[#541409]/60 text-sm py-8 text-center">
                        No orders scheduled for this day.
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {/* Pickups Section */}
                        <div>
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#EAD6D6]">
                            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            <h3 className="font-semibold text-[#541409]">Pickups</h3>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              {selectedDayPickups.length}
                            </span>
                          </div>
                          {selectedDayPickups.length === 0 ? (
                            <p className="text-[#541409]/50 text-sm py-2 text-center">
                              No pickups
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {Object.entries(pickupsByTimeSlot)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([time, timeOrders]) => (
                                  <div key={time}>
                                    <h4 className="text-xs font-medium text-[#541409]/60 uppercase tracking-wide mb-2">
                                      {time === 'Unscheduled' ? time : formatTime(time)}
                                      <span className="ml-1 text-[#541409]/40">
                                        ({timeOrders.length}/{defaultCapacity})
                                      </span>
                                    </h4>
                                    <div className="space-y-2">
                                      {timeOrders.map((order) => (
                                        <Link
                                          key={order.id}
                                          href={`/admin/orders/${order.id}`}
                                          className="block p-3 rounded-lg border border-green-200 bg-green-50/50 hover:border-green-300 hover:bg-green-50 transition-colors"
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className={`
                                              px-2 py-0.5 text-xs font-medium rounded
                                              ${orderTypeColors[order.order_type] || 'bg-[#EAD6D6]'}
                                            `}>
                                              {orderTypeLabels[order.order_type]}
                                            </span>
                                            <span className={`
                                              px-2 py-0.5 text-xs rounded capitalize
                                              ${statusColors[order.status] || 'bg-[#EAD6D6]'}
                                            `}>
                                              {order.status.replace('_', ' ')}
                                            </span>
                                          </div>
                                          <div className="font-medium text-[#541409]">
                                            {order.customer_name}
                                          </div>
                                          <div className="text-sm text-[#541409]/60">
                                            {order.order_number}
                                          </div>
                                          {order.total_amount && (
                                            <div className="text-sm font-medium text-[#541409] mt-1">
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
                        </div>

                        {/* Deliveries Section */}
                        <div>
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#EAD6D6]">
                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                            <h3 className="font-semibold text-[#541409]">Deliveries</h3>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {selectedDayDeliveries.length}
                            </span>
                          </div>
                          {selectedDayDeliveries.length === 0 ? (
                            <p className="text-[#541409]/50 text-sm py-2 text-center">
                              No deliveries
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {Object.entries(deliveriesByTimeSlot)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([time, timeOrders]) => (
                                  <div key={time}>
                                    <h4 className="text-xs font-medium text-[#541409]/60 uppercase tracking-wide mb-2">
                                      {time === 'Unscheduled' ? time : formatTime(time)}
                                    </h4>
                                    <div className="space-y-2">
                                      {timeOrders.map((order) => (
                                        <Link
                                          key={order.id}
                                          href={`/admin/orders/${order.id}`}
                                          className="block p-3 rounded-lg border border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className={`
                                              px-2 py-0.5 text-xs font-medium rounded
                                              ${orderTypeColors[order.order_type] || 'bg-[#EAD6D6]'}
                                            `}>
                                              {orderTypeLabels[order.order_type]}
                                            </span>
                                            <span className={`
                                              px-2 py-0.5 text-xs rounded capitalize
                                              ${statusColors[order.status] || 'bg-[#EAD6D6]'}
                                            `}>
                                              {order.status.replace('_', ' ')}
                                            </span>
                                          </div>
                                          <div className="font-medium text-[#541409]">
                                            {order.customer_name}
                                          </div>
                                          <div className="text-sm text-[#541409]/60">
                                            {order.order_number}
                                          </div>
                                          {order.deliveryLocation && (
                                            <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                              </svg>
                                              {order.deliveryLocation}
                                            </div>
                                          )}
                                          {order.total_amount && (
                                            <div className="text-sm font-medium text-[#541409] mt-1">
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
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <svg className="w-12 h-12 text-[#EAD6D6] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-[#541409]/60 text-sm">
                  Click on a day to see pickups & deliveries
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* This Month's Orders */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {/* Pickups */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <h2 className="font-semibold text-[#541409]">This Month&apos;s Pickups</h2>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-auto">
              {pickupOrders.length}
            </span>
          </div>
          {pickupOrders.length === 0 ? (
            <p className="text-[#541409]/60 text-sm">No pickups scheduled this month.</p>
          ) : (
            <div className="divide-y divide-[#EAD6D6]">
              {pickupOrders.slice(0, 10).map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between py-3 hover:bg-green-50 -mx-2 px-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 text-xs font-medium rounded ${orderTypeColors[order.order_type] || 'bg-[#EAD6D6]'}`}>
                      {orderTypeLabels[order.order_type]}
                    </div>
                    <div>
                      <div className="font-medium text-[#541409] text-sm">{order.customer_name}</div>
                      <div className="text-xs text-[#541409]/60">{order.order_number}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[#541409] text-sm">
                      {new Date(order.pickup_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-[#541409]/60">{formatTime(order.pickup_time)}</div>
                  </div>
                </Link>
              ))}
              {pickupOrders.length > 10 && (
                <div className="pt-3 text-center">
                  <span className="text-sm text-[#541409]/60">
                    +{pickupOrders.length - 10} more pickups
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Deliveries */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            <h2 className="font-semibold text-[#541409]">This Month&apos;s Deliveries</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-auto">
              {deliveryOrders.length}
            </span>
          </div>
          {deliveryOrders.length === 0 ? (
            <p className="text-[#541409]/60 text-sm">No deliveries scheduled this month.</p>
          ) : (
            <div className="divide-y divide-[#EAD6D6]">
              {deliveryOrders.slice(0, 10).map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between py-3 hover:bg-blue-50 -mx-2 px-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 text-xs font-medium rounded ${orderTypeColors[order.order_type] || 'bg-[#EAD6D6]'}`}>
                      {orderTypeLabels[order.order_type]}
                    </div>
                    <div>
                      <div className="font-medium text-[#541409] text-sm">{order.customer_name}</div>
                      <div className="text-xs text-[#541409]/60">{order.order_number}</div>
                      {order.deliveryLocation && (
                        <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate max-w-[150px]">{order.deliveryLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[#541409] text-sm">
                      {new Date(order.pickup_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-[#541409]/60">{formatTime(order.pickup_time)}</div>
                  </div>
                </Link>
              ))}
              {deliveryOrders.length > 10 && (
                <div className="pt-3 text-center">
                  <span className="text-sm text-[#541409]/60">
                    +{deliveryOrders.length - 10} more deliveries
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
