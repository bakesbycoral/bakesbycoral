


import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';

interface SetupRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password }: SetupRequest = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const db = getDB();

    // Check if any admin user already exists
    const existingAdmin = await db.prepare(
      `SELECT id FROM users WHERE role = 'admin' LIMIT 1`
    ).first();

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin user already exists. Use the login page.' },
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
