// Downloads the catalogue from Supabase into data/catalog.json + public/search-index.json, and the
// home-page sections / site settings edited in the admin panel into data/content.json.
// Runs automatically before `npm run dev` and `npm run build`, so edits made in the admin show up on the site.
//
// Keeps Supabase egress (download traffic) low:
//   1. It first asks Supabase for a tiny fingerprint (row count + last edit time of products, collections and
//      site sections — a few hundred bytes). If nothing changed since the last download, nothing is downloaded.
//   2. Photos uploaded in the admin (Supabase Storage) are downloaded ONCE into public/media/ (and kept in
//      .next/cache/af-media, which Vercel keeps between builds). The website links to those copies, so
//      visitors never load images from Supabase.
//
//   npm run supabase:pull            download everything now (ignores the fingerprint)
//   SUPABASE_OFFLINE=1 npm run dev   don't contact Supabase at all (use the last downloaded files)
//
// If Supabase can't be reached, the last downloaded files are kept, so builds never break.

import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { hasSupabase, rest, supabase } from './lib-env.mjs';
import { writeCatalog } from './lib-catalog.mjs';
import { cleanHtml, plainText } from './lib-html.mjs';

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const OFFLINE = process.env.SUPABASE_OFFLINE === '1' || args.includes('--offline');
const FILES = { catalog: 'data/catalog.json', content: 'data/content.json', stamp: 'data/.supabase-stamp.json', media: 'data/media.json' };
const MEDIA_DIR = 'public/media';
const MEDIA_CACHE = '.next/cache/af-media';
const STORAGE = `${supabase.url}/storage/v1/object/public/`;
const FORMAT = 2; // bump when the way data is processed below changes, to force one fresh download

const readJson = async (f, d) => {
  try {
    return JSON.parse(await readFile(f, 'utf8'));
  } catch {
    return d;
  }
};
const kb = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/* ----------------------------------------------------------------- 1. fingerprint */

async function fingerprintOf(table) {
  const res = await fetch(`${supabase.url}/rest/v1/${table}?select=updated_at&order=updated_at.desc&limit=1`, {
    headers: { apikey: supabase.key, Authorization: `Bearer ${supabase.key}`, Prefer: 'count=exact' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${table} → ${res.status}`);
  const rows = await res.json();
  return `${(res.headers.get('content-range') || '').split('/')[1] || '?'}@${rows[0]?.updated_at || ''}`;
}
const fingerprint = async () => {
  const [p, c, s] = await Promise.all(['products', 'collections', 'site_content'].map(fingerprintOf));
  return { format: FORMAT, products: p, collections: c, content: s };
};

/* ----------------------------------------------------------------- 2. media copies */

/** Every Supabase Storage URL inside a value (deep). */
function findMedia(v, out = new Set()) {
  if (typeof v === 'string') {
    if (v.startsWith(STORAGE)) out.add(v);
  } else if (Array.isArray(v)) v.forEach((x) => findMedia(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => findMedia(x, out));
  return out;
}
const localUrl = (remote) => `/media/${decodeURIComponent(remote.slice(STORAGE.length).split('?')[0]).replace(/[^a-zA-Z0-9/._-]/g, '-')}`;

/** Make sure every file in the manifest exists in public/media. Returns how many bytes were downloaded. */
async function ensureMedia(manifest, allowDownload) {
  let bytes = 0;
  const failed = [];
  for (const [local, remote] of Object.entries(manifest)) {
    const rel = local.slice('/media/'.length);
    const target = `${MEDIA_DIR}/${rel}`;
    const cached = `${MEDIA_CACHE}/${rel}`;
    if (existsSync(target)) continue;
    await mkdir(dirname(target), { recursive: true });
    if (existsSync(cached)) {
      await copyFile(cached, target);
      continue;
    }
    if (!allowDownload) {
      failed.push(local);
      continue;
    }
    try {
      const res = await fetch(remote, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(String(res.status));
      const buf = Buffer.from(await res.arrayBuffer());
      bytes += buf.length;
      await mkdir(dirname(cached), { recursive: true });
      await writeFile(cached, buf);
      await writeFile(target, buf);
    } catch (e) {
      failed.push(local);
      console.warn(`⚠ Supabase: couldn't copy ${remote.split('/').pop()} (${e.message})`);
    }
  }
  return { bytes, failed };
}

/** Swap Supabase Storage URLs for the local /media/ copies (deep). */
function useLocal(v, map) {
  if (typeof v === 'string') return map[v] ?? v;
  if (Array.isArray(v)) return v.map((x) => useLocal(x, map));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, useLocal(x, map)]));
  return v;
}

/* ----------------------------------------------------------------- run */

const stamp = await readJson(FILES.stamp, null);
const haveFiles = existsSync(FILES.catalog) && existsSync(FILES.content);
if (!existsSync(FILES.content)) await writeFile(FILES.content, '{}');

let remote = null;
if (OFFLINE) console.log('• Supabase: offline mode — using the last downloaded data.');
else if (!hasSupabase) console.warn('⚠ Supabase: URL / key missing — using the last downloaded data.');
else {
  try {
    remote = await fingerprint();
  } catch (e) {
    console.warn(`⚠ Supabase: not reachable (${e.message}) — using the last downloaded data.`);
  }
}

const unchanged = remote && haveFiles && stamp && JSON.stringify(stamp.fingerprint) === JSON.stringify(remote);

if (!remote || (unchanged && !FORCE)) {
  if (!haveFiles) {
    console.error('✗ Supabase: no downloaded data yet and Supabase is not reachable.');
    process.exit(1);
  }
  const manifest = await readJson(FILES.media, {});
  const { bytes, failed } = await ensureMedia(manifest, !!remote);
  if (unchanged) console.log(`✓ Supabase: no changes since ${new Date(stamp.at).toLocaleString('en-GB')} — nothing downloaded${bytes ? ` (restored ${kb(bytes)} of photos)` : ''}.`);
  if (failed.length) console.warn(`⚠ Supabase: ${failed.length} uploaded photo(s) missing from public/media.`);
  process.exit(0);
}

async function all(table, select, order) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const page = await rest(`${table}?select=${select}&published=eq.true&order=${order}`, { headers: { Range: `${from}-${from + 999}` } });
    out.push(...page);
    if (page.length < 1000) return out;
  }
}

let rawCols;
let rawProducts;
let rawContent;
try {
  [rawCols, rawProducts, rawContent] = await Promise.all([
    all('collections', 'handle,title,kind,image,html,sort', 'sort.asc,title.asc'),
    all('products', 'handle,title,name,subtitle,brand,brand_handle,type,tags,collections,images,price,available,options,variants,html,summary,updated_at,featured,featured_rank,industries', 'sort.asc,created_at.asc'),
    rest('site_content?select=key,value'),
  ]);
} catch (e) {
  console.warn(`⚠ Supabase: download failed (${e.message.slice(0, 160)}) — using the last downloaded data.`);
  process.exit(haveFiles ? 0 : 1);
}
if (!rawProducts.length) {
  console.warn('⚠ Supabase: no published products yet (run `npm run supabase:push`) — using the last downloaded data.');
  process.exit(haveFiles ? 0 : 1);
}

const colByHandle = new Map(rawCols.map((c) => [c.handle, c]));
let products = rawProducts.map((p) => {
  const collections = (p.collections || []).filter((h) => colByHandle.has(h));
  const brandHandle = p.brand_handle && colByHandle.has(p.brand_handle) ? p.brand_handle : collections.find((h) => colByHandle.get(h).kind === 'brand') || null;
  const images = (Array.isArray(p.images) ? p.images : [])
    .map((i) => (typeof i === 'string' ? { src: i } : i))
    .filter((i) => i && i.src)
    .map((i) => ({ src: i.src, width: i.width || 1000, height: i.height || 1000, alt: i.alt || '' }));
  return {
    handle: p.handle,
    title: p.title || p.name,
    name: p.name || p.title,
    subtitle: p.subtitle || '',
    brand: p.brand || (brandHandle ? colByHandle.get(brandHandle).title : ''),
    brandHandle,
    type: p.type || '',
    tags: p.tags || [],
    collections,
    images,
    price: Number(p.price) || 0,
    available: p.available !== false,
    options: p.options || [],
    variants: p.variants || [],
    html: cleanHtml(p.html),
    summary: p.summary || plainText(p.html).slice(0, 300),
    updatedAt: p.updated_at,
    featured: !!p.featured,
    featuredRank: Number(p.featured_rank) || 0,
    industries: p.industries || [],
  };
});

let collections = rawCols
  .map((c) => {
    const items = products.filter((p) => p.collections.includes(c.handle)).map((p) => p.handle);
    return { handle: c.handle, title: c.title, kind: c.kind, count: items.length, image: c.image || null, html: cleanHtml(c.html), products: items };
  })
  .filter((c) => c.count > 0);

let content = Object.fromEntries((rawContent || []).map((r) => [r.key, r.value]));

// photos uploaded in the admin → local copies
const remoteMedia = findMedia([products.map((p) => p.images), collections.map((c) => c.image), content]);
const wanted = Object.fromEntries([...remoteMedia].map((r) => [localUrl(r), r]));
const { bytes, failed } = await ensureMedia(wanted, true);
const map = Object.fromEntries(Object.entries(wanted).filter(([l]) => !failed.includes(l)).map(([l, r]) => [r, l]));
products = useLocal(products, map);
collections = useLocal(collections, map);
content = useLocal(content, map);
await writeFile(FILES.media, JSON.stringify(Object.fromEntries(Object.entries(wanted).filter(([l]) => !failed.includes(l))), null, 1));

await writeFile(FILES.content, JSON.stringify(content, null, 1));
await writeCatalog({ store: supabase.url, products, collections });
await writeFile(FILES.stamp, JSON.stringify({ at: new Date().toISOString(), fingerprint: remote }, null, 1));

console.log(
  `✓ Supabase: ${products.length} products, ${collections.length} brands & categories, ${Object.keys(content).length} edited sections` +
    (remoteMedia.size ? ` · ${remoteMedia.size} uploaded photos kept in public/media${bytes ? ` (${kb(bytes)} new)` : ''}` : ''),
);
