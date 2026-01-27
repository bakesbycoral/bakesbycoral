import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDB, getEnvVar } from '@/lib/db';
import { verifySession } from '@/lib/auth/session';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

async function getUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const db = getDB();
    const userId = await verifySession(sessionToken, getEnvVar('bakesbycoral_session_secret'));

    if (!userId) {
      return null;
    }

    const user = await db.prepare(`
      SELECT id, email, role FROM users WHERE id = ?
    `).bind(userId).first<{ id: string; email: string; role: string }>();

    return user;
  } catch {
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-[#F7F3ED]">
      <AdminSidebar userEmail={user.email} />
      <main className="flex-1 p-8 ml-64">
        {children}
      </main>
    </div>
  );
}
