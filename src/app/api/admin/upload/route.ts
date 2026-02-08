import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-session';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'blog';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size: 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${session.tenantId}/${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    let url: string;

    try {
      // Try to use R2 in production
      const { env } = getCloudflareContext();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const envAny = env as any;

      if (envAny?.UPLOADS) {
        await envAny.UPLOADS.put(filename, buffer, {
          httpMetadata: {
            contentType: file.type,
          },
        });
        // Return the R2 public URL (you'll need to configure this based on your R2 setup)
        url = `/uploads/${filename}`;
      } else {
        throw new Error('R2 not available');
      }
    } catch {
      // Fallback to local storage for development
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', session.tenantId, folder);
      await mkdir(uploadDir, { recursive: true });

      const localFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filepath = path.join(uploadDir, localFilename);
      await writeFile(filepath, buffer);

      url = `/uploads/${session.tenantId}/${folder}/${localFilename}`;
    }

    return NextResponse.json({ url, filename });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
