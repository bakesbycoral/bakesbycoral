import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tenantId = 'bakes-by-coral';

    const db = getDB();

    let result;
    if (category && category !== 'all') {
      result = await db.prepare(`
        SELECT id, image_url, caption, category
        FROM gallery_images
        WHERE tenant_id = ? AND category = ?
        ORDER BY sort_order ASC, created_at DESC
      `).bind(tenantId, category).all();
    } else {
      result = await db.prepare(`
        SELECT id, image_url, caption, category
        FROM gallery_images
        WHERE tenant_id = ?
        ORDER BY sort_order ASC, created_at DESC
      `).bind(tenantId).all();
    }

    return NextResponse.json(result.results);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}
