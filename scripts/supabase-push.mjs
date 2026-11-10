// Uploads data/catalog.json (brands, categories, products) into Supabase.
// Existing rows with the same handle are updated, nothing is deleted.
//
//   npm run supabase:push
//
// Needs SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local, and the tables from supabase/schema.sql.

import { readFile } from 'node:fs/promises';
import { hasSupabase, rest } from './lib-env.mjs';

if (!hasSupabase) {
  console.error('Missing SUPABASE_URL / SUPABASE_SECRET_KEY in .env.local');
  process.exit(1);
}

const { products, collections } = JSON.parse(await readFile('data/catalog.json', 'utf8'));
const upsert = (table, rows) =>
  rest(`${table}?on_conflict=handle`, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) });

const cols = collections.map((c, i) => ({
  handle: c.handle,
  title: c.title,
  kind: c.kind === 'brand' ? 'brand' : 'category',
  image: c.image || null,
  html: c.html || '',
  sort: i,
  published: true,
}));
await upsert('collections', cols);
console.log(`  ${cols.length} brands & categories`);

const known = new Set(cols.map((c) => c.handle));
const rows = products.map((p, i) => ({
  handle: p.handle,
  title: p.title || p.name,
  name: p.name,
  subtitle: p.subtitle || '',
  brand: p.brand || '',
  brand_handle: p.brandHandle && known.has(p.brandHandle) ? p.brandHandle : null,
  type: p.type || '',
  tags: p.tags || [],
  collections: (p.collections || []).filter((h) => known.has(h)),
  images: p.images || [],
  price: p.price || 0,
  available: p.available !== false,
  options: p.options || [],
  variants: p.variants || [],
  html: p.html || '',
  summary: p.summary || '',
  sort: i,
  published: true,
}));
for (let i = 0; i < rows.length; i += 100) {
  await upsert('products', rows.slice(i, i + 100));
  process.stdout.write(`  ${Math.min(i + 100, rows.length)} / ${rows.length} products\r`);
}
console.log(`\nDone: uploaded ${rows.length} products and ${cols.length} brands & categories to Supabase.`);
