import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  industry: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

// GET all clients
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const db = getDB();

    let query = 'SELECT * FROM clients WHERE tenant_id = ?';
    const bindings: string[] = [session.tenantId];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
      const searchTerm = `%${search}%`;
      bindings.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY name ASC';

    const results = await db.prepare(query).bind(...bindings).all<Client>();

    return NextResponse.json({ clients: results.results || [] });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

// POST create new client
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      name?: string;
      email?: string;
      phone?: string;
      company?: string;
      industry?: string;
      notes?: string;
      status?: string;
    };

    const { name, email, phone, company, industry, notes, status } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const db = getDB();
    const id = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await db.prepare(`
      INSERT INTO clients (id, name, email, phone, company, industry, notes, status, tenant_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      name.trim(),
      email?.trim() || null,
      phone?.trim() || null,
      company?.trim() || null,
      industry?.trim() || null,
      notes?.trim() || null,
      status || 'active',
      session.tenantId
    ).run();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

// PATCH update client
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      id?: string;
      name?: string;
      email?: string;
      phone?: string;
      company?: string;
      industry?: string;
      notes?: string;
      status?: string;
    };

    const { id, name, email, phone, company, industry, notes, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const db = getDB();

    await db.prepare(`
      UPDATE clients
      SET name = ?, email = ?, phone = ?, company = ?, industry = ?, notes = ?, status = ?, updated_at = datetime('now')
      WHERE id = ? AND tenant_id = ?
    `).bind(
      name.trim(),
      email?.trim() || null,
      phone?.trim() || null,
      company?.trim() || null,
      industry?.trim() || null,
      notes?.trim() || null,
      status || 'active',
      id,
      session.tenantId
    ).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

// DELETE a client
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const db = getDB();
    await db.prepare('DELETE FROM clients WHERE id = ? AND tenant_id = ?')
      .bind(id, session.tenantId)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
