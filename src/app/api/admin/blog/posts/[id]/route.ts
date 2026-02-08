import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

interface BlogPost {
  id: string;
  tenant_id: string;
  author_id: string | null;
  category_id: string | null;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  og_image: string | null;
  status: string;
  publish_at: string | null;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  views: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

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

    const post = await db.prepare(`
      SELECT
        p.*,
        c.name as category_name
      FROM blog_posts p
      LEFT JOIN blog_categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.tenant_id = ?
    `).bind(id, session.tenantId).first<BlogPost>();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get tags for this post
    const tagsResult = await db.prepare(`
      SELECT t.id, t.name, t.slug
      FROM blog_tags t
      JOIN blog_post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
    `).bind(id).all<Tag>();

    return NextResponse.json({
      ...post,
      tags: tagsResult.results || [],
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

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

    const db = getDB();

    // Check if post exists and belongs to tenant
    const existing = await db.prepare(`
      SELECT id, status, published_at FROM blog_posts
      WHERE id = ? AND tenant_id = ?
    `).bind(id, session.tenantId).first<{ id: string; status: string; published_at: string | null }>();

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Determine status and dates
    let finalStatus = status || existing.status;
    let publishedAt = existing.published_at;

    if (status === 'published' && !existing.published_at) {
      publishedAt = new Date().toISOString();
    } else if (status === 'scheduled' && publish_at) {
      finalStatus = 'scheduled';
    }

    await db.prepare(`
      UPDATE blog_posts SET
        title = ?,
        slug = ?,
        content = ?,
        excerpt = ?,
        category_id = ?,
        featured_image = ?,
        og_image = ?,
        status = ?,
        publish_at = ?,
        published_at = ?,
        meta_title = ?,
        meta_description = ?,
        updated_at = datetime('now')
      WHERE id = ? AND tenant_id = ?
    `).bind(
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
      meta_description || null,
      id,
      session.tenantId
    ).run();

    // Update tags - remove all existing and add new ones
    if (tags !== undefined) {
      await db.prepare('DELETE FROM blog_post_tags WHERE post_id = ?').bind(id).run();

      if (tags.length > 0) {
        for (const tagId of tags) {
          await db.prepare(`
            INSERT OR IGNORE INTO blog_post_tags (post_id, tag_id) VALUES (?, ?)
          `).bind(id, tagId).run();
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
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

    // Delete tag associations first
    await db.prepare('DELETE FROM blog_post_tags WHERE post_id = ?').bind(id).run();

    // Delete the post
    await db.prepare(`
      DELETE FROM blog_posts WHERE id = ? AND tenant_id = ?
    `).bind(id, session.tenantId).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
