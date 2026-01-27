


import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password }: LoginRequest = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = getDB();

    // Find admin user
    const user = await db.prepare(`
      SELECT id, email, password_hash, role
      FROM users
      WHERE email = ? AND role = 'admin'
    `).bind(email.toLowerCase()).first<{
      id: string;
      email: string;
      password_hash: string;
      role: string;
    }>();

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = await createSession(user.id, getEnvVar('bakesbycoral_session_secret'));

    // Update last login
    await db.prepare(`
      UPDATE users SET last_login_at = datetime('now') WHERE id = ?
    `).bind(user.id).run();

    // Set session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login. Please try again.' },
      { status: 500 }
    );
  }
}
