// Downloads the catalogue from Supabase into data/catalog.json + public/search-index.json.
// Runs automatically before `npm run dev` and `npm run build`, so edits made in Supabase show up on the site.
// If Supabase isn't configured or can't be reached, the last downloaded catalogue is kept.
//
//   npm run supabase:pull

import { existsSync } from 'node:fs';
import { hasSupabase, rest, supabase } from './lib-env.mjs';
import { writeCatalog } from './lib-catalog.mjs';

const keep = (why) => {
  console.warn(`⚠ Supabase: ${why} — using the existing data/catalog.json.`);
  if (!existsSync('data/catalog.json')) process.exit(1);
  process.exit(0);
};
if (!hasSupabase) keep('SUPABASE_URL / SUPABASE_SECRET_KEY not set in .env.local');

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
try {
  [rawCols, rawProducts] = await Promise.all([
    all('collections', 'handle,title,kind,image,html,sort', 'sort.asc,title.asc'),
    all('products', '*', 'sort.asc,created_at.asc'),
  ]);
} catch (e) {
  keep(e.message);
}
if (!rawProducts.length) keep('no published products in the products table yet (run `npm run supabase:push`)');

const colByHandle = new Map(rawCols.map((c) => [c.handle, c]));
const products = rawProducts.map((p) => {
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
    html: p.html || '',
    summary: p.summary || (p.html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300),
    updatedAt: p.updated_at,
  };
});

const collections = rawCols
  .map((c) => {
    const items = products.filter((p) => p.collections.includes(c.handle)).map((p) => p.handle);
    return { handle: c.handle, title: c.title, kind: c.kind, count: items.length, image: c.image || null, html: c.html || '', products: items };
  })
  .filter((c) => c.count > 0);

await writeCatalog({ store: supabase.url, products, collections });
console.log(`✓ Supabase: ${products.length} products, ${collections.length} brands & categories`);
