import { getCloudflareContext } from '@opennextjs/cloudflare';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB per image

/**
 * Upload inspiration images to R2 storage.
 * Returns an array of URL paths that can be used to retrieve the images.
 */
export async function uploadInspirationImages(
  files: File[],
  orderType: string
): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    if (!file || file.size === 0) continue;
    if (!ALLOWED_TYPES.includes(file.type)) continue;
    if (file.size > MAX_SIZE) continue;

    try {
      const bytes = await file.arrayBuffer();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `inquiries/${orderType}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      try {
        const { env } = getCloudflareContext();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const envAny = env as any;

        if (envAny?.UPLOADS) {
          await envAny.UPLOADS.put(filename, bytes, {
            httpMetadata: {
              contentType: file.type,
            },
          });
          urls.push(`/api/uploads/${filename}`);
        }
      } catch {
        // R2 not available - skip upload silently
        // Images won't be stored in dev without R2
        console.warn('R2 not available for inspiration image upload');
      }
    } catch (err) {
      console.error('Failed to upload inspiration image:', err);
    }
  }

  return urls;
}
