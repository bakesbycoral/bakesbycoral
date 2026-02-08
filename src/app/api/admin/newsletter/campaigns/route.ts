import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  subject: string;
  preview_text: string | null;
  from_name: string | null;
  from_email: string | null;
  reply_to: string | null;
  content: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  total_sent: number;
  created_at: string;
}

// GET all campaigns
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const results = await db.prepare(`
      SELECT * FROM newsletter_campaigns
      WHERE tenant_id = ?
      ORDER BY created_at DESC
    `).bind(session.tenantId).all<Campaign>();

    return NextResponse.json({ campaigns: results.results || [] });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

// POST create new campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      name?: string;
      subject?: string;
      preview_text?: string;
      from_name?: string;
      from_email?: string;
      reply_to?: string;
      content?: string;
      status?: string;
      scheduled_at?: string;
    };

    const { name, subject, preview_text, from_name, from_email, reply_to, content, status, scheduled_at } = body;

    if (!name || !subject || !content) {
      return NextResponse.json({ error: 'Name, subject, and content are required' }, { status: 400 });
    }

    const db = getDB();
    const id = `campaign_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await db.prepare(`
      INSERT INTO newsletter_campaigns (
        id, tenant_id, name, subject, preview_text, from_name, from_email, reply_to, content, status, scheduled_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      session.tenantId,
      name.trim(),
      subject.trim(),
      preview_text?.trim() || null,
      from_name?.trim() || null,
      from_email?.trim() || null,
      reply_to?.trim() || null,
      content,
      status || 'draft',
      scheduled_at || null
    ).run();

    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
