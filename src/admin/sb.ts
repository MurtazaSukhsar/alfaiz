// Tiny Supabase client for the admin panel (sign-in, database, image uploads) — no extra npm package.
// Uses the public project URL + publishable key; what a signed-in user may change is enforced in the
// database by row level security (only emails listed in public.admins can write).

export const SB_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gwtpayzrhcgvdppmcixy.supabase.co').replace(/\/$/, '');
export const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_QDovLeWFBGCgD79cMhtQtw_H4EvkQx4';
export const BUCKET = 'product-images';

type Session = { access_token: string; refresh_token: string; expires_at: number; email: string };
const STORE = 'fz-admin-session';

function load(): Session | null {
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || 'null');
    return s && s.access_token ? s : null;
  } catch {
    return null;
  }
}
function save(s: Session | null) {
  try {
    if (s) localStorage.setItem(STORE, JSON.stringify(s));
    else localStorage.removeItem(STORE);
  } catch {
    /* private mode: session lasts until the tab closes */
  }
  memory = s;
}
let memory: Session | null = null;
const current = () => memory ?? (memory = typeof window === 'undefined' ? null : load());

async function authCall(path: string, body: unknown): Promise<Session> {
  const res = await fetch(`${SB_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: SB_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = j.error_description || j.msg || j.message || `Sign-in failed (${res.status})`;
    throw new Error(/invalid login/i.test(msg) ? 'Wrong email or password.' : msg);
  }
  const s: Session = {
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: j.expires_at || Math.floor(Date.now() / 1000) + (j.expires_in || 3600),
    email: j.user?.email || '',
  };
  save(s);
  return s;
}

export const auth = {
  email: () => current()?.email || '',
  signedIn: () => !!current(),
  signIn: (email: string, password: string) => authCall('token?grant_type=password', { email: email.trim(), password }),
  async signOut() {
    const s = current();
    save(null);
    try {
      Object.keys(localStorage).filter((k) => k.startsWith('fz-admin-cache')).forEach((k) => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    if (s) await fetch(`${SB_URL}/auth/v1/logout`, { method: 'POST', headers: { apikey: SB_KEY, Authorization: `Bearer ${s.access_token}` } }).catch(() => {});
  },
};

let refreshing: Promise<Session> | null = null;
async function token(): Promise<string> {
  const s = current();
  if (!s) throw new AuthError();
  if (s.expires_at - 60 > Date.now() / 1000) return s.access_token;
  refreshing ??= authCall('token?grant_type=refresh_token', { refresh_token: s.refresh_token }).finally(() => (refreshing = null));
  try {
    return (await refreshing).access_token;
  } catch {
    save(null);
    throw new AuthError();
  }
}

export class AuthError extends Error {
  constructor() {
    super('Your session has ended. Please sign in again.');
  }
}

/** Supabase REST call: db('products?select=*', { method: 'PATCH', body }) */
export async function db<T = unknown>(path: string, init: { method?: string; body?: unknown; headers?: Record<string, string> } = {}): Promise<T> {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: init.method || 'GET',
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${await token()}`,
      'Content-Type': 'application/json',
      ...(init.method && init.method !== 'GET' ? { Prefer: 'return=representation' } : {}),
      ...(init.headers || {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (res.status === 401) {
    save(null);
    throw new AuthError();
  }
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      const j = JSON.parse(text);
      msg = j.message || j.hint || text;
      if (j.code === '23505') msg = 'Something with this name / handle already exists.';
      if (j.code === '42501') msg = 'This account is not allowed to make changes.';
    } catch {
      /* plain text error */
    }
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return (text ? JSON.parse(text) : null) as T;
}

/** All rows of a table, 1000 at a time. */
export async function dbAll<T>(path: string): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const page = await db<T[]>(path, { headers: { Range: `${from}-${from + 999}` } });
    out.push(...page);
    if (page.length < 1000) return out;
  }
}

/** Number of rows a query matches (HEAD request — no rows are downloaded). */
export async function dbCount(path: string): Promise<number> {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: 'HEAD',
    headers: { apikey: SB_KEY, Authorization: `Bearer ${await token()}`, Prefer: 'count=exact' },
  });
  if (res.status === 401) {
    save(null);
    throw new AuthError();
  }
  if (!res.ok) throw new Error(`Count failed (${res.status})`);
  return Number((res.headers.get('content-range') || '').split('/')[1]) || 0;
}

export const isAdmin = () => db<boolean>('rpc/is_admin', { method: 'POST', body: {} });

/** Upload a file to the product-images bucket; returns its public URL. */
export async function uploadFile(path: string, file: Blob): Promise<string> {
  const clean = path.replace(/[^a-z0-9/._-]+/gi, '-').replace(/-+/g, '-').toLowerCase();
  const res = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${clean}`, {
    method: 'POST',
    headers: { apikey: SB_KEY, Authorization: `Bearer ${await token()}`, 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'true', 'cache-control': 'max-age=31536000' },
    body: file,
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.message || j.error || `Upload failed (${res.status})`);
  }
  return `${SB_URL}/storage/v1/object/public/${BUCKET}/${clean}`;
}

/** Shrink big photos before upload (max 1600px, WebP). Small files and SVGs are sent as they are. */
export async function prepareImage(file: File, max = 1600): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.size < 400_000) return file;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const out = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.86));
  return out && out.size < file.size ? out : file;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}
