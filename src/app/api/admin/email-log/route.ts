import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 50;
    const offset = (page - 1) * limit;
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    let whereClause = 'WHERE tenant_id = ?';
    const params: (string | number)[] = [session.tenantId];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (recipient LIKE ? OR subject LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await db.prepare(
      `SELECT COUNT(*) as total FROM email_log ${whereClause}`
    ).bind(...params).first<{ total: number }>();

    const logs = await db.prepare(
      `SELECT * FROM email_log ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...params, limit, offset).all<{
      id: number;
      recipient: string;
      subject: string;
      status: string;
      error: string | null;
      created_at: string;
    }>();

    return NextResponse.json({
      logs: logs.results,
      total: countResult?.total || 0,
      page,
      totalPages: Math.ceil((countResult?.total || 0) / limit),
    });
  } catch (error) {
    console.error('Email log error:', error);
    return NextResponse.json({ error: 'Failed to fetch email logs' }, { status: 500 });
  }
}
