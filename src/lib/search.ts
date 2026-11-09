// Client-side search over public/search-index.json (written by `npm run sync`).
import type { SearchIndex } from './types';

let cache: Promise<SearchIndex> | null = null;

export function loadIndex(): Promise<SearchIndex> {
  if (!cache) {
    cache = fetch('/search-index.json')
      .then((r) => {
        if (!r.ok) throw new Error(`search index ${r.status}`);
        return r.json() as Promise<SearchIndex>;
      })
      .catch((e) => {
        cache = null;
        throw e;
      });
  }
  return cache;
}

const norm = (s: string) => s.toLowerCase().replace(/[-_/|,()]/g, ' ').replace(/\s+/g, ' ').trim();

export type SearchResult = {
  products: SearchIndex['products'];
  collections: SearchIndex['collections'];
  total: number;
};

export function runSearch(index: SearchIndex, query: string, limits?: { products: number; collections: number }): SearchResult {
  const terms = norm(query).split(' ').filter(Boolean);
  if (!terms.length) return { products: [], collections: [], total: 0 };

  const scored: { p: SearchIndex['products'][number]; s: number }[] = [];
  for (const p of index.products) {
    const name = norm(p.n);
    const brand = norm(p.b);
    const hay = `${name} ${brand} ${norm(p.s)} ${norm(p.c)}`;
    if (!terms.every((t) => hay.includes(t))) continue;
    let s = 0;
    for (const t of terms) {
      if (name.includes(t)) s += 2;
      if (brand && brand.startsWith(t)) s += 3;
      if (name.startsWith(t)) s += 1;
    }
    scored.push({ p, s });
  }
  scored.sort((a, b) => b.s - a.s);

  const collections = index.collections
    .filter((c) => terms.every((t) => norm(c.t).includes(t) || norm(c.h).includes(t)))
    .sort((a, b) => b.n - a.n);

  return {
    products: (limits ? scored.slice(0, limits.products) : scored).map((x) => x.p),
    collections: limits ? collections.slice(0, limits.collections) : collections,
    total: scored.length,
  };
}
