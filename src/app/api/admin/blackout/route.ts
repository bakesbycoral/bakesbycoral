import { NextRequest, NextResponse } from 'next/server';
import { getBlackoutDates, addBlackoutDate, removeBlackoutDate } from '@/lib/db/blackout';
import { getAdminSession } from '@/lib/auth/admin-session';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blackoutDates = await getBlackoutDates(session.tenantId);
    return NextResponse.json({ blackoutDates });
  } catch (error) {
    console.error('Get blackout dates error:', error);
    return NextResponse.json(
      { error: 'Failed to get blackout dates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { date?: string; reason?: string };
    const { date, reason } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const blackoutDate = await addBlackoutDate(session.tenantId, date, reason);
    return NextResponse.json({ success: true, blackoutDate });
  } catch (error) {
    console.error('Add blackout date error:', error);
    return NextResponse.json(
      { error: 'Failed to add blackout date' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const removed = await removeBlackoutDate(session.tenantId, date);
    return NextResponse.json({ success: removed });
  } catch (error) {
    console.error('Remove blackout date error:', error);
    return NextResponse.json(
      { error: 'Failed to remove blackout date' },
      { status: 500 }
    );
  }
}
