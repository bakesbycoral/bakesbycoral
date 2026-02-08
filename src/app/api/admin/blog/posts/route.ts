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
      SELECT
        p.id, p.title, p.slug, p.excerpt, p.status, p.published_at, p.created_at,
        c.name as category_name
      FROM blog_posts p
      LEFT JOIN blog_categories c ON p.category_id = c.id
      WHERE p.tenant_id = ?
      ORDER BY p.created_at DESC
    `).bind(session.tenantId).all();

    return NextResponse.json(result.results);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      title?: string;
      slug?: string;
      content?: string;
      excerpt?: string;
      category_id?: string;
      featured_image?: string;
      og_image?: string;
      status?: string;
      publish_at?: string;
      meta_title?: string;
      meta_description?: string;
      tags?: string[];
    };
    const {
      title,
      slug,
      content,
      excerpt,
      category_id,
      featured_image,
      og_image,
      status,
      publish_at,
      meta_title,
      meta_description,
      tags,
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 });
    }

    const db = getDB();
    const id = crypto.randomUUID();

    // Determine status and dates
    let finalStatus = status || 'draft';
    let publishedAt: string | null = null;

    if (status === 'published') {
      publishedAt = new Date().toISOString();
    } else if (status === 'scheduled' && publish_at) {
      finalStatus = 'scheduled';
    }

    await db.prepare(`
      INSERT INTO blog_posts (
        id, tenant_id, author_id, title, slug, content, excerpt,
        category_id, featured_image, og_image, status, publish_at, published_at,
        meta_title, meta_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      session.tenantId,
      session.userId,
      title,
      slug,
      content,
      excerpt || null,
      category_id || null,
      featured_image || null,
      og_image || null,
      finalStatus,
      publish_at || null,
      publishedAt,
      meta_title || null,
      meta_description || null
    ).run();

    // Handle tags
    if (tags && tags.length > 0) {
      for (const tagId of tags) {
        await db.prepare(`
          INSERT OR IGNORE INTO blog_post_tags (post_id, tag_id) VALUES (?, ?)
        `).bind(id, tagId).run();
      }
    }

    return NextResponse.json({ id, slug });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
