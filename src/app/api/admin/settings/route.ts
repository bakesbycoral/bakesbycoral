import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

interface SettingsUpdateRequest {
  settings: Record<string, string>;
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const { settings }: SettingsUpdateRequest = await request.json();

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
    }

    // Update each setting in tenant_settings table
    const statements = Object.entries(settings).map(([key, value]) => {
      return db.prepare(`
        INSERT INTO tenant_settings (tenant_id, key, value)
        VALUES (?, ?, ?)
        ON CONFLICT(tenant_id, key) DO UPDATE SET
          value = excluded.value
      `).bind(session.tenantId, key, value);
    });

    // Execute all updates in a batch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.batch(statements as any);

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
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();

    // Get tenant-specific settings first
    const tenantResults = await db.prepare(`
      SELECT key, value FROM tenant_settings WHERE tenant_id = ?
    `).bind(session.tenantId).all<{ key: string; value: string }>();

    // Get global settings as fallback
    const globalResults = await db.prepare(`
      SELECT key, value, description FROM settings
    `).all<{ key: string; value: string; description: string | null }>();

    // Merge with tenant settings taking precedence
    const settings: Record<string, string> = {};
    for (const setting of globalResults.results || []) {
      settings[setting.key] = setting.value;
    }
    for (const setting of tenantResults.results || []) {
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
