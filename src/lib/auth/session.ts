// Session management using HMAC-signed tokens for edge runtime compatibility

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface SessionPayload {
  userId: string;
  tenantId: string;
  exp: number;
}

export interface SessionData {
  userId: string;
  tenantId: string;
}

// Create a signed session token
export async function createSession(
  userId: string,
  tenantId: string,
  secret: string
): Promise<string> {
  const payload: SessionPayload = {
    userId,
    tenantId,
    exp: Date.now() + SESSION_DURATION_MS,
  };

  const encoder = new TextEncoder();
  const data = JSON.stringify(payload);
  const base64Data = btoa(data);

  // Sign the token
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(base64Data)
  );

  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)));

  return `${base64Data}.${base64Signature}`;
}

// Verify and decode a session token
export async function verifySession(token: string, secret: string): Promise<SessionData | null> {
  try {
    const [base64Data, base64Signature] = token.split('.');
    if (!base64Data || !base64Signature) return null;

    const encoder = new TextEncoder();

    // Verify signature
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = Uint8Array.from(atob(base64Signature), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      encoder.encode(base64Data)
    );

    if (!isValid) return null;

    // Decode payload
    const data = atob(base64Data);
    const payload: SessionPayload = JSON.parse(data);

    // Check expiration
    if (payload.exp < Date.now()) return null;

    return {
      userId: payload.userId,
      tenantId: payload.tenantId || 'bakes-by-coral', // Fallback for old sessions
    };
  } catch {
    return null;
  }
}

// Update tenant in existing session (for tenant switching)
export async function updateSessionTenant(
  token: string,
  newTenantId: string,
  secret: string
): Promise<string | null> {
  const session = await verifySession(token, secret);
  if (!session) return null;

  return createSession(session.userId, newTenantId, secret);
}
