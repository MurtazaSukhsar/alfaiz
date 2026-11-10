'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { loadIndex, runSearch } from '@/lib/search';
import { waLink } from '@/data/site';
import type { Card, SearchIndex } from '@/lib/types';
import { Icon } from './Icons';
import { ProductCard } from './ProductCard';

const PAGE = 24;

export function SearchResults() {
  const q = (useSearchParams().get('q') || '').trim();
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [error, setError] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    loadIndex().then(setIndex).catch(() => setError(true));
  }, []);
  useEffect(() => setLimit(PAGE), [q]);

  const res = useMemo(() => (index && q ? runSearch(index, q) : null), [index, q]);
  const cards: Card[] = useMemo(
    () => (res ? res.products.map((p) => ({ handle: p.h, name: p.n, subtitle: p.s, brand: p.b, image: p.i, available: p.a !== 0, price: p.p ?? 0 })) : []),
    [res],
  );

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="wrap flex flex-col gap-3 pb-10 pt-8">
          <span className="eyebrow text-accent">Search</span>
          <h1 className="text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            {q ? <>Results for “{q}”</> : 'Search the catalog'}
          </h1>
          <p className="text-base text-muted" aria-live="polite">
            {!q
              ? 'Type a product name, brand or model number in the search bar above.'
              : error
                ? 'Search is unavailable right now. Please try again.'
                : !res
                  ? 'Searching…'
                  : res.total ? `Results for “${q}”` : `No products found for “${q}”`}
          </p>
          {res && res.collections.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {res.collections.slice(0, 6).map((c) => (
                <Link
                  key={c.h}
                  href={`/collections/${c.h}/`}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-ink-2 transition hover:border-ink hover:text-ink"
                >
                  {c.t}
                  <span className="font-medium text-muted">{c.n}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-10">
        <div className="wrap">
          {res && res.total === 0 && (
            <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
              <span className="text-lg font-semibold">No products match “{q}”</span>
              <span className="max-w-md text-[15px] leading-relaxed text-muted">
                We stock more than we list online. Send us the product or model number and we’ll check availability.
              </span>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                <a href={waLink(`Hello Al Faiz, do you have: ${q}?`)} target="_blank" rel="noopener" className="btn btn-sm btn-primary">
                  Ask on WhatsApp
                  <span className="btn-chev">
                    <Icon name="chev" size={14} strokeWidth={2.2} />
                  </span>
                </a>
                <Link href="/collections/all/" className="btn btn-sm btn-light">
                  Browse all products
                  <span className="btn-chev">
                    <Icon name="chev" size={14} strokeWidth={2.2} />
                  </span>
                </Link>
              </div>
            </div>
          )}
          {cards.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {cards.slice(0, limit).map((p, i) => (
                <ProductCard key={p.handle} p={p} eager={i < 8} />
              ))}
            </div>
          )}
          {cards.length > limit && (
            <div className="mt-8 flex justify-center">
              <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="btn btn-sm btn-light">
                Load more ({cards.length - limit} more)
                <span className="btn-chev">
                  <Icon name="chev-down" size={14} strokeWidth={2.2} />
                </span>
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
