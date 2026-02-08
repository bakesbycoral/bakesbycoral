import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

interface Tenant {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  timezone: string;
  status: string;
}

interface TenantSetting {
  key: string;
  value: string;
}

// GET current tenant info
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const tenantId = session.tenantId;

    // Get tenant info
    const tenant = await db.prepare(`
      SELECT id, slug, name, domain, logo_url, primary_color, secondary_color, timezone, status
      FROM tenants WHERE id = ?
    `).bind(tenantId).first<Tenant>();

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get tenant settings
    const settingsResult = await db.prepare(`
      SELECT key, value FROM tenant_settings WHERE tenant_id = ?
    `).bind(tenantId).all<TenantSetting>();

    const settings: Record<string, string> = {};
    for (const s of settingsResult.results || []) {
      settings[s.key] = s.value;
    }

    // Also get global settings as fallback
    const globalResult = await db.prepare(`
      SELECT key, value FROM settings
    `).all<TenantSetting>();

    const globalSettings: Record<string, string> = {};
    for (const s of globalResult.results || []) {
      globalSettings[s.key] = s.value;
    }

    return NextResponse.json({
      tenant,
      settings: { ...globalSettings, ...settings },
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 });
  }
}

// PUT update tenant info
export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      tenant?: {
        name?: string;
        domain?: string;
        logo_url?: string;
        primary_color?: string;
        secondary_color?: string;
        timezone?: string;
      };
      settings?: Record<string, string>;
    };

    const db = getDB();
    const tenantId = session.tenantId;

    // Update tenant info if provided
    if (body.tenant) {
      const { name, domain, logo_url, primary_color, secondary_color, timezone } = body.tenant;
      await db.prepare(`
        UPDATE tenants SET
          name = COALESCE(?, name),
          domain = COALESCE(?, domain),
          logo_url = COALESCE(?, logo_url),
          primary_color = COALESCE(?, primary_color),
          secondary_color = COALESCE(?, secondary_color),
          timezone = COALESCE(?, timezone)
        WHERE id = ?
      `).bind(
        name || null,
        domain || null,
        logo_url || null,
        primary_color || null,
        secondary_color || null,
        timezone || null,
        tenantId
      ).run();
    }

    // Update settings if provided
    if (body.settings) {
      for (const [key, value] of Object.entries(body.settings)) {
        await db.prepare(`
          INSERT INTO tenant_settings (tenant_id, key, value, updated_at)
          VALUES (?, ?, ?, datetime('now'))
          ON CONFLICT(tenant_id, key) DO UPDATE SET value = ?, updated_at = datetime('now')
        `).bind(tenantId, key, value, value).run();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}
