// Pulls the live Shopify catalog (products, collections, which products sit in
// which collection) into data/catalog.json, and writes the small client-side
// search index to public/search-index.json.
//
//   npm run sync
//   STORE_URL=https://www.alfaizhardware.com npm run sync
//
// Imports from the old Shopify store. Products now live in Supabase: after this, run
// `npm run supabase:push` to upload them (see supabase/README.md).

import { writeCatalog } from './lib-catalog.mjs';
import sanitizeHtml from 'sanitize-html';

const STORE = (process.env.STORE_URL || 'https://www.alfaizhardware.com').replace(/\/$/, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Collections that are Shopify housekeeping, not real pages.
const HIDDEN = new Set(['frontpage', 'featured-products-home-page', 'featured-collection-product-page']);

// Brand collections -> display name. Order = priority when a product sits in two.
const BRANDS = {
  dewalt: 'DeWALT', makita: 'Makita', bosch: 'Bosch', milwaukee: 'Milwaukee', stanley: 'Stanley',
  'black-decker': 'Black+Decker', clarke: 'Clarke', abac: 'ABAC', shamal: 'Shamal', sumake: 'Sumake',
  'genius-tools': 'Genius', edon: 'Edon', selpro: 'Selpro', vaultex: 'Vaultex', force: 'Force', telwin: 'Telwin',
};

// Brands that appear in product titles but have no brand collection.
const TITLE_BRANDS = [
  'DeWALT', 'Makita', 'Bosch', 'Milwaukee', 'Stanley', 'Black+Decker', 'Black & Decker', 'Clarke', 'ABAC', 'Shamal',
  'Sumake', 'Genius', 'Edon', 'Selpro', 'Vaultex', 'Kiswel', 'IRWIN', '3M', 'AIRI', 'FIAC', 'Chicago Pneumatic',
  'Rotake', 'Eagle', 'Total', 'Ingco', 'Golden Bridge', 'Telwin', 'Force', 'Tolsen', 'Yato', 'Wadfow',
];

const TITLES = {
  'construction-tools': 'Construction Tools', 'wood-works': 'Wood Works', 'garage-tools-1': 'Automotive Garage Tools',
  'garage-tools': 'Garage Tools', 'non-sparking-tools': 'Non-Sparking Tools', fastners: 'Fasteners',
  'safety-products': 'Safety Products', 'packaging-and-sealing': 'Packaging & Sealing', 'air-compressors': 'Air Compressors',
  generator: 'Generators', 'adhesives-sealants': 'Adhesives & Sealants',
};

async function getJSON(path) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(STORE + path, { headers: { 'user-agent': 'alfaiz-site-sync/1.0', accept: 'application/json' } });
    if (res.ok) return res.json();
    if (attempt >= 4 || ![429, 500, 502, 503].includes(res.status)) throw new Error(`${path} -> HTTP ${res.status}`);
    await sleep(1500 * attempt);
  }
}

async function paged(path, key) {
  const all = [];
  for (let page = 1; ; page++) {
    const sep = path.includes('?') ? '&' : '?';
    const data = await getJSON(`${path}${sep}limit=250&page=${page}`);
    all.push(...data[key]);
    if (data[key].length < 250) return all;
    await sleep(250);
  }
}

const clean = (html) =>
  sanitizeHtml(html || '', {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'h5', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'span', 'blockquote', 'hr'],
    allowedAttributes: { a: ['href', 'title'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      h1: 'h2',
      a: (tag, attribs) => ({ tagName: 'a', attribs: { ...attribs, rel: 'noopener', target: attribs.href?.startsWith('/') ? undefined : '_blank' } }),
    },
    exclusiveFilter: (frame) => ['p', 'span', 'li', 'strong'].includes(frame.tag) && !frame.text.trim() && !frame.mediaChildren?.length,
  })
    .replace(/(<br\s*\/?>\s*){3,}/g, '<br><br>')
    .trim();

const plain = (html) =>
  sanitizeHtml(html || '', { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const titleCase = (s) => s.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase()).replace(/\bAnd\b/g, '&');

function shortName(title) {
  let n = title.split(/\s+\|\s+/)[0];
  n = n.replace(/\s+[–—-]\s+(al faiz.*|makita dealer.*|buy online.*|uae.*)$/i, '');
  n = n.replace(/\s+(in\s+)?(the\s+)?uae$/i, '').replace(/\s+[–—-]\s*$/, '').trim();
  return n;
}

function subtitle(title, type) {
  const parts = title.split(/\s+\|\s+/).slice(1).filter((p) => !/al faiz|uae\s*$|^uae/i.test(p));
  const s = parts[0] || type || '';
  return s.length > 90 ? s.slice(0, 88).replace(/\s+\S*$/, '') + '…' : s;
}

function brandFromTitle(title, vendor) {
  const t = title.toLowerCase();
  let best = null;
  for (const b of TITLE_BRANDS) {
    const i = t.indexOf(b.toLowerCase());
    if (i !== -1 && (best === null || i < best.i)) best = { b, i };
  }
  if (best) return best.b === 'Black & Decker' ? 'Black+Decker' : best.b;
  if (vendor && !/al ?faiz|makiita|my store/i.test(vendor)) return vendor.length <= 4 ? vendor : vendor.replace(/\b([A-Z])([A-Z]+)\b/g, (m, a, b) => a + b.toLowerCase());
  return '';
}

console.log(`Syncing ${STORE} …`);
const rawProducts = await paged('/products.json', 'products');
console.log(`  ${rawProducts.length} products`);
const rawCollections = (await getJSON('/collections.json?limit=250')).collections;

const membership = new Map(); // product handle -> collection handles
const collections = [];
for (const c of rawCollections) {
  if (HIDDEN.has(c.handle) || !c.products_count) continue;
  const items = await paged(`/collections/${c.handle}/products.json`, 'products');
  for (const p of items) {
    if (!membership.has(p.handle)) membership.set(p.handle, []);
    membership.get(p.handle).push(c.handle);
  }
  collections.push({
    handle: c.handle,
    title: BRANDS[c.handle] || TITLES[c.handle] || titleCase(c.title),
    kind: BRANDS[c.handle] ? 'brand' : 'category',
    count: items.length,
    image: c.image?.src || null,
    html: clean(c.body_html),
    products: items.map((p) => p.handle),
  });
  process.stdout.write(`  ${c.handle} (${items.length})\n`);
  await sleep(200);
}

const brandOrder = Object.keys(BRANDS);
const products = rawProducts.map((p) => {
  const cols = membership.get(p.handle) || [];
  const brandCol = brandOrder.find((h) => cols.includes(h));
  const prices = p.variants.map((v) => Number(v.price) || 0);
  const options = (p.options || []).filter((o) => !(o.values.length === 1 && /default title/i.test(o.values[0])));
  return {
    handle: p.handle,
    title: p.title,
    name: shortName(p.title),
    subtitle: subtitle(p.title, p.product_type),
    brand: brandCol ? BRANDS[brandCol] : brandFromTitle(p.title, p.vendor),
    brandHandle: brandCol || null,
    type: p.product_type || '',
    tags: p.tags || [],
    collections: cols,
    images: p.images.map((i) => ({ src: i.src, width: i.width, height: i.height, alt: i.alt || '' })),
    price: Math.min(...prices),
    available: p.variants.some((v) => v.available),
    options: options.map((o) => ({ name: o.name, values: o.values })),
    variants: p.variants.length > 1 ? p.variants.map((v) => ({ title: v.title, sku: v.sku || '', available: v.available })) : [],
    html: clean(p.body_html),
    summary: plain(p.body_html).slice(0, 300),
    updatedAt: p.updated_at,
  };
});

await writeCatalog({ store: STORE, products, collections });
console.log(`Done: ${products.length} products, ${collections.length} collections. Run \`npm run supabase:push\` to upload them to Supabase.`);
