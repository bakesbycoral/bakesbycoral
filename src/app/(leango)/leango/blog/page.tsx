import Link from 'next/link';
import { ContentHero, Section, SectionHeader } from '@/components/leango';
import { getDB } from '@/lib/db';

export const metadata = {
  title: 'Blog',
  description: 'Insights on lean methodology, continuous improvement, and operational excellence.',
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string;
  category_name: string | null;
  author_email: string | null;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const db = getDB();
    const result = await db.prepare(`
      SELECT
        p.id, p.title, p.slug, p.excerpt, p.featured_image, p.published_at,
        c.name as category_name,
        u.email as author_email
      FROM blog_posts p
      LEFT JOIN blog_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.tenant_id = 'leango'
        AND p.status = 'published'
        AND (p.published_at IS NULL OR p.published_at <= datetime('now'))
      ORDER BY p.published_at DESC
      LIMIT 20
    `).all<BlogPost>();

    return result.results;
  } catch {
    return [];
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

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      {/* Hero */}
      <ContentHero
        label="Blog"
        title="Insights & Resources"
        description="Practical advice on lean methodology, continuous improvement, and building high-performing operations."
        variant="dark"
      />

      {/* Blog Posts */}
      <Section background="darker">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <SectionHeader
              title="Coming Soon"
              description="We're working on great content. Check back soon!"
              centered
              dark
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/leango/blog/${post.slug}`}
                className="group"
              >
                <article className="h-full bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden hover:border-[#00a1f1]/50 transition-all">
                  {/* Image */}
                  <div className="aspect-[16/9] bg-gray-800">
                    {post.featured_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {post.category_name && (
                      <span className="text-xs font-semibold text-[#00a1f1] uppercase tracking-wider">
                        {post.category_name}
                      </span>
                    )}
                    <h2 className="mt-2 text-xl font-semibold text-white group-hover:text-[#00a1f1] transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-3 text-gray-400 text-sm line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-4 text-sm text-gray-500">
                      {post.published_at && formatDate(post.published_at)}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
