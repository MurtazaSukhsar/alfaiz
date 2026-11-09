'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Icon } from './Icons';

export type HeroSlide = {
  brand: string;
  name: string;
  tagline: string;
  count: number;
  bg: string;
  accent: string;
  onAccent: string;
  products: { name: string; label: string; image: string }[];
};

const DURATION = 5500;

/** Brand slider: each slide shows a brand's tools; the whole slide opens that brand's products. */
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false); // reduced motion: no autoplay
  const swipe = useRef<{ x: number; moved: boolean } | null>(null);
  const n = slides.length;
  const go = (i: number) => setIndex(((i % n) + n) % n);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    const vis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', vis);
    return () => {
      mq.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);

  return (
    <section aria-roledescription="carousel" aria-label="Featured brands" className="pb-2 pt-6 sm:pt-8">
      <div className="wrap">
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') go(index + 1);
            if (e.key === 'ArrowLeft') go(index - 1);
          }}
          onPointerDown={(e) => (swipe.current = { x: e.clientX, moved: false })}
          onPointerUp={(e) => {
            const s = swipe.current;
            if (!s) return;
            const dx = e.clientX - s.x;
            if (Math.abs(dx) > 50) {
              s.moved = true;
              go(index + (dx < 0 ? 1 : -1));
            }
          }}
          onClickCapture={(e) => {
            if (swipe.current?.moved) {
              e.preventDefault();
              swipe.current = null;
            }
          }}
        >
          <div className="grid">
            {slides.map((s, i) => {
              const active = i === index;
              return (
                <Link
                  key={s.brand}
                  href={`/collections/${s.brand}/`}
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${n}: Shop ${s.name}, ${s.count} products`}
                  aria-hidden={!active}
                  tabIndex={active ? 0 : -1}
                  data-active={active}
                  draggable={false}
                  className="hs-slide group relative isolate col-start-1 row-start-1 grid select-none overflow-hidden rounded-[24px] lg:grid-cols-[4.3fr_7.7fr]"
                  style={{ background: s.bg, '--accent': s.accent, '--on-accent': s.onAccent } as CSSProperties}
                >
                  <span aria-hidden="true" className="hs-mark pointer-events-none absolute -bottom-[0.18em] right-[-0.04em] -z-10 whitespace-nowrap text-[clamp(110px,17vw,240px)] font-extrabold leading-none tracking-[-0.06em] text-[var(--accent)] opacity-[0.16]">
                    {s.name}
                  </span>

                  <span className="flex flex-col items-start justify-center gap-4 p-6 pb-0 sm:p-10 lg:p-14 lg:pr-4">
                    <span className="hs-in flex items-center gap-3" style={{ '--d': '0.05s' } as CSSProperties}>
                      <span className="flex h-14 items-center rounded-2xl bg-white px-4 shadow-[0_1px_2px_rgba(21,23,26,.08)] sm:h-16">
                        <img src={`/brands/${s.brand}.png`} alt="" className="h-9 w-auto max-w-[150px] object-contain sm:h-11 sm:max-w-[170px]" draggable={false} />
                      </span>
                      <span className="text-sm font-medium text-ink-2">{s.count} products</span>
                    </span>
                    <span className="hs-in text-[clamp(44px,5.6vw,80px)] font-bold leading-[0.95] tracking-[-0.045em] text-ink" style={{ '--d': '0.12s' } as CSSProperties}>
                      {s.name}
                    </span>
                    <span className="hs-in max-w-[360px] text-[16px] leading-relaxed text-ink-2 sm:text-[17px]" style={{ '--d': '0.2s' } as CSSProperties}>
                      {s.tagline}
                    </span>
                    <span className="hs-in mt-1" style={{ '--d': '0.28s' } as CSSProperties}>
                      <span className="pill pill-lg fx bg-[var(--accent)] text-[var(--on-accent)]">
                        Shop {s.name}
                        <span className="pill-dot bg-[var(--on-accent)] text-[var(--accent)]">
                          <Icon name="arrow" size={15} strokeWidth={2.4} />
                        </span>
                      </span>
                    </span>
                  </span>

                  <span className="relative flex h-[230px] items-stretch justify-center px-3 pb-6 sm:h-[310px] lg:h-[460px] lg:px-6 lg:pb-10 lg:pt-10">
                    {s.products.map((p, k) => {
                      const tier = Math.abs(k - 2); // 0 = centre, 1 = beside it, 2 = outer
                      const size = ['z-30 basis-[36%] lg:basis-[28%]', 'z-20 basis-[30%] lg:basis-[23%]', 'z-10 hidden basis-[18%] sm:flex'][tier];
                      const height = ['h-full', 'h-[80%]', 'h-[62%]'][tier];
                      return (
                        <span
                          key={p.image}
                          className={`hs-prod relative flex min-w-0 shrink flex-col items-center justify-end mix-blend-multiply ${size} ${tier ? '-mx-[1.5%]' : ''}`}
                          style={{ '--d': `${0.15 + tier * 0.1 + (k > 2 ? 0.05 : 0)}s` } as CSSProperties}
                          title={p.name}
                        >
                          <span className={`relative flex w-full items-end justify-center ${height} min-h-0 flex-1`}>
                            <img
                              src={p.image}
                              alt={p.name}
                              loading={i === 0 ? 'eager' : 'lazy'}
                              draggable={false}
                              className="max-h-full w-auto max-w-full object-contain transition duration-700 group-hover:-translate-y-1.5"
                            />
                            <span aria-hidden="true" className="absolute -bottom-1.5 left-1/2 h-3 w-[60%] -translate-x-1/2 rounded-[50%] bg-ink/10 blur-md" />
                          </span>
                          <span className="mt-3 hidden items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-ink-2 sm:flex">
                            <span className="grid size-[18px] place-items-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-[var(--on-accent)]">{k + 1}</span>
                            {p.label}
                          </span>
                        </span>
                      );
                    })}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="pointer-events-none absolute right-5 top-5 hidden gap-2 lg:flex">
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous brand" className="rail-btn fx pointer-events-auto">
              <Icon name="arrow" size={16} strokeWidth={2} className="rotate-180" />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next brand" className="rail-btn fx pointer-events-auto">
              <Icon name="arrow" size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div role="tablist" aria-label="Choose a brand" className="-mx-1 mt-3 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none] sm:gap-2">
          {slides.map((s, i) => {
            const active = i === index;
            return (
              <button
                key={s.brand}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Show ${s.name}`}
                onClick={() => go(i)}
                className={`group relative flex h-11 min-w-[72px] flex-1 flex-col justify-center gap-2 text-left text-[13px] font-semibold transition sm:text-sm ${
                  active ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-line-soft">
                  {active && (
                    <span
                      key={`${index}-${still}`}
                      className="hs-progress absolute inset-0 origin-left rounded-full"
                      style={{
                        background: s.accent === '#FEBD17' ? '#15171A' : s.accent,
                        animationDuration: `${DURATION}ms`,
                        animationPlayState: paused || still ? 'paused' : 'running',
                        transform: still ? 'none' : undefined,
                      }}
                      onAnimationEnd={() => go(index + 1)}
                    />
                  )}
                </span>
                {s.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
