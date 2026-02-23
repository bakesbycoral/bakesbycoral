import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

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
      caption?: string;
      category?: string;
      sort_order?: number;
    };
    const { caption, category, sort_order } = body;

    const db = getDB();

    const existing = await db.prepare(`
      SELECT id FROM gallery_images WHERE id = ? AND tenant_id = ?
    `).bind(id, session.tenantId).first<{ id: string }>();

    if (!existing) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const validCategories = ['cakes', 'wedding-cakes', 'cookies', 'cookie-cups'];
    const finalCategory = category && validCategories.includes(category) ? category : undefined;

    await db.prepare(`
      UPDATE gallery_images SET
        caption = COALESCE(?, caption),
        category = COALESCE(?, category),
        sort_order = COALESCE(?, sort_order)
      WHERE id = ? AND tenant_id = ?
    `).bind(
      caption !== undefined ? caption : null,
      finalCategory || null,
      sort_order !== undefined ? sort_order : null,
      id,
      session.tenantId
    ).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating gallery image:', error);
    return NextResponse.json({ error: 'Failed to update gallery image' }, { status: 500 });
  }
}

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

    await db.prepare(`
      DELETE FROM gallery_images WHERE id = ? AND tenant_id = ?
    `).bind(id, session.tenantId).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json({ error: 'Failed to delete gallery image' }, { status: 500 });
  }
}
