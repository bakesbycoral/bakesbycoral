import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = path.join('/');

  try {
    const { env } = getCloudflareContext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const envAny = env as any;

    if (!envAny?.UPLOADS) {
      return NextResponse.json({ error: 'Storage not available' }, { status: 503 });
    }

    const object = await envAny.UPLOADS.get(key);

    if (!object) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(object.body, { headers });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve image' }, { status: 500 });
  }
}
