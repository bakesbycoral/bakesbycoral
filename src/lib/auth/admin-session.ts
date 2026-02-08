import { cookies } from 'next/headers';
import { getDB, getEnvVar } from '@/lib/db';
import { verifySession, SessionData } from './session';

export interface AdminSession extends SessionData {
  email: string;
  role: string;
}

/**
 * Get the current admin session including tenant info.
 * Returns null if not authenticated.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return null;
    }

    const session = await verifySession(sessionToken, getEnvVar('bakesbycoral_session_secret'));
    if (!session) {
      return null;
    }

    const db = getDB();
    const user = await db.prepare(`
      SELECT id, email, role FROM users WHERE id = ?
    `).bind(session.userId).first<{ id: string; email: string; role: string }>();

    if (!user || user.role !== 'admin') {
      return null;
    }

    return {
      userId: session.userId,
      tenantId: session.tenantId,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

/**
 * Require admin session - returns session or throws unauthorized response.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}
