'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { site, waLink } from '@/data/site';
import { Icon } from './Icons';

export type HeroBrand = {
  brand: string;
  name: string;
  tagline: string;
  count: number;
  products: { href: string; label: string; name: string; image: string }[];
};

const ROTATE_MS = 5000;
const d = (s: number) => ({ '--d': `${s}s` }) as CSSProperties;

/** Product spots on the stage: one hero tool and two supporting ones. */
const SPOTS = [
  { box: 'left-[18%] top-[6%] h-[62%] w-[60%] sm:left-[20%]', label: 'left-1/2 -translate-x-1/2 -bottom-1' },
  { box: 'left-0 bottom-[2%] h-[38%] w-[38%]', label: 'left-2 -bottom-1' },
  { box: 'right-0 bottom-[8%] h-[40%] w-[36%]', label: 'right-2 -bottom-1' },
];

/**
 * Home hero: brand name and real products, quote first.
 * The headline cycles through the brands every 5s; each brand shows three of its tools and a
 * quote button that opens WhatsApp with that brand already written.
 */
export function BrandHero({ brands, total, brandTotal }: { brands: HeroBrand[]; total: number; brandTotal: number }) {
  const [index, setIndex] = useState(0);
  const [hold, setHold] = useState(false);
  const n = brands.length;
  const b = brands[index];

  useEffect(() => {
    if (hold || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % n), ROTATE_MS);
    return () => window.clearTimeout(t);
  }, [index, hold, n]);

  return (
    <section aria-labelledby="hero-title" className="pt-4 sm:pt-6">
      <div className="wrap">
        <div
          className="footer-gradient-light relative isolate grid overflow-hidden rounded-[28px] ring-1 ring-line-soft lg:min-h-[560px] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
          onTouchStart={() => setHold(true)}
          onTouchEnd={() => setHold(false)}
        >
          {/* faint brand name across the back */}
          <span
            aria-hidden="true"
            key={`mark-${b.brand}`}
            className="bh-mark pointer-events-none absolute -bottom-[0.18em] right-[-0.04em] -z-10 select-none whitespace-nowrap text-[clamp(120px,17vw,250px)] font-extrabold leading-none tracking-[-0.06em] text-accent/[0.06]"
          >
            {b.name}
          </span>

          {/* Words */}
          <div className="flex flex-col justify-center gap-6 p-6 pb-2 sm:p-10 sm:pb-4 lg:p-12 lg:pr-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-semibold text-ink shadow-[0_1px_2px_rgba(21,23,26,.06)] ring-1 ring-line-soft">
              <span className="size-1.5 rounded-full bg-accent" />
              Genuine brands · Quotes in minutes
            </span>

            <h2 id="hero-title" className="text-[clamp(40px,4.6vw,64px)] font-bold leading-[0.98] tracking-[-0.045em] text-ink">
              <span className="block">Genuine</span>
              <span className="relative block h-[1.02em] overflow-hidden">
                <span key={b.brand} className="bh-word absolute inset-x-0 top-0 block whitespace-nowrap text-accent">
                  {b.name}
                </span>
              </span>
              <span className="block">tools, quoted fast.</span>
            </h2>

            <p key={`t-${b.brand}`} className="be-in max-w-[440px] text-[16px] leading-relaxed text-ink-2 sm:text-[17px]" style={d(0.1)}>
              {b.tagline} Send us your list — we reply with price, stock and delivery.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <a
                href={waLink(`Hello Al Faiz, I would like a quote for ${b.name} tools:`)}
                target="_blank"
                rel="noopener"
                className="pill pill-lg fx footer-gradient text-white"
              >
                Get a {b.name} quote
                <span className="pill-dot bg-white text-accent">
                  <Icon name="arrow" size={15} strokeWidth={2.4} />
                </span>
              </a>
              <Link href={`/collections/${b.brand}/`} className="pill pill-lg pill-outline bg-white">
                See {b.count} {b.name} products
              </Link>
            </div>

            {/* brand index */}
            <div className="mt-2 flex flex-col gap-3 border-t border-ink/[0.08] pt-5">
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Brands">
                {brands.map((x, i) => {
                  const on = i === index;
                  return (
                    <li key={x.brand}>
                      <button
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-current={on || undefined}
                        className={`relative pb-1.5 text-[15px] transition-colors ${on ? 'font-semibold text-ink' : 'font-medium text-muted hover:text-ink'}`}
                      >
                        {x.name}
                        <span className={`absolute inset-x-0 bottom-0 h-[2px] overflow-hidden rounded-full ${on ? 'bg-accent/15' : ''}`}>
                          {on && !hold && <span key={`p-${index}`} className="be-timer absolute inset-0 origin-left bg-accent" style={{ animationDuration: `${ROTATE_MS}ms` }} />}
                          {on && hold && <span className="absolute inset-0 bg-accent" />}
                        </span>
                      </button>
                    </li>
                  );
                })}
                <li>
                  <Link href="/collections/all/" className="nudge-host inline-flex items-center gap-1 pb-1.5 text-[15px] font-medium text-accent">
                    +{Math.max(0, brandTotal - n)} more brands · {total} products
                    <Icon name="arrow" size={13} strokeWidth={2.4} className="nudge" />
                  </Link>
                </li>
              </ul>
              <a href={site.phoneHref} className="hidden w-fit items-center gap-2 sm:inline-flex text-[14px] font-semibold text-ink-2 hover:text-accent">
                <Icon name="phone" size={15} />
                {site.phone}
              </a>
            </div>
          </div>

          {/* Stage */}
          <div className="relative h-[330px] sm:h-[420px] lg:h-auto">
            <Link
              key={`logo-${b.brand}`}
              href={`/collections/${b.brand}/`}
              aria-label={`Shop ${b.name}`}
              className="bh-prod absolute left-5 top-4 z-20 flex h-16 items-center rounded-2xl bg-white px-5 shadow-[0_10px_30px_-14px_rgba(21,23,26,.35)] ring-1 ring-line-soft transition hover:-translate-y-0.5 sm:left-8 sm:top-8 sm:h-20 sm:px-6"
              style={d(0.05)}
            >
              <img src={`/brands/${b.brand}.png`} alt={`${b.name} logo`} className="h-9 w-auto max-w-[150px] object-contain sm:h-11 sm:max-w-[180px]" />
            </Link>
            <span
              key={`count-${b.brand}`}
              className="bh-prod absolute right-5 top-5 z-20 rounded-full bg-ink px-3 py-1.5 text-[12.5px] font-semibold text-white sm:right-8 sm:top-9"
              style={d(0.12)}
            >
              {b.count} products
            </span>

            <div className="absolute inset-x-4 bottom-4 top-20 sm:inset-x-8 sm:bottom-8 sm:top-28">
              {b.products.slice(0, 3).map((p, k) => (
                <Link key={`${b.brand}-${p.href}`} href={p.href} className={`group absolute ${SPOTS[k].box}`}>
                  {/* the photo blends into the panel (white background disappears) */}
                  <span className="bh-prod absolute inset-0 block mix-blend-multiply" style={d(0.1 + k * 0.12)}>
                    <span aria-hidden="true" className="absolute inset-x-[14%] bottom-[5%] h-[10%] rounded-[50%] bg-ink/15 blur-xl" />
                    <img
                      src={p.image}
                      alt={p.name}
                      className="bh-float relative h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.05]"
                      style={{ animationDelay: `${k * -1.6}s` }}
                    />
                  </span>
                  <span
                    className={`bh-prod absolute ${SPOTS[k].label} inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-[12.5px] font-semibold text-ink shadow-[0_8px_20px_-10px_rgba(21,23,26,.4)] ring-1 ring-line-soft transition-colors group-hover:bg-accent group-hover:text-white group-hover:ring-accent`}
                    style={d(0.25 + k * 0.12)}
                  >
                    {p.label}
                    <Icon name="arrow" size={12} strokeWidth={2.4} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
