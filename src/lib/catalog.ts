// Server-side access to the synced Shopify catalog (data/catalog.json).
// Only import this from server components / route files — never from 'use client' files.
import raw from '../../data/catalog.json';
import type { Card, Collection, Facet, ListItem, Product } from './types';

type Catalog = { store: string; syncedAt: string; products: Product[]; collections: Collection[] };
const catalog = raw as unknown as Catalog;

export const products = catalog.products;
export const collections = catalog.collections;
export const syncedAt = catalog.syncedAt;

const productMap = new Map(products.map((p) => [p.handle, p]));
const collectionMap = new Map(collections.map((c) => [c.handle, c]));

export const getProduct = (handle: string) => productMap.get(handle);
export const getCollection = (handle: string) => collectionMap.get(handle);
export const countIn = (handle: string) => collectionMap.get(handle)?.count ?? 0;

export function productsIn(handle: string): Product[] {
  if (handle === 'all') return products;
  const c = collectionMap.get(handle);
  return c ? c.products.map((h) => productMap.get(h)).filter((p): p is Product => !!p) : [];
}

/** The most specific category a product sits in (smallest collection wins). */
export function primaryCategory(p: Product): Collection | undefined {
  return p.collections
    .map((h) => collectionMap.get(h))
    .filter((c): c is Collection => !!c && c.kind === 'category')
    .sort((a, b) => a.count - b.count)[0];
}

export function related(p: Product, n = 4): Product[] {
  const out: Product[] = [];
  const seen = new Set([p.handle]);
  const pools = [primaryCategory(p)?.handle, p.brandHandle, ...p.collections].filter((h): h is string => !!h);
  for (const h of pools) {
    for (const q of productsIn(h)) {
      if (out.length >= n) return out;
      if (!seen.has(q.handle)) {
        seen.add(q.handle);
        out.push(q);
      }
    }
  }
  return out;
}

export function toCard(p: Product, tag?: string): Card {
  return {
    handle: p.handle,
    name: p.name,
    subtitle: p.subtitle,
    brand: p.brand,
    image: p.images[0]?.src ?? '',
    available: p.available,
    price: p.price,
    ...(tag ? { tag } : {}),
  };
}

export function toListItem(p: Product): ListItem {
  return {
    ...toCard(p),
    brandHandle: p.brandHandle,
    cats: p.collections.filter((h) => collectionMap.get(h)?.kind === 'category'),
    updatedAt: p.updatedAt,
  };
}

/** Brand and category facets (with counts) for a set of products. */
export function facetsFor(list: Product[]): { brands: Facet[]; categories: Facet[] } {
  const brandCounts = new Map<string, number>();
  const catCounts = new Map<string, number>();
  for (const p of list) {
    if (p.brandHandle) brandCounts.set(p.brandHandle, (brandCounts.get(p.brandHandle) ?? 0) + 1);
    for (const h of p.collections) {
      if (collectionMap.get(h)?.kind === 'category') catCounts.set(h, (catCounts.get(h) ?? 0) + 1);
    }
  }
  const toFacets = (m: Map<string, number>) =>
    [...m.entries()]
      .map(([handle, count]) => ({ handle, title: collectionMap.get(handle)?.title ?? handle, count }))
      .sort((a, b) => b.count - a.count);
  return { brands: toFacets(brandCounts), categories: toFacets(catCounts) };
}

export function menuCollections() {
  const pick = (c: Collection) => ({ handle: c.handle, title: c.title, count: c.count });
  return {
    categories: collections.filter((c) => c.kind === 'category').sort((a, b) => b.count - a.count).map(pick),
    brands: collections.filter((c) => c.kind === 'brand').sort((a, b) => b.count - a.count).map(pick),
  };
}
