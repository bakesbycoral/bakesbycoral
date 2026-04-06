import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';
import {
  getCurrentDateInTimeZone,
  getCurrentDateTimeInTimeZone,
  getCurrentMonthStartUtcSqlite,
  getDateDaysFromNowInTimeZone,
  toSqliteUtcString,
} from '@/lib/dates';

interface OrderStats {
  pending: number;
  confirmed: number;
  completed: number;
  inquiries: number;
  revenue: number;
}

interface BookingStats {
  upcoming: number;
  today: number;
  thisWeek: number;
  pending: number;
}

interface BlogStats {
  total: number;
  published: number;
  drafts: number;
  totalViews: number;
}

interface NewsletterStats {
  subscribers: number;
  activeSubscribers: number;
  campaigns: number;
  sentThisMonth: number;
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const tenantId = session.tenantId;
    const thirtyDaysAgoUtcSqlite = toSqliteUtcString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const todayDate = getCurrentDateInTimeZone();
    const tomorrowDate = getDateDaysFromNowInTimeZone(1);
    const nowBusinessDateTime = getCurrentDateTimeInTimeZone();
    const nextWeekBusinessDateTime = getCurrentDateTimeInTimeZone(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const monthStartUtcSqlite = getCurrentMonthStartUtcSqlite();

    // Get order stats (for bakery tenants)
    const orderStats = await db.prepare(`
      SELECT
        SUM(CASE WHEN status IN ('pending_payment', 'deposit_paid') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'inquiry' THEN 1 ELSE 0 END) as inquiries,
        SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_amount ELSE 0 END) as revenue
      FROM orders
      WHERE tenant_id = ? AND created_at >= ?
    `).bind(tenantId, thirtyDaysAgoUtcSqlite).first<OrderStats>();

    // Get booking stats (for consulting tenants)
    const bookingStats = await db.prepare(`
      SELECT
        SUM(CASE WHEN start_time >= ? THEN 1 ELSE 0 END) as upcoming,
        SUM(CASE WHEN start_time >= ? AND start_time < ? THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN start_time >= ? AND start_time <= ? THEN 1 ELSE 0 END) as thisWeek,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM bookings
      WHERE tenant_id = ?
    `).bind(nowBusinessDateTime, `${todayDate}T00:00:00`, `${tomorrowDate}T00:00:00`, nowBusinessDateTime, nextWeekBusinessDateTime, tenantId).first<BookingStats>();

    // Get blog stats
    const blogStats = await db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
        0 as totalViews
      FROM blog_posts
      WHERE tenant_id = ?
    `).bind(tenantId).first<BlogStats>();

    // Get newsletter stats
    const newsletterStats = await db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM newsletter_subscribers WHERE tenant_id = ?) as subscribers,
        (SELECT COUNT(*) FROM newsletter_subscribers WHERE tenant_id = ? AND status = 'subscribed') as activeSubscribers,
        (SELECT COUNT(*) FROM newsletter_campaigns WHERE tenant_id = ?) as campaigns,
        (SELECT COUNT(*) FROM newsletter_campaigns WHERE tenant_id = ? AND sent_at >= ?) as sentThisMonth
    `).bind(tenantId, tenantId, tenantId, tenantId, monthStartUtcSqlite).first<NewsletterStats>();

    return NextResponse.json({
      tenantId,
      orders: orderStats || { pending: 0, confirmed: 0, completed: 0, inquiries: 0, revenue: 0 },
      bookings: bookingStats || { upcoming: 0, today: 0, thisWeek: 0, pending: 0 },
      blog: blogStats || { total: 0, published: 0, drafts: 0, totalViews: 0 },
      newsletter: newsletterStats || { subscribers: 0, activeSubscribers: 0, campaigns: 0, sentThisMonth: 0 },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
