'use client';

import { useMemo, useState } from 'react';
import type { Facet, ListItem } from '@/lib/types';
import { waLink } from '@/data/site';
import { Icon } from './Icons';
import { ProductCard } from './ProductCard';

const PAGE = 24;

export function CollectionView({
  items,
  brandFacets,
  categoryFacets,
}: {
  items: ListItem[];
  brandFacets: Facet[];
  categoryFacets: Facet[];
}) {
  const [brands, setBrands] = useState<string[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('featured');
  const [inStock, setInStock] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [showFilters, setShowFilters] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void, h: string) => {
    set(list.includes(h) ? list.filter((x) => x !== h) : [...list, h]);
    setLimit(PAGE);
  };

  const filtered = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    let out = items.filter(
      (p) =>
        (!brands.length || (p.brandHandle !== null && brands.includes(p.brandHandle))) &&
        (!cats.length || p.cats.some((c) => cats.includes(c))) &&
        (!inStock || p.available) &&
        (!terms.length || terms.every((t) => `${p.name} ${p.brand} ${p.subtitle}`.toLowerCase().includes(t))),
    );
    if (sort === 'az') out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'za') out = [...out].sort((a, b) => b.name.localeCompare(a.name));
    if (sort === 'new') out = [...out].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return out;
  }, [items, brands, cats, q, sort, inStock]);

  const activeCount = brands.length + cats.length + (inStock ? 1 : 0);
  const clear = () => {
    setBrands([]);
    setCats([]);
    setInStock(false);
    setQ('');
    setLimit(PAGE);
  };
  const shown = filtered.slice(0, limit);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <aside id="filters" aria-label="Filters" className={`${showFilters ? 'block' : 'hidden'} lg:sticky lg:top-[140px] lg:block lg:w-[260px] lg:shrink-0`}>
        <div className="card flex flex-col p-5">
          {brandFacets.length > 1 && <FacetGroup title="Brand" facets={brandFacets} selected={brands} onToggle={(h) => toggle(brands, setBrands, h)} />}
          {categoryFacets.length > 1 && (
            <FacetGroup title="Category" facets={categoryFacets} selected={cats} onToggle={(h) => toggle(cats, setCats, h)} />
          )}
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px]">
            <input
              type="checkbox"
              checked={inStock}
              onChange={() => {
                setInStock((v) => !v);
                setLimit(PAGE);
              }}
              className="size-[18px] accent-ink"
            />
            In stock only
          </label>
          {activeCount > 0 && (
            <button type="button" onClick={clear} className="mt-2 h-11 rounded-[10px] border border-ink text-sm font-semibold transition hover:bg-ink hover:text-white">
              Clear filters ({activeCount})
            </button>
          )}
        </div>
        <div className="card mt-4 flex flex-col gap-2 p-5">
          <span className="text-base font-semibold">Can’t find a model?</span>
          <span className="text-sm leading-relaxed text-muted">Send the model number and we’ll check availability.</span>
          <a
            href={waLink('Hello Al Faiz, do you have this model? ')}
            target="_blank"
            rel="noopener"
            className="nudge-host inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-bold text-accent"
          >
            Ask on WhatsApp
            <Icon name="arrow" size={15} strokeWidth={2.2} className="nudge" />
          </a>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-line pb-4">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            aria-controls="filters"
            className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-line bg-white px-4 text-sm font-semibold lg:hidden"
          >
            <Icon name="filter" size={16} />
            Filters{activeCount ? ` (${activeCount})` : ''}
          </button>
          <div className="flex h-11 min-w-[200px] flex-1 items-center gap-2 rounded-[10px] border border-line bg-white px-3 focus-within:border-ink">
            <Icon name="search" size={16} className="shrink-0 text-muted" />
            <label htmlFor="within" className="sr-only">
              Search in this collection
            </label>
            <input
              id="within"
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(PAGE);
              }}
              placeholder="Search in this collection"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#6b717c]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-muted">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 rounded-[10px] border border-line bg-white px-3 text-sm text-ink"
            >
              <option value="featured">Featured</option>
              <option value="new">Recently updated</option>
              <option value="az">Name: A–Z</option>
              <option value="za">Name: Z–A</option>
            </select>
          </div>
          <p className="w-full text-sm text-muted" aria-live="polite">
            {filtered.length === items.length ? `${items.length} products` : `${filtered.length} of ${items.length} products`}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
            <span className="text-lg font-semibold">No products match these filters</span>
            <span className="text-[15px] text-muted">Clear a filter, or send us the model you need.</span>
            <button type="button" onClick={clear} className="mt-2 h-11 rounded-[10px] border border-ink px-5 text-sm font-semibold transition hover:bg-ink hover:text-white">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
            {shown.map((p, i) => (
              <ProductCard key={p.handle} p={p} eager={i < 6} />
            ))}
          </div>
        )}

        {filtered.length > limit && (
          <div className="mt-8 flex flex-col items-center gap-2">
            <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="btn btn-sm btn-light">
              Load more products
              <span className="btn-chev">
                <Icon name="chev-down" size={14} strokeWidth={2.2} />
              </span>
            </button>
            <span className="text-[13px] text-muted">
              Showing {shown.length} of {filtered.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function FacetGroup({ title, facets, selected, onToggle }: { title: string; facets: Facet[]; selected: string[]; onToggle: (h: string) => void }) {
  const [all, setAll] = useState(false);
  const list = all ? facets : facets.slice(0, 8);
  return (
    <fieldset className="mb-4 border-b border-line pb-4">
      <legend className="mb-2 text-base font-semibold">{title}</legend>
      {list.map((f) => (
        <label key={f.handle} className="flex min-h-10 cursor-pointer items-center justify-between gap-3 text-[15px]">
          <span className="flex items-center gap-2.5">
            <input type="checkbox" checked={selected.includes(f.handle)} onChange={() => onToggle(f.handle)} className="size-[18px] accent-ink" />
            {f.title}
          </span>
          <span className="text-[13px] text-muted">{f.count}</span>
        </label>
      ))}
      {facets.length > 8 && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-1 min-h-10 text-sm font-semibold text-accent">
          {all ? 'Show less' : `Show all ${facets.length}`}
        </button>
      )}
    </fieldset>
  );
}
