import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

interface Tag {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
}

// GET all tags
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const results = await db.prepare(`
      SELECT * FROM blog_tags
      WHERE tenant_id = ?
      ORDER BY name ASC
    `).bind(session.tenantId).all<Tag>();

    return NextResponse.json({ tags: results.results || [] });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// POST create new tag
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { name?: string };
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const db = getDB();

    // Check if tag already exists
    const existing = await db.prepare(`
      SELECT id FROM blog_tags WHERE tenant_id = ? AND slug = ?
    `).bind(session.tenantId, slug).first<{ id: string }>();

    if (existing) {
      return NextResponse.json({ id: existing.id, slug, name: name.trim() });
    }

    const id = `tag_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await db.prepare(`
      INSERT INTO blog_tags (id, tenant_id, name, slug)
      VALUES (?, ?, ?, ?)
    `).bind(id, session.tenantId, name.trim(), slug).run();

    return NextResponse.json({ id, slug, name: name.trim() });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}

// DELETE a tag
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 });
    }

    const db = getDB();

    // Delete tag associations first
    await db.prepare('DELETE FROM blog_post_tags WHERE tag_id = ?').bind(id).run();

    // Delete the tag
    await db.prepare('DELETE FROM blog_tags WHERE id = ? AND tenant_id = ?')
      .bind(id, session.tenantId)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
