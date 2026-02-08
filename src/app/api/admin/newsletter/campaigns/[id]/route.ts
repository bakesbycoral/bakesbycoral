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
  completed_at: string | null;
  total_recipients: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_unsubscribed: number;
  created_at: string;
  updated_at: string;
}

// GET single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDB();

    const campaign = await db.prepare(`
      SELECT * FROM newsletter_campaigns
      WHERE id = ? AND tenant_id = ?
    `).bind(id, session.tenantId).first<Campaign>();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
}

// PUT update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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

    const db = getDB();

    // Check if campaign exists and can be edited
    const existing = await db.prepare(`
      SELECT id, status FROM newsletter_campaigns
      WHERE id = ? AND tenant_id = ?
    `).bind(id, session.tenantId).first<{ id: string; status: string }>();

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (existing.status === 'sent' || existing.status === 'sending') {
      return NextResponse.json({ error: 'Cannot edit a sent or sending campaign' }, { status: 400 });
    }

    await db.prepare(`
      UPDATE newsletter_campaigns SET
        name = ?,
        subject = ?,
        preview_text = ?,
        from_name = ?,
        from_email = ?,
        reply_to = ?,
        content = ?,
        status = ?,
        scheduled_at = ?,
        updated_at = datetime('now')
      WHERE id = ? AND tenant_id = ?
    `).bind(
      name?.trim(),
      subject?.trim(),
      preview_text?.trim() || null,
      from_name?.trim() || null,
      from_email?.trim() || null,
      reply_to?.trim() || null,
      content,
      status || 'draft',
      scheduled_at || null,
      id,
      session.tenantId
    ).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

// DELETE a campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDB();

    // Check if campaign exists and can be deleted
    const existing = await db.prepare(`
      SELECT id, status FROM newsletter_campaigns
      WHERE id = ? AND tenant_id = ?
    `).bind(id, session.tenantId).first<{ id: string; status: string }>();

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (existing.status === 'sending') {
      return NextResponse.json({ error: 'Cannot delete a campaign that is currently sending' }, { status: 400 });
    }

    // Delete send records first
    await db.prepare('DELETE FROM newsletter_sends WHERE campaign_id = ?').bind(id).run();

    // Delete the campaign
    await db.prepare('DELETE FROM newsletter_campaigns WHERE id = ? AND tenant_id = ?')
      .bind(id, session.tenantId)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
