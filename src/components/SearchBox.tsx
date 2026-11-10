'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { loadIndex, runSearch } from '@/lib/search';
import { imgUrl } from '@/lib/format';
import { waLink } from '@/data/site';
import type { SearchIndex } from '@/lib/types';
import { Icon } from './Icons';

export function SearchBox({
  query,
  setQuery,
  inputRef,
}: {
  query: string;
  setQuery: (q: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const router = useRouter();
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const q = query.trim();

  const ensureIndex = () => {
    if (index) return;
    loadIndex()
      .then((ix) => {
        setIndex(ix);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  };

  useEffect(() => {
    if (q) {
      ensureIndex();
      setOpen(true);
    } else {
      setOpen(false);
    }
    setActive(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const res = useMemo(() => (index && q ? runSearch(index, q, { products: 6, collections: 3 }) : null), [index, q]);
  const links = res ? [...res.collections.map((c) => `/collections/${c.h}/`), ...res.products.map((p) => `/products/${p.h}/`)] : [];

  const go = (href: string) => {
    setOpen(false);
    inputRef.current?.blur();
    router.push(href);
  };
  const submit = () => {
    if (!q) return;
    go(active >= 0 && links[active] ? links[active] : `/search/?q=${encodeURIComponent(q)}`);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && links.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % links.length);
    } else if (e.key === 'ArrowUp' && links.length) {
      e.preventDefault();
      setActive((a) => (a <= 0 ? links.length - 1 : a - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  const optionClass = (i: number) => (i === active ? 'bg-paper' : 'hover:bg-paper');
  const nCols = res?.collections.length ?? 0;

  return (
    <div ref={boxRef} className="relative">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="beam flex h-11 items-center gap-2 rounded-full border border-transparent bg-chip pl-4 pr-1.5 transition hover:bg-[#ebece8] focus-within:border-line focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(21,23,26,.06)] lg:h-10"
      >
        <Icon name="search" size={17} strokeWidth={2} className="shrink-0 text-muted" />
        <label htmlFor="site-search" className="sr-only">
          Search products
        </label>
        <input
          id="site-search"
          ref={inputRef}
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            ensureIndex();
            if (q) setOpen(true);
          }}
          onKeyDown={onKey}
          placeholder="Search products…"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `search-opt-${active}` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-[14.5px] text-ink outline-none placeholder:text-[#6b717c] [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <>
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:text-ink"
            >
              <Icon name="x" size={15} strokeWidth={2} />
            </button>
            <button type="submit" aria-label="Search" className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-white transition hover:brightness-115">
              <Icon name="arrow" size={14} strokeWidth={2.2} />
            </button>
          </>
        ) : (
          <kbd className="mr-1 hidden h-6 min-w-6 shrink-0 place-items-center rounded-md border border-line bg-white px-1.5 font-sans text-xs font-semibold text-muted lg:grid" aria-hidden="true">
            /
          </kbd>
        )}
      </form>

      {open && q && (
        <div
          id="search-results"
          role="listbox"
          aria-label="Search suggestions"
          className="anim-drop absolute inset-x-0 top-[calc(100%+10px)] lg:left-auto lg:w-[460px] z-50 flex max-h-[min(480px,70vh)] flex-col gap-1 overflow-y-auto rounded-[14px] border border-line bg-white p-2.5 shadow-[0_18px_40px_rgba(21,23,26,.14)]"
        >
          {!res && !failed && <p className="px-3 py-4 text-sm text-muted">Searching…</p>}
          {failed && <p className="px-3 py-4 text-sm text-muted">Search is unavailable right now — press Enter to see results.</p>}

          {res && nCols > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 border-b border-line-soft px-2 pb-1">
              <span className="eyebrow mr-1 text-muted">Categories</span>
              {res.collections.map((c, i) => (
                <Link
                  key={c.h}
                  id={`search-opt-${i}`}
                  role="option"
                  aria-selected={active === i}
                  href={`/collections/${c.h}/`}
                  onClick={() => setOpen(false)}
                  className="group flex min-h-11 items-center"
                >
                  <span
                    className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition ${
                      active === i ? 'border-ink text-ink' : 'border-line text-ink-2 group-hover:border-ink group-hover:text-ink'
                    }`}
                  >
                    {c.t}
                    <span className="font-medium text-muted">{c.n}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}

          {res && res.products.length > 0 && (
            <>
              <span className="eyebrow px-2 pb-0.5 pt-2 text-muted">Products</span>
              {res.products.map((p, j) => {
                const i = nCols + j;
                return (
                  <Link
                    key={p.h}
                    id={`search-opt-${i}`}
                    role="option"
                    aria-selected={active === i}
                    href={`/products/${p.h}/`}
                    onClick={() => setOpen(false)}
                    className={`nudge-host flex items-center gap-3 rounded-[10px] p-2 text-ink transition ${optionClass(i)}`}
                  >
                    <span className="grid size-[52px] shrink-0 place-items-center overflow-hidden rounded-lg border border-line-soft bg-white">
                      {p.i && <img src={imgUrl(p.i, 120)} alt="" className="size-11 object-contain" loading="lazy" />}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="line-clamp-1 text-[15px] font-semibold leading-snug">{p.n}</span>
                      <span className="line-clamp-1 text-[13px] text-muted">{[p.b, p.s].filter(Boolean).join(' · ')}</span>
                    </span>
                    <Icon name="arrow" size={16} strokeWidth={2} className="nudge shrink-0 text-accent" />
                  </Link>
                );
              })}
            </>
          )}

          {res && (res.products.length > 0 || nCols > 0) && (
            <Link
              href={`/search/?q=${encodeURIComponent(q)}`}
              onClick={() => setOpen(false)}
              className="nudge-host mt-1.5 flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-paper text-sm font-bold text-accent transition hover:bg-[#e9eae6]"
            >
              See all {res.total} results for “{q}”
              <Icon name="arrow" size={15} strokeWidth={2.2} className="nudge" />
            </Link>
          )}

          {res && res.products.length === 0 && nCols === 0 && (
            <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
              <span className="text-[15px] font-semibold">No products match “{q}”</span>
              <span className="text-sm leading-relaxed text-muted">Send us the product or model number and we’ll check availability.</span>
              <a
                href={waLink(`Hello Al Faiz, do you have: ${q}?`)}
                target="_blank"
                rel="noopener"
                className="mt-1 inline-flex h-11 items-center rounded-[10px] bg-accent px-4 text-sm font-bold text-white transition hover:brightness-115"
              >
                Ask on WhatsApp
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
