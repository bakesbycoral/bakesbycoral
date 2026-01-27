import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBlackoutDates, addBlackoutDate, removeBlackoutDate } from '@/lib/db/blackout';

export async function GET() {
  try {
    // Check for admin auth
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blackoutDates = await getBlackoutDates();
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
    // Check for admin auth
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { date?: string; reason?: string };
    const { date, reason } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const blackoutDate = await addBlackoutDate(date, reason);
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
    // Check for admin auth
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const removed = await removeBlackoutDate(date);
    return NextResponse.json({ success: removed });
  } catch (error) {
    console.error('Remove blackout date error:', error);
    return NextResponse.json(
      { error: 'Failed to remove blackout date' },
      { status: 500 }
    );
  }
}
