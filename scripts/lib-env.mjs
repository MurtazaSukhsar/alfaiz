// Loads .env.local / .env into process.env for the Node scripts (Next.js does this itself for the app).
import { existsSync, readFileSync } from 'node:fs';

for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

export const supabase = {
  url: (process.env.SUPABASE_URL || '').replace(/\/$/, ''),
  key: process.env.SUPABASE_SECRET_KEY || '',
};
export const hasSupabase = !!(supabase.url && supabase.key);

/** Call the Supabase REST API with the secret key (server-side scripts only — never ship this key). */
export async function rest(path, init = {}) {
  const res = await fetch(`${supabase.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabase.key,
      Authorization: `Bearer ${supabase.key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Supabase ${init.method || 'GET'} ${path.split('?')[0]} → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
