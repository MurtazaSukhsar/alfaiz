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

// The project URL and publishable key are public (they are also used by the admin panel in the browser).
// With only these, the scripts can READ published data — enough for `npm run dev` / `npm run build`
// on any machine or on Vercel. Writing (supabase:push) needs SUPABASE_SECRET_KEY in .env.local.
export const PUBLIC_SUPABASE_URL = 'https://gwtpayzrhcgvdppmcixy.supabase.co';
export const PUBLIC_SUPABASE_KEY = 'sb_publishable_QDovLeWFBGCgD79cMhtQtw_H4EvkQx4';

const secret = process.env.SUPABASE_SECRET_KEY || '';
export const supabase = {
  url: (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || PUBLIC_SUPABASE_URL).replace(/\/$/, ''),
  key: secret || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || PUBLIC_SUPABASE_KEY,
};
export const hasSupabase = !!(supabase.url && supabase.key);
/** true when the secret key is set (needed to write with supabase:push) */
export const hasSecret = !!secret;

/** Call the Supabase REST API (secret key when set, otherwise the public read-only key). Scripts only. */
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
