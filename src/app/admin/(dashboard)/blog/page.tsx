import Link from 'next/link';
import { cookies } from 'next/headers';
import { getDB, getEnvVar } from '@/lib/db';
import { verifySession } from '@/lib/auth/session';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  category_name: string | null;
  created_at: string;
}

async function getBlogPosts(tenantId: string): Promise<BlogPost[]> {
  const db = getDB();
  const result = await db.prepare(`
    SELECT
      p.id, p.title, p.slug, p.status, p.published_at, p.created_at,
      c.name as category_name
    FROM blog_posts p
    LEFT JOIN blog_categories c ON p.category_id = c.id
    WHERE p.tenant_id = ?
    ORDER BY p.created_at DESC
  `).bind(tenantId).all<BlogPost>();

  return result.results;
}

async function getTenantId(): Promise<string> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) return 'bakesbycoral';

  const session = await verifySession(sessionToken, getEnvVar('bakesbycoral_session_secret'));
  return session?.tenantId || 'bakesbycoral';
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  scheduled: 'bg-blue-100 text-blue-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function BlogPage() {
  const tenantId = await getTenantId();
  const posts = await getBlogPosts(tenantId);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-1">Manage your blog content</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first blog post.</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Post
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500">/{post.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.category_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[post.status] || statusColors.draft}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(post.published_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
