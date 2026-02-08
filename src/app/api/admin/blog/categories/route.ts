import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = session.tenantId;

    const db = getDB();
    const result = await db.prepare(`
      SELECT id, name, slug, description
      FROM blog_categories
      WHERE tenant_id = ?
      ORDER BY sort_order ASC, name ASC
    `).bind(tenantId).all();

    return NextResponse.json(result.results);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = session.tenantId;

    const { name, slug, description } = await request.json() as { name?: string; slug?: string; description?: string };

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const db = getDB();
    const id = crypto.randomUUID();

    await db.prepare(`
      INSERT INTO blog_categories (id, tenant_id, name, slug, description)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, tenantId, name, slug, description || null).run();

    return NextResponse.json({ id, name, slug });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
