// Writes data/catalog.json (used to build every page) and public/search-index.json (used by search + chat).
import { mkdir, writeFile } from 'node:fs/promises';

export async function writeCatalog({ store, products, collections }) {
  await mkdir('data', { recursive: true });
  await mkdir('public', { recursive: true });
  await writeFile('data/catalog.json', JSON.stringify({ store, syncedAt: new Date().toISOString(), products, collections }));

  const thumb = (src) => (src ? src + (src.includes('?') ? '&' : '?') + 'width=120' : '');
  const index = {
    products: products.map((p) => ({
      h: p.handle,
      n: p.name,
      b: p.brand,
      s: p.subtitle,
      c: p.collections.join(' '),
      i: thumb(p.images[0]?.src),
      a: p.available ? 1 : 0,
      p: p.price,
    })),
    collections: collections.map((c) => ({ h: c.handle, t: c.title, k: c.kind, n: c.count })),
  };
  await writeFile('public/search-index.json', JSON.stringify(index));
}
