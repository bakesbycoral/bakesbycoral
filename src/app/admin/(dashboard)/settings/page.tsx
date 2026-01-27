import { getDB, getEnvVar } from '@/lib/db';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { BlockedDates } from '@/components/admin/BlockedDates';

interface Setting {
  key: string;
  value: string;
  description: string | null;
}

async function getSettings(): Promise<Record<string, string>> {
  const db = getDB();

  const results = await db.prepare(`
    SELECT key, value FROM settings
  `).all<Setting>();

  const settings: Record<string, string> = {};
  for (const setting of results.results || []) {
    settings[setting.key] = setting.value;
  }

  return settings;
}

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#541409] mb-8">Settings</h1>

      {/* Blocked Days - at the top for easy access */}
      <div className="mb-8">
        <BlockedDates />
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
