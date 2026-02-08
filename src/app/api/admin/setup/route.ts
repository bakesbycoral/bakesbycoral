


import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

interface SetupRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 'setup', RATE_LIMITS.setup);
    if (rateLimitResponse) return rateLimitResponse;

    const { email, password }: SetupRequest = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 12) {
      return NextResponse.json(
        { error: 'Password must be at least 12 characters' },
        { status: 400 }
      );
    }

    // Require at least one uppercase, one lowercase, and one number
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain uppercase, lowercase, and a number' },
        { status: 400 }
      );
    }

    const db = getDB();

    // Check if any admin user already exists - return same generic error
    // to avoid leaking whether an admin exists
    const existingAdmin = await db.prepare(
      `SELECT id FROM users WHERE role = 'admin' LIMIT 1`
    ).first();

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Setup is not available' },
        { status: 403 }
      );
    }

    // Create the admin user
    const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const passwordHash = await hashPassword(password);

    await db.prepare(`
      INSERT INTO users (id, email, password_hash, role, created_at)
      VALUES (?, ?, ?, 'admin', datetime('now'))
    `).bind(userId, email, passwordHash).run();

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}
