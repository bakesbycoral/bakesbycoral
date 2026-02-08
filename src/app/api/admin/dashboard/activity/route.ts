import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

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
  created_at: string;
}

interface RecentPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface RecentCampaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  total_sent: number;
  sent_at: string | null;
  created_at: string;
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const tenantId = session.tenantId;

    // Get recent orders
    const recentOrders = await db.prepare(`
      SELECT id, order_number, order_type, status, customer_name, pickup_date, total_amount, created_at
      FROM orders
      WHERE tenant_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).bind(tenantId).all<RecentOrder>();

    // Get upcoming pickups
    const upcomingPickups = await db.prepare(`
      SELECT id, order_number, order_type, status, customer_name, pickup_date, total_amount, created_at
      FROM orders
      WHERE tenant_id = ? AND pickup_date >= date('now') AND status IN ('confirmed', 'deposit_paid')
      ORDER BY pickup_date ASC
      LIMIT 5
    `).bind(tenantId).all<RecentOrder>();

    // Get recent bookings
    const recentBookings = await db.prepare(`
      SELECT b.id, b.customer_name, b.customer_email, bt.name as booking_type_name,
             b.start_time, b.status, b.created_at
      FROM bookings b
      LEFT JOIN booking_types bt ON b.booking_type_id = bt.id
      WHERE b.tenant_id = ?
      ORDER BY b.created_at DESC
      LIMIT 5
    `).bind(tenantId).all<RecentBooking>();

    // Get upcoming bookings
    const upcomingBookings = await db.prepare(`
      SELECT b.id, b.customer_name, b.customer_email, bt.name as booking_type_name,
             b.start_time, b.status, b.created_at
      FROM bookings b
      LEFT JOIN booking_types bt ON b.booking_type_id = bt.id
      WHERE b.tenant_id = ? AND b.start_time >= datetime('now') AND b.status != 'cancelled'
      ORDER BY b.start_time ASC
      LIMIT 5
    `).bind(tenantId).all<RecentBooking>();

    // Get recent blog posts
    const recentPosts = await db.prepare(`
      SELECT id, title, slug, status, created_at, updated_at
      FROM blog_posts
      WHERE tenant_id = ?
      ORDER BY updated_at DESC
      LIMIT 5
    `).bind(tenantId).all<RecentPost>();

    // Get recent campaigns
    const recentCampaigns = await db.prepare(`
      SELECT id, name, subject, status, total_sent, sent_at, created_at
      FROM newsletter_campaigns
      WHERE tenant_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).bind(tenantId).all<RecentCampaign>();

    return NextResponse.json({
      recentOrders: recentOrders.results || [],
      upcomingPickups: upcomingPickups.results || [],
      recentBookings: recentBookings.results || [],
      upcomingBookings: upcomingBookings.results || [],
      recentPosts: recentPosts.results || [],
      recentCampaigns: recentCampaigns.results || [],
    });
  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
