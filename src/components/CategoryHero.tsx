'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Icon } from './Icons';

export type HeroCategory = {
  handle: string;
  title: string;
  note: string;
  count: number;
  image: string;
  picks: { href: string; name: string; brand: string; image: string }[];
};

const ROTATE_MS = 6500;
const d = (s: number) => ({ '--d': `${s}s` }) as CSSProperties;
const two = (n: number) => String(n).padStart(2, '0');

/**
 * Category-led hero: an index of the main categories on the left, a large stage for the
 * selected one on the right (photo, count, popular picks). Rotates every 6.5s while idle;
 * hovering or focusing the hero holds the current category.
 */
export function CategoryHero({ categories, total }: { categories: HeroCategory[]; total: number }) {
  const [index, setIndex] = useState(0);
  const [hold, setHold] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const n = categories.length;
  const cat = categories[index];

  useEffect(() => {
    if (hold || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % n), ROTATE_MS);
    return () => window.clearTimeout(t);
  }, [index, hold, n]);

  // keep the active chip in view on phones (horizontal rail only)
  useEffect(() => {
    const rail = railRef.current;
    const el = rail?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!rail || !el || rail.scrollWidth <= rail.clientWidth) return;
    rail.scrollTo({ left: el.offsetLeft - rail.clientWidth / 2 + el.offsetWidth / 2, behavior: 'smooth' });
  }, [index]);

  return (
    <section aria-label="Shop by category" className="pt-4 sm:pt-6">
      <div className="wrap">
        <div
          className="grid overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(21,23,26,.05),0_30px_60px_-40px_rgba(21,23,26,.4)] ring-1 ring-line-soft lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)]"
          onMouseEnter={() => setHold(true)}
          onMouseLeave={() => setHold(false)}
          onFocusCapture={() => setHold(true)}
          onBlurCapture={() => setHold(false)}
        >
          {/* Category index */}
          <div className="flex min-w-0 flex-col border-b border-line-soft lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between px-5 pb-1 pt-4 lg:px-6 lg:pb-3 lg:pt-6">
              <span className="eyebrow text-accent">Shop by category</span>
              <span className="text-[12px] font-semibold tabular-nums text-muted">
                {two(index + 1)} / {two(n)}
              </span>
            </div>
            <div
              ref={railRef}
              role="tablist"
              aria-label="Categories"
              className="flex gap-1.5 overflow-x-auto px-4 pb-3 pt-2 [scrollbar-width:none] lg:flex-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-3 lg:pb-3 lg:pt-0"
            >
              {categories.map((c, i) => {
                const on = i === index;
                return (
                  <button
                    key={c.handle}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setIndex(i)}
                    onMouseEnter={() => setIndex(i)}
                    className={`group/tab relative flex shrink-0 items-center gap-3 overflow-hidden rounded-full px-4 py-2 text-left transition-colors duration-300 lg:flex-1 lg:rounded-2xl lg:px-3 lg:py-0 ${
                      on ? 'bg-ink text-white' : 'bg-chip text-ink-2 hover:text-ink lg:bg-transparent'
                    }`}
                  >
                    <span className={`hidden w-6 text-[12px] font-semibold tabular-nums lg:block ${on ? 'text-white/55' : 'text-muted'}`}>{two(i + 1)}</span>
                    <span className={`flex-1 whitespace-nowrap text-[14px] lg:text-[15.5px] ${on ? 'font-semibold' : 'font-medium'}`}>{c.title}</span>
                    <span className={`hidden text-[12px] tabular-nums lg:block ${on ? 'text-white/70' : 'text-muted'}`}>{c.count}</span>
                    <Icon
                      name="arrow"
                      size={14}
                      strokeWidth={2.2}
                      className={`hidden transition duration-300 lg:block ${on ? 'translate-x-0 text-accent-bright opacity-100' : '-translate-x-2 opacity-0'}`}
                    />
                    {on && !hold && (
                      <span aria-hidden="true" key={`t-${index}`} className="be-timer absolute inset-x-0 bottom-0 h-[3px] origin-left bg-accent-bright" style={{ animationDuration: `${ROTATE_MS}ms` }} />
                    )}
                  </button>
                );
              })}
            </div>
            <Link
              href="/collections/all/"
              className="nudge-host hidden items-center justify-between border-t border-line-soft px-6 py-4 text-sm font-semibold text-ink transition hover:text-accent lg:flex"
            >
              All {total} products
              <Icon name="arrow" size={15} strokeWidth={2.2} className="nudge" />
            </Link>
          </div>

          {/* Stage */}
          <div className="footer-gradient-light relative isolate flex min-w-0 flex-col overflow-hidden">
            <span
              aria-hidden="true"
              key={`n-${cat.handle}`}
              className="be-mark pointer-events-none absolute -right-3 -top-8 -z-10 select-none text-[clamp(150px,22vw,300px)] font-extrabold leading-none tracking-[-0.06em] text-accent/[0.07]"
            >
              {two(index + 1)}
            </span>

            <div key={cat.handle} className="grid flex-1 items-center gap-2 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-6 lg:p-10">
              <div className="flex flex-col items-start gap-4 sm:gap-5">
                <span className="be-in inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[12.5px] font-semibold text-ink shadow-[0_1px_2px_rgba(21,23,26,.08)] ring-1 ring-line-soft" style={d(0.02)}>
                  <span className="size-1.5 rounded-full bg-accent" />
                  {cat.count} products in stock
                </span>
                <h2 className="be-in text-[clamp(38px,4.6vw,66px)] font-bold leading-[0.98] tracking-[-0.045em] text-ink" style={d(0.08)}>
                  {cat.title}
                </h2>
                <p className="be-in max-w-[380px] text-[16px] leading-relaxed text-ink-2 sm:text-[17px]" style={d(0.14)}>
                  {cat.note}
                </p>
                <span className="be-in flex flex-wrap gap-2" style={d(0.2)}>
                  <Link href={`/collections/${cat.handle}/`} className="pill pill-lg fx bg-accent text-white">
                    Shop {cat.title}
                    <span className="pill-dot bg-white text-accent">
                      <Icon name="arrow" size={15} strokeWidth={2.4} />
                    </span>
                  </Link>
                  <Link href="/collections/all/" className="pill pill-lg pill-outline bg-white lg:hidden">
                    All products
                  </Link>
                </span>
              </div>

              <Link
                href={`/collections/${cat.handle}/`}
                aria-label={`Shop ${cat.title}`}
                tabIndex={-1}
                className="group/img relative order-first flex h-[210px] items-center justify-center sm:h-[280px] lg:order-none lg:h-[340px]"
              >
                <span aria-hidden="true" className="absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-2xl" />
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="ch-img relative max-h-full max-w-full object-contain mix-blend-multiply transition duration-500 ease-out group-hover/img:scale-[1.05]"
                />
              </Link>
            </div>

            {/* Popular picks */}
            {cat.picks.length > 0 && (
              <div key={`p-${cat.handle}`} className="border-t border-ink/[0.07] bg-white/60 px-5 py-4 backdrop-blur-sm sm:px-8 lg:px-10">
                <div className="flex items-center gap-4">
                  <span className="hidden w-[92px] shrink-0 text-[11px] font-semibold uppercase leading-snug tracking-[0.16em] text-muted xl:block">
                    Popular in this category
                  </span>
                  <ul className="-mx-1 flex min-w-0 flex-1 gap-2.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] sm:gap-3">
                    {cat.picks.map((p, k) => (
                      <li key={p.href} className="be-in w-[230px] shrink-0 sm:w-auto sm:min-w-0 sm:flex-1" style={d(0.22 + k * 0.07)}>
                        <Link
                          href={p.href}
                          className="spot group/pick flex h-full items-center gap-3 rounded-2xl bg-white p-2 pr-3 ring-1 ring-line-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_26px_-16px_rgba(21,23,26,.4)] hover:ring-accent/40"
                        >
                          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-[#F4F4F1] p-1.5">
                            <img src={p.image} alt="" loading="lazy" className="max-h-full max-w-full object-contain mix-blend-multiply transition duration-300 group-hover/pick:scale-110" />
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">{p.brand}</span>
                            <span className="line-clamp-2 text-[13px] font-medium leading-snug text-ink">{p.name}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
