import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Section } from '@/components/leango';
import { getDB } from '@/lib/db';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string;
  meta_title: string | null;
  meta_description: string | null;
  category_name: string | null;
  author_email: string | null;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const db = getDB();
    const result = await db.prepare(`
      SELECT
        p.id, p.title, p.slug, p.content, p.excerpt, p.featured_image,
        p.published_at, p.meta_title, p.meta_description,
        c.name as category_name,
        u.email as author_email
      FROM blog_posts p
      LEFT JOIN blog_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.tenant_id = 'leango'
        AND p.slug = ?
        AND p.status = 'published'
        AND (p.published_at IS NULL OR p.published_at <= datetime('now'))
    `).bind(slug).first<BlogPost>();

    return result || null;
  } catch {
    return null;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      {/* Header */}
      <section className="relative bg-gray-950 pt-32 pb-12 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#00a1f1]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#66d200]/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/leango/blog"
            className="inline-flex items-center gap-2 text-[#00a1f1] hover:text-[#00a1f1]/80 text-sm font-medium mb-8"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>

          {post.category_name && (
            <span className="inline-block text-xs font-semibold text-[#00a1f1] uppercase tracking-wider mb-4">
              {post.category_name}
            </span>
          )}

          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            {post.title}
          </h1>

          <div className="mt-6 flex items-center gap-4 text-gray-400">
            {post.published_at && (
              <span>{formatDate(post.published_at)}</span>
            )}
            {post.author_email && (
              <>
                <span>&bull;</span>
                <span>{post.author_email}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="bg-gray-900 pb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <Section background="darker">
        <article
          className="max-w-3xl mx-auto prose prose-lg prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-[#00a1f1] prose-strong:text-white prose-code:text-[#00a1f1]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </Section>

      {/* Back to Blog */}
      <Section background="dark">
        <div className="text-center">
          <Link
            href="/leango/blog"
            className="inline-flex items-center gap-2 text-[#00a1f1] hover:text-[#00a1f1]/80 font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all posts
          </Link>
        </div>
      </Section>
    </>
  );
}
