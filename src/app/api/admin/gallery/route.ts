import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const result = await db.prepare(`
      SELECT id, image_url, caption, category, sort_order, created_at
      FROM gallery_images
      WHERE tenant_id = ?
      ORDER BY sort_order ASC, created_at DESC
    `).bind(session.tenantId).all();

    return NextResponse.json(result.results);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      image_url?: string;
      caption?: string;
      category?: string;
    };
    const { image_url, caption, category } = body;

    if (!image_url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const validCategories = ['cakes', 'wedding-cakes', 'cookies', 'cookie-cups'];
    const finalCategory = category && validCategories.includes(category) ? category : 'cakes';

    const db = getDB();
    const id = crypto.randomUUID();

    await db.prepare(`
      INSERT INTO gallery_images (id, tenant_id, image_url, caption, category)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      id,
      session.tenantId,
      image_url,
      caption || null,
      finalCategory
    ).run();

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error creating gallery image:', error);
    return NextResponse.json({ error: 'Failed to create gallery image' }, { status: 500 });
  }
}
