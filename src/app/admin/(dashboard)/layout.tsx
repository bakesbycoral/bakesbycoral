import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDB, getEnvVar } from '@/lib/db';
import { verifySession } from '@/lib/auth/session';
import { AdminSidebar, MobileMenuProvider, MobileMenuButton } from '@/components/admin/AdminSidebar';

interface Tenant {
  id: string;
  slug: string;
  name: string;
  primary_color: string;
  secondary_color: string;
}

interface UserWithTenants {
  id: string;
  email: string;
  role: string;
  currentTenantId: string;
  currentTenant: Tenant;
  tenants: Tenant[];
}

async function getUserWithTenants(): Promise<UserWithTenants | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const db = getDB();
    const session = await verifySession(sessionToken, getEnvVar('bakesbycoral_session_secret'));

    if (!session) {
      return null;
    }

    const user = await db.prepare(`
      SELECT id, email, role FROM users WHERE id = ?
    `).bind(session.userId).first<{ id: string; email: string; role: string }>();

    if (!user) {
      return null;
    }

    // Get all tenants this user has access to
    const userTenants = await db.prepare(`
      SELECT t.id, t.slug, t.name, t.primary_color, t.secondary_color
      FROM tenants t
      JOIN user_tenants ut ON t.id = ut.tenant_id
      WHERE ut.user_id = ?
      ORDER BY ut.is_default DESC, t.name ASC
    `).bind(session.userId).all<Tenant>();

    // If user has no tenant associations, give them access to bakes-by-coral for backwards compatibility
    let tenants = userTenants.results;
    if (tenants.length === 0) {
      const defaultTenant = await db.prepare(`
        SELECT id, slug, name, primary_color, secondary_color
        FROM tenants WHERE id = 'bakes-by-coral'
      `).first<Tenant>();
      if (defaultTenant) {
        tenants = [defaultTenant];
      }
    }

    // Get current tenant from session
    let currentTenant = tenants.find(t => t.id === session.tenantId);
    if (!currentTenant && tenants.length > 0) {
      currentTenant = tenants[0];
    }

    if (!currentTenant) {
      return null;
    }

    return {
      ...user,
      currentTenantId: session.tenantId,
      currentTenant,
      tenants,
    };
  } catch {
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserWithTenants();

  console.log('=== DEBUG: User with tenants ===');
  console.log('User:', user?.email);
  console.log('Current tenant:', user?.currentTenant?.name);
  console.log('All tenants:', user?.tenants?.map(t => t.name));
  console.log('Tenant count:', user?.tenants?.length);

  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  // Determine if this is a dark theme tenant
  const isDarkTheme = user.currentTenant.id === 'leango';
  const bgColor = isDarkTheme ? 'bg-gray-900' : 'bg-[#F7F3ED]';
  const textColor = isDarkTheme ? 'text-white' : 'text-gray-900';

  return (
    <MobileMenuProvider>
      <div className={`flex min-h-screen ${bgColor} ${textColor}`} data-theme={isDarkTheme ? 'dark' : 'light'}>
        <MobileMenuButton
          primaryColor={user.currentTenant.primary_color}
          secondaryColor={user.currentTenant.secondary_color}
        />
        <AdminSidebar
          userEmail={user.email}
          currentTenant={user.currentTenant}
          tenants={user.tenants}
        />
        <main className="flex-1 p-4 pt-16 md:p-8 md:ml-64">
          {children}
        </main>
      </div>
    </MobileMenuProvider>
  );
}
