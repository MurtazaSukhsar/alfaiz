'use client';
// Shared admin data: product list (light), brands & categories, and the edited site sections.
// Loaded once after sign-in and refreshed after saves, so pickers and lists stay in sync.

import { useSyncExternalStore } from 'react';
import { AuthError, SB_URL, db, dbAll, dbCount } from './sb';
import type { ContentKey } from '@/data/content';

export type Img = { src: string; alt?: string; width?: number; height?: number };
export type ProductRow = {
  handle: string;
  title: string;
  name: string;
  subtitle: string;
  brand: string;
  brand_handle: string | null;
  type: string;
  tags: string[];
  collections: string[];
  images: Img[];
  price: number;
  available: boolean;
  html: string;
  summary: string;
  sort: number;
  published: boolean;
  featured: boolean;
  featured_rank: number;
  industries: string[];
  updated_at: string;
};
export type ProductLite = Pick<ProductRow, 'handle' | 'name' | 'brand' | 'brand_handle' | 'collections' | 'images' | 'published' | 'available' | 'featured' | 'featured_rank' | 'industries' | 'updated_at'>;
export type CollectionRow = { handle: string; title: string; kind: 'brand' | 'category'; image: string | null; html: string; sort: number; published: boolean; updated_at: string };

type State = {
  ready: boolean;
  products: ProductLite[];
  collections: CollectionRow[];
  content: Partial<Record<ContentKey, unknown>>;
  contentUpdated: Partial<Record<ContentKey, string>>;
  /** private admin settings (deploy hook, last publish time) */
  admin: AdminSettings;
  error: string;
};
export type AdminSettings = { vercel_deploy_hook?: string; last_publish?: string };

let state: State = { ready: false, products: [], collections: [], content: {}, contentUpdated: {}, admin: {}, error: '' };
const subs = new Set<() => void>();
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  subs.forEach((f) => f());
};

export const useStore = () =>
  useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => state,
    () => state,
  );

const LITE = 'handle,name,brand,brand_handle,collections,images,published,available,featured,featured_rank,industries,updated_at';

/*
 * Product + category lists are kept in this browser (localStorage) between visits. On the next visit only rows
 * edited since then are downloaded (plus a row count to notice deletions), which keeps Supabase egress tiny.
 */
type Cached<T> = { rows: T[]; at: string };
const cacheKey = (name: string) => `fz-admin-cache:${SB_URL}:${name}:v1`;
const readCache = <T,>(name: string): Cached<T> | null => {
  try {
    const c = JSON.parse(localStorage.getItem(cacheKey(name)) || 'null');
    return c && Array.isArray(c.rows) ? c : null;
  } catch {
    return null;
  }
};
const writeCache = <T extends { updated_at: string }>(name: string, rows: T[]) => {
  try {
    const at = rows.reduce((m, r) => (r.updated_at > m ? r.updated_at : m), '');
    localStorage.setItem(cacheKey(name), JSON.stringify({ rows, at }));
  } catch {
    /* storage full or blocked: works without the cache */
  }
};

async function syncTable<T extends { handle: string; updated_at: string }>(name: string, select: string, order: string, sort: (a: T, b: T) => number, full = false): Promise<T[]> {
  const cached = full ? null : readCache<T>(name);
  if (cached?.at) {
    try {
      const [changed, count] = await Promise.all([
        dbAll<T>(`${name}?select=${select}&updated_at=gt.${encodeURIComponent(cached.at)}&order=${order}`),
        dbCount(`${name}?select=handle`),
      ]);
      const byHandle = new Map(cached.rows.map((r) => [r.handle, r]));
      for (const r of changed) byHandle.set(r.handle, r);
      const rows = [...byHandle.values()];
      if (rows.length === count) {
        rows.sort(sort);
        if (changed.length) writeCache(name, rows);
        return rows;
      }
      // something was deleted (or added elsewhere) → fall through to a full download
    } catch (e) {
      if (e instanceof AuthError) throw e;
    }
  }
  const rows = await dbAll<T>(`${name}?select=${select}&order=${order}`);
  writeCache(name, rows);
  return rows;
}

export async function loadProducts(full = false) {
  const products = await syncTable<ProductLite>('products', LITE, 'name.asc', (a, b) => a.name.localeCompare(b.name), full);
  set({ products });
}
export async function loadCollections(full = false) {
  const collections = await syncTable<CollectionRow>('collections', 'handle,title,kind,image,html,sort,published,updated_at', 'sort.asc,title.asc', (a, b) => a.sort - b.sort || a.title.localeCompare(b.title), full);
  set({ collections });
}
/** Throw away the browser copy and download everything again. */
export async function reloadEverything() {
  await Promise.all([loadProducts(true), loadCollections(true), loadContent(), loadAdmin()]);
}
export async function loadContent() {
  const rows = await db<{ key: ContentKey; value: unknown; updated_at: string }[]>('site_content?select=key,value,updated_at');
  set({
    content: Object.fromEntries(rows.map((r) => [r.key, r.value])),
    contentUpdated: Object.fromEntries(rows.map((r) => [r.key, r.updated_at])),
  });
}
export async function loadAdmin() {
  const rows = await db<{ key: string; value: string }[]>('admin_settings?select=key,value');
  set({ admin: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
}
export async function saveAdmin(key: keyof AdminSettings, value: string) {
  await db('admin_settings?on_conflict=key', { method: 'POST', body: { key, value }, headers: { Prefer: 'resolution=merge-duplicates,return=minimal' } });
  set({ admin: { ...state.admin, [key]: value } });
}
export async function loadAll() {
  try {
    await Promise.all([loadProducts(), loadCollections(), loadContent(), loadAdmin()]);
    set({ ready: true, error: '' });
  } catch (e) {
    set({ error: (e as Error).message });
    throw e;
  }
}

export async function saveContent(key: ContentKey, value: unknown) {
  const rows = await db<{ key: ContentKey; value: unknown; updated_at: string }[]>('site_content?on_conflict=key', {
    method: 'POST',
    body: { key, value },
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
  });
  const r = rows[0];
  set({ content: { ...state.content, [key]: r.value }, contentUpdated: { ...state.contentUpdated, [key]: r.updated_at } });
}
export async function resetContent(key: ContentKey) {
  await db(`site_content?key=eq.${encodeURIComponent(key)}`, { method: 'DELETE' });
  const content = { ...state.content };
  const contentUpdated = { ...state.contentUpdated };
  delete content[key];
  delete contentUpdated[key];
  set({ content, contentUpdated });
}

/** Keep the light product list in step after one product was saved / deleted. */
export function patchProduct(p: ProductLite | null, removedHandle?: string) {
  let products = state.products.filter((x) => x.handle !== (removedHandle ?? p?.handle));
  if (p) products = [...products, p].sort((a, b) => a.name.localeCompare(b.name));
  set({ products });
  writeCache('products', products);
}
export function patchCollection(c: CollectionRow | null, removedHandle?: string) {
  let collections = state.collections.filter((x) => x.handle !== (removedHandle ?? c?.handle));
  if (c) collections = [...collections, c].sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title));
  set({ collections });
  writeCache('collections', collections);
}

export const getState = () => state;
export const firstImage = (p?: { images?: Img[] } | null) => (p?.images?.[0] ? (typeof p.images[0] === 'string' ? (p.images[0] as unknown as string) : p.images[0].src) : '');
