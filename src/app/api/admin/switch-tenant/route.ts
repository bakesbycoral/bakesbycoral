import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDB, getEnvVar } from '@/lib/db';
import { verifySession, updateSessionTenant } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySession(sessionToken, getEnvVar('bakesbycoral_session_secret'));
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { tenantId } = await request.json() as { tenantId?: string };

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const db = getDB();

    // Verify user has access to this tenant
    const userTenant = await db.prepare(`
      SELECT ut.tenant_id, t.name
      FROM user_tenants ut
      JOIN tenants t ON t.id = ut.tenant_id
      WHERE ut.user_id = ? AND ut.tenant_id = ?
    `).bind(session.userId, tenantId).first<{ tenant_id: string; name: string }>();

    if (!userTenant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create new session with updated tenant
    const newSessionToken = await updateSessionTenant(
      sessionToken,
      tenantId,
      getEnvVar('bakesbycoral_session_secret')
    );

    if (!newSessionToken) {
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    // Set new session cookie
    const response = NextResponse.json({
      success: true,
      tenantId,
      tenantName: userTenant.name,
    });

    response.cookies.set('session', newSessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Switch tenant error:', error);
    return NextResponse.json(
      { error: 'Failed to switch tenant' },
      { status: 500 }
    );
  }
}
