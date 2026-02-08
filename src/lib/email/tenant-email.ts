import { getTenantSetting } from '@/lib/db/settings';
import { getEnvVar } from '@/lib/db';

export interface TenantEmailConfig {
  apiKey: string;
  fromAddress: string;
  fromName: string;
  replyTo: string;
}

export async function getTenantEmailConfig(tenantId: string): Promise<TenantEmailConfig> {
  const [apiKey, fromAddress, fromName, replyTo] = await Promise.all([
    getTenantSetting(tenantId, 'resend_api_key'),
    getTenantSetting(tenantId, 'email_from_address'),
    getTenantSetting(tenantId, 'email_from_name'),
    getTenantSetting(tenantId, 'email_reply_to'),
  ]);

  return {
    apiKey: apiKey || getEnvVar('bakesbycoral_resend_api_key'),
    fromAddress: fromAddress || 'onboarding@resend.dev',
    fromName: fromName || 'Newsletter',
    replyTo: replyTo || '',
  };
}

export function formatFromAddress(config: TenantEmailConfig): string {
  return `${config.fromName} <${config.fromAddress}>`;
}
