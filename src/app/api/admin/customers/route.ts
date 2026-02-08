import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

// GET all customers
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const db = getDB();

    let query = 'SELECT * FROM customers WHERE tenant_id = ?';
    const bindings: string[] = [session.tenantId];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      bindings.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY name ASC';

    const results = await db.prepare(query).bind(...bindings).all<Customer>();

    return NextResponse.json({ customers: results.results || [] });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST create new customer
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
      address?: string;
      notes?: string;
    };

    const { name, email, phone, address, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const db = getDB();
    const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await db.prepare(`
      INSERT INTO customers (id, name, email, phone, address, notes, tenant_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      name.trim(),
      email?.trim() || null,
      phone?.trim() || null,
      address?.trim() || null,
      notes?.trim() || null,
      session.tenantId
    ).run();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating customer:', error);
    if (String(error).includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'A customer with this email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

// PATCH update customer
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
      address?: string;
      notes?: string;
    };

    const { id, name, email, phone, address, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const db = getDB();

    await db.prepare(`
      UPDATE customers
      SET name = ?, email = ?, phone = ?, address = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ? AND tenant_id = ?
    `).bind(
      name.trim(),
      email?.trim() || null,
      phone?.trim() || null,
      address?.trim() || null,
      notes?.trim() || null,
      id,
      session.tenantId
    ).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating customer:', error);
    if (String(error).includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'A customer with this email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

// DELETE a customer
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const db = getDB();
    await db.prepare('DELETE FROM customers WHERE id = ? AND tenant_id = ?')
      .bind(id, session.tenantId)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
