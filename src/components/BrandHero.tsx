'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { site, waLink } from '@/data/site';
import { Icon } from './Icons';

export type HeroSlideView = {
  label: string;
  title1: string;
  title2: string;
  text: string;
  image: string;
  focus: 'left' | 'center' | 'right';
  href: string;
  /** category name for the “Explore …” button */
  name: string;
};

const ROTATE_MS = 6500;
const d = (s: number) => ({ '--d': `${s}s` }) as CSSProperties;
const FOCUS = { left: '20% 50%', center: '50% 50%', right: '78% 50%' } as const;

/** Built-in hero photos (/images/hero/name.webp, 1536px) also exist at 800px and 1200px for phones and tablets. */
const srcSet = (src: string) =>
  /^\/images\/hero\/[\w-]+\.webp$/.test(src) && !/-(800|1200)\.webp$/.test(src)
    ? `${src.replace(/\.webp$/, '-800.webp')} 800w, ${src.replace(/\.webp$/, '-1200.webp')} 1200w, ${src} 1536w`
    : undefined;
/** How wide the photo is drawn: right-hand panel on desktop, cover-cropped under 300/420px-tall boxes on phones/tablets. */
const SIZES = '(min-width: 1024px) 1100px, (min-width: 640px) max(100vw, 630px), max(100vw, 450px)';

/**
 * Home hero: full-width slides, one per category. Each slide is a photo with the products,
 * the quote text on the left and a “Get a quote” button that opens WhatsApp with that range.
 * Moves on its own every 6.5s; arrows, dots, keyboard and swipe also work.
 */
export function BrandHero({ slides }: { slides: HeroSlideView[] }) {
  const [index, setIndex] = useState(0);
  const [hold, setHold] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const n = slides.length;
  const s = slides[index];
  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);

  useEffect(() => {
    if (hold || n < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => go(index + 1), ROTATE_MS);
    return () => window.clearTimeout(t);
  }, [index, hold, n, go]);

  // Photos load one at a time: the first with the page, the next one once the page has finished
  // loading, the rest as the slider reaches them (instead of all six up front — ~1 MB on a phone).
  const [ready, setReady] = useState(false);
  const [seen, setSeen] = useState<number[]>([0]);
  useEffect(() => {
    const on = () => setReady(true);
    if (document.readyState === 'complete') {
      const t = window.setTimeout(on, 800);
      return () => window.clearTimeout(t);
    }
    window.addEventListener('load', on, { once: true });
    return () => window.removeEventListener('load', on);
  }, []);
  useEffect(() => setSeen((v) => (v.includes(index) ? v : [...v, index])), [index]);
  const wanted = (i: number) => seen.includes(i) || (ready && i === (index + 1) % n);

  if (!s) return null;

  return (
    <section
      aria-labelledby="hero-title"
      aria-roledescription="carousel"
      className="relative isolate overflow-clip bg-ink text-white"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocusCapture={() => setHold(true)}
      onBlurCapture={() => setHold(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1);
        if (e.key === 'ArrowLeft') go(index - 1);
      }}
      onTouchStart={(e) => {
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setHold(true);
      }}
      onTouchEnd={(e) => {
        const t = touch.current;
        touch.current = null;
        setHold(false);
        if (!t) return;
        const dx = e.changedTouches[0].clientX - t.x;
        const dy = e.changedTouches[0].clientY - t.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      {/* background photos */}
      {slides.map((x, i) =>
        !wanted(i) ? null : (
        <img
          key={x.image + i}
          src={x.image}
          srcSet={srcSet(x.image)}
          sizes={srcSet(x.image) ? SIZES : undefined}
          alt={i === index ? `${x.name} from Al Faiz Hardware` : ''}
          aria-hidden={i !== index}
          fetchPriority={i === 0 ? 'high' : 'low'}
          decoding="async"
          style={{ objectPosition: FOCUS[x.focus] || FOCUS.center }}
          className={`absolute inset-x-0 top-0 -z-20 h-[300px] w-full object-cover transition-[opacity,transform] duration-[1400ms] ease-out sm:h-[420px] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[min(75%,calc(50%_+_260px))] ${
            i === index ? 'scale-100 opacity-100' : 'scale-[1.05] opacity-0'
          }`}
        />
        ),
      )}
      {/* shade so the text stays readable over any photo */}
      {/* phones/tablets: photo on top fading into the dark text panel; desktop: dark on the left behind the text */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[300px] bg-[linear-gradient(180deg,rgba(21,23,26,0)_55%,#15171a_100%)] sm:h-[420px] lg:hidden" />
      {/* desktop: the photo sits right of the text; its left edge fades into the dark panel */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-[max(25%,calc(50%_-_260px))] -z-10 hidden w-[24%] max-xl:w-[36%] bg-[linear-gradient(90deg,#15171a_0%,rgba(21,23,26,.6)_40%,rgba(21,23,26,0)_100%)] lg:block"
      />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 hidden h-40 bg-[linear-gradient(0deg,rgba(10,10,12,.55),transparent)] lg:block" />

      <div className="wrap relative flex flex-col pb-20 pt-[262px] sm:pt-[370px] lg:h-[min(680px,calc(100svh-140px))] lg:min-h-[560px] lg:justify-center lg:pb-16 lg:pt-12">
        <div key={`txt-${index}`} className="flex max-w-[640px] flex-col gap-4 sm:gap-5">
          <span className="be-in inline-flex w-fit items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-[12.5px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm" style={d(0)}>
            <span className="size-1.5 rounded-full bg-accent" />
            {s.label}
          </span>
          <h2 id="hero-title" className="be-in text-[clamp(34px,5vw,66px)] font-bold leading-[1.02] tracking-[-0.04em]" style={d(0.08)}>
            <span className="block">{s.title1}</span>
            <span className="block text-accent-bright">{s.title2}</span>
          </h2>
          <p className="be-in max-w-[520px] text-[15px] leading-relaxed text-white/80 sm:text-[17px]" style={d(0.16)}>
            {s.text}
          </p>
          <div className="be-in flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5" style={d(0.24)}>
            <a
              href={waLink(`Hello Al Faiz, I would like a quote for ${s.name}:`)}
              target="_blank"
              rel="noopener"
              className="pill pill-lg fx justify-between bg-accent text-white hover:brightness-110 max-sm:w-full"
            >
              Get a quote
              <span className="pill-dot bg-white text-accent">
                <Icon name="arrow" size={15} strokeWidth={2.4} />
              </span>
            </a>
            <Link href={s.href} className="pill pill-lg justify-center bg-white text-ink transition hover:bg-white/90 max-sm:w-full">
              Explore {s.name}
            </Link>
          </div>
          <a href={site.phoneHref} className="be-in hidden w-fit items-center gap-2 text-[14px] font-semibold text-white/70 hover:text-white sm:inline-flex" style={d(0.3)}>
            <Icon name="phone" size={15} />
            Or call {site.phone}
          </a>
        </div>

        {/* controls */}
        {n > 1 && (
          <div className="absolute inset-x-0 bottom-6 sm:bottom-7">
            <div className="wrap flex items-center justify-between gap-4">
              <ol className="flex items-center gap-1.5" aria-label="Slides">
                {slides.map((x, i) => (
                  <li key={x.image + i}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Slide ${i + 1}: ${x.name}`}
                      aria-current={i === index || undefined}
                      className="group grid h-6 place-items-center"
                    >
                      <span className={`relative block h-1 overflow-hidden rounded-full transition-all duration-500 ${i === index ? 'w-10 bg-white/25' : 'w-4 bg-white/35 group-hover:bg-white/60'}`}>
                        {i === index && !hold && <span key={`p-${index}`} className="be-timer absolute inset-0 origin-left bg-white" style={{ animationDuration: `${ROTATE_MS}ms` }} />}
                        {i === index && hold && <span className="absolute inset-0 bg-white" />}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="flex items-center gap-2">
                <span className="mr-1 hidden text-[13px] font-semibold tabular-nums text-white/60 sm:block">
                  {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                </span>
                <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="grid size-10 place-items-center rounded-lg bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white hover:text-ink">
                  <Icon name="arrow" size={16} strokeWidth={2.2} className="rotate-180" />
                </button>
                <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="grid size-10 place-items-center rounded-lg bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white hover:text-ink">
                  <Icon name="arrow" size={16} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
