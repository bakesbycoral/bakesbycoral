import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-session';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

// Magic byte signatures for allowed image types
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
};

function validateMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;
  return signatures.some(sig =>
    sig.every((byte, i) => buffer[i] === byte)
  );
}

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
      return NextResponse.json({ error: 'File too large. Maximum size: 20MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file content matches MIME type (magic byte check)
    if (!validateMagicBytes(new Uint8Array(bytes), file.type)) {
      return NextResponse.json({ error: 'File content does not match declared type' }, { status: 400 });
    }

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
