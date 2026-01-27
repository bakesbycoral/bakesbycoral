


import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDB, getEnvVar } from '@/lib/db';
import { verifySession } from '@/lib/auth/session';

interface SettingsUpdateRequest {
  settings: Record<string, string>;
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();

    const userId = await verifySession(sessionToken, getEnvVar('bakesbycoral_session_secret'));
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    const user = await db.prepare('SELECT role FROM users WHERE id = ?')
      .bind(userId)
      .first<{ role: string }>();

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { settings }: SettingsUpdateRequest = await request.json();

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
    }

    // Update each setting
    const statements = Object.entries(settings).map(([key, value]) => {
      return db.prepare(`
        INSERT INTO settings (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `).bind(key, value);
    });

    // Execute all updates in a batch
    await db.batch(statements);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();

    const userId = await verifySession(sessionToken, getEnvVar('bakesbycoral_session_secret'));
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = await db.prepare(`
      SELECT key, value, description FROM settings
    `).all<{ key: string; value: string; description: string | null }>();

    const settings: Record<string, string> = {};
    for (const setting of results.results || []) {
      settings[setting.key] = setting.value;
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
